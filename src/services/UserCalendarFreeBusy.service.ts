import ical from "node-ical";
import { uuidToULID } from "ulidx";
import { CorporateUserModel } from "../db/models/CorporateUser.model";
import { CorporateUserInviteModel } from "../db/models/CorporateUserInvite.model";
import { UserDetailModel } from "../db/models/UserDetail.model";
import { DbCorporateUserDto } from "../db/models/CorporateUser.model";
import { DbCorporateUserInviteDto } from "../db/models/CorporateUserInvite.model";
import { DbUserDetailDto } from "../db/models/UserDetail.model";
import { corporateUserDaoObj } from "../daos/CorporateUser.dao";
import { userServiceObj } from "../admin/services/User.service";
import { corporateUserInviteServiceObj } from "../services/CorporateUserInvite.service";
import { corporateUserServiceObj } from "../services/CorporateUser.service";
import userDetailDao from "../daos/UserDetail.dao";
import { PaginatedResultsWithMatchingConditionsResponse } from "../dtos/Common.dto";
import {
  FreeBusyAttendeeDto,
  FreeBusyBatchQueryItem,
} from "../dtos/UserCalendarFreeBusy.dto";
import { SortOrderTypeEnum } from "../enums/Common.enum";
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

export interface BusySlot {
  start: Date;
  end: Date;
}

export interface UserBusy {
  id: string;
  name: string;
  email: string;
  busySlots: BusySlot[];
}

export interface FreeBusyResponse {
  success: boolean;
  totalBusySlots: number;
  users: UserBusy[];
}

interface ResolvedUserCalendarDetails {
  icalUrl: string | null;
  userId: string;
  userName: string;
}

const FREE_BUSY_LOOKUP_PAGE_SIZE = 10;

class UserCalendarFreeBusyService {
  private extractRecordsFromPaginatedResponse<T>(
    response: PaginatedResultsWithMatchingConditionsResponse<T>
  ): T[] {
    const { lastKey, count, timesQueried, queriedCount, ...records } = response;
    return Object.values(records) as T[];
  }

  private findExactEmailMatch<T extends { email: string }>(
    records: T[],
    userEmail: string
  ): T | undefined {
    const normalizedEmail = userEmail.toLowerCase();
    return records.find((record) => record.email?.toLowerCase() === normalizedEmail);
  }

  /**
   * Saves or updates the icalUrl for a user.
   * Checks CorporateUser, CorporateUserInvite, and UserDetail tables.
   */
  async saveIcalUrl(userId: string, userEmail: string, icalUrl: string): Promise<void> {
    global.logger.info(`Saving icalUrl for user: ${userId}, email: ${userEmail} [SERVICE]`);

    try {
      new URL(icalUrl);
    } catch (err) {
      throw new BaseError(
        "The calendar link is not a valid URL. Please check the format.",
        HttpStatusCode.BAD_REQUEST_400
      );
    }

    try {
      await ical.async.fromURL(icalUrl);
    } catch (err) {
      global.logger.error(`Validation failed for iCal URL: ${icalUrl}`, err);
      throw new BaseError(
        "The provided calendar link is bad. Please change the URL.",
        HttpStatusCode.BAD_REQUEST_400
      );
    }

    let updated = false;

    try {
      const corporateUserUlid = uuidToULID(userId);
      const corpUserQuery = await corporateUserDaoObj.getById(corporateUserUlid);
      if (corpUserQuery.count && corpUserQuery[0]) {
        const corpUser = corpUserQuery[0];
        await CorporateUserModel.update(
          { PK: corpUser.PK, SK: corpUser.SK },
          { icalFreeBusyUrl: icalUrl }
        );
        updated = true;
        global.logger.info(`Updated icalUrl in CorporateUser for ULID: ${corporateUserUlid}`);
      }
    } catch (err) {
      global.logger.error("Error updating icalUrl in CorporateUser: ", err);
    }

    if (userEmail) {
      try {
        const invites = await this.getCorporateInvitesByEmail(userEmail);
        for (const invite of invites) {
          await CorporateUserInviteModel.update(
            { PK: invite.PK, SK: invite.SK },
            { icalFreeBusyUrl: icalUrl }
          );
          updated = true;
          global.logger.info(
            `Updated icalUrl in CorporateUserInvite by email: ${invite.email}`
          );
        }
      } catch (err) {
        global.logger.error("Error updating icalUrl in CorporateUserInvite: ", err);
      }
    }

    try {
      const userDetails = await userDetailDao.getUserById(userId);
      if (userDetails.count && userDetails[0]) {
        const userDetail = userDetails[0];
        await UserDetailModel.update(
          { PK: userDetail.PK, SK: userDetail.SK },
          { icalFreeBusyUrl: icalUrl }
        );
        updated = true;
        global.logger.info(`Updated icalUrl in UserDetail for userId: ${userId}`);
      }
    } catch (err) {
      global.logger.error("Error updating icalUrl in UserDetail: ", err);
    }

    if (!updated) {
      global.logger.warn(
        `No record found in CorporateUser, CorporateUserInvite, or UserDetail for userId: ${userId}, email: ${userEmail}`
      );
      throw new BaseError(
        "User not found in the database to associate the calendar link.",
        HttpStatusCode.NOT_FOUND_404
      );
    }
  }

  /**
   * Retrieves the icalFreeBusyUrl for a user by userId and/or email.
   */
  async getIcalUrl(userId: string, userEmail: string): Promise<string | null> {
    if (userEmail) {
      const details = await this.getUserDetailsByEmail(userEmail);
      if (details.icalUrl) {
        return details.icalUrl;
      }
    }

    try {
      const corporateUserUlid = uuidToULID(userId);
      const corpUserQuery = await corporateUserDaoObj.getById(corporateUserUlid);
      if (corpUserQuery.count && corpUserQuery[0]?.icalFreeBusyUrl) {
        return corpUserQuery[0].icalFreeBusyUrl;
      }
    } catch (err) {
      global.logger.error("Error fetching icalUrl from CorporateUser: ", err);
    }

    try {
      const userDetails = await userDetailDao.getUserById(userId);
      if (userDetails.count && userDetails[0]?.icalFreeBusyUrl) {
        return userDetails[0].icalFreeBusyUrl;
      }
    } catch (err) {
      global.logger.error("Error fetching icalUrl from UserDetail: ", err);
    }

    return null;
  }

  /**
   * Parses busy slots from an ical URL.
   */
async getBusySlots(icalUrl: string, rangeStart: Date, rangeEnd: Date): Promise<BusySlot[]> {
  const busySlots: BusySlot[] = [];
  try {
    const data = await ical.async.fromURL(icalUrl);
    
    for (const key in data) {
      const event = data[key];
      if (!event || event.type !== 'VEVENT') continue;

      // Skip events outside your query range
      const start = new Date(event.start);
      const end = new Date(event.end || event.start);

      if (end < rangeStart || start > rangeEnd) continue;

      // Deduplicate: skip if this exact slot is already recorded
      const isDuplicate = busySlots.some(
        s => s.start.getTime() === start.getTime() && s.end.getTime() === end.getTime()
      );
      if (isDuplicate) continue;

      busySlots.push({ start, end });
    }

    busySlots.sort((a, b) => a.start.getTime() - b.start.getTime());
  } catch (error) {
    global.logger.error(`Failed to parse ICS URL: ${icalUrl}`, error);
  }
  return busySlots;
}


  private async getCorporateInvitesByEmail(
    userEmail: string
  ): Promise<DbCorporateUserInviteDto[]> {
    const inviteResponse = await corporateUserInviteServiceObj.getAllInvites({
      searchText: userEmail.toLowerCase(),
      pageSize: FREE_BUSY_LOOKUP_PAGE_SIZE,
      sortOrder: SortOrderTypeEnum.DESCENDING,
    });

    const invites = this.extractRecordsFromPaginatedResponse(inviteResponse);
    const exactMatch = this.findExactEmailMatch(invites, userEmail);
    return exactMatch ? [exactMatch] : [];
  }

  private async getCorporateUserByEmail(
    userEmail: string
  ): Promise<DbCorporateUserDto | undefined> {
    const corporateUserResponse = await corporateUserServiceObj.getAllCorpUsers({
      searchText: userEmail.toLowerCase(),
      pageSize: FREE_BUSY_LOOKUP_PAGE_SIZE,
      sortOrder: SortOrderTypeEnum.DESCENDING,
    });

    const corporateUsers = this.extractRecordsFromPaginatedResponse(corporateUserResponse);
    return this.findExactEmailMatch(corporateUsers, userEmail);
  }

  private mapUserDetailToCalendarDetails(user: DbUserDetailDto): ResolvedUserCalendarDetails {
    return {
      icalUrl: user.icalFreeBusyUrl || null,
      userId: user.id || "",
      userName: user.name || "",
    };
  }

  private mapCorporateUserToCalendarDetails(
    user: DbCorporateUserDto
  ): ResolvedUserCalendarDetails {
    return {
      icalUrl: user.icalFreeBusyUrl || null,
      userId: user.cognitoUserId || user.id || "",
      userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    };
  }

  private mapCorporateInviteToCalendarDetails(
    invite: DbCorporateUserInviteDto
  ): ResolvedUserCalendarDetails {
    return {
      icalUrl: invite.icalFreeBusyUrl || null,
      userId: invite.evaluatorCognitoUserId || invite.id || "",
      userName: `${invite.firstName || ""} ${invite.lastName || ""}`.trim(),
    };
  }

  /**
   * Retrieves user details (icalFreeBusyUrl, userId, userName) by email.
   */
  async getUserDetailsByEmail(userEmail: string): Promise<ResolvedUserCalendarDetails> {
    const normalizedEmail = userEmail.toLowerCase().trim();

    try {
      const userDetails = await userServiceObj.getUserDetailByEmail(normalizedEmail);
      if (userDetails.count && userDetails[0]) {
        return this.mapUserDetailToCalendarDetails(userDetails[0]);
      }
    } catch (err) {
      global.logger.error("Error fetching admin user details by email: ", err);
    }

    try {
      const corporateUser = await this.getCorporateUserByEmail(normalizedEmail);
      if (corporateUser) {
        return this.mapCorporateUserToCalendarDetails(corporateUser);
      }
    } catch (err) {
      global.logger.error("Error fetching CorporateUser by email: ", err);
    }

    try {
      const invites = await this.getCorporateInvitesByEmail(normalizedEmail);
      if (invites.length > 0) {
        return this.mapCorporateInviteToCalendarDetails(invites[0]);
      }
    } catch (err) {
      global.logger.error("Error fetching CorporateUserInvite by email: ", err);
    }

    return { icalUrl: null, userId: "", userName: "" };
  }

  /**
   * Batch get free-busy slots for multiple users resolved by email.
   */
  async getBatchFreeBusy(usersPayload: FreeBusyBatchQueryItem[]): Promise<FreeBusyResponse> {
    const users: UserBusy[] = [];
    let totalBusySlots = 0;

    const userPromises = usersPayload.map(async (item) => {
      const email =
        typeof item === "string" ? item.trim().toLowerCase() : item.userEmail.trim().toLowerCase();
      const payloadName =
        typeof item === "string" ? "" : String(item.userName ?? "").trim();

      const dbDetails = await this.getUserDetailsByEmail(email);

      const userId = dbDetails.userId || email;
      const userName = payloadName || dbDetails.userName || email.split("@")[0] || "";

      let busySlots: BusySlot[] = [];
      if (dbDetails.icalUrl) {
        busySlots = await this.getBusySlots(dbDetails.icalUrl || "", new Date(), new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)); // Look 6 months ahead for busy slots by default, can be adjusted as needed
      }

      return {
        id: userId,
        name: userName,
        email,
        busySlots,
      };
    });

    const resolvedUsers = await Promise.all(userPromises);
    resolvedUsers.forEach((u) => {
      users.push(u);
      totalBusySlots += u.busySlots.length;
    });

    return {
      success: true,
      totalBusySlots,
      users,
    };
  }
}

export const userCalendarFreeBusyServiceObj = new UserCalendarFreeBusyService();
export default UserCalendarFreeBusyService;
