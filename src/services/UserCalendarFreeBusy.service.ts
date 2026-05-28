import ical from "node-ical";
import { uuidToULID } from "ulidx";
import { CorporateUserModel } from "../db/models/CorporateUser.model";
import { CorporateUserInviteModel } from "../db/models/CorporateUserInvite.model";
import { UserDetailModel } from "../db/models/UserDetail.model";
import { corporateUserDaoObj } from "../daos/CorporateUser.dao";
import { corporateInviteDaoObj } from "../daos/CorporateUserInvite.dao";
import userDetailDao from "../daos/UserDetail.dao";
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

class UserCalendarFreeBusyService {
  /**
   * Saves or updates the icalUrl for a user.
   * Checks CorporateUser, CorporateUserInvite, and UserDetail tables.
   */
  async saveIcalUrl(userId: string, userEmail: string, icalUrl: string): Promise<void> {
    global.logger.info(`Saving icalUrl for user: ${userId}, email: ${userEmail} [SERVICE]`);

    let updated = false;

    // 1. Try to find/update in CorporateUser table
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

    // 2. Try to find/update in CorporateUserInvite (for evaluators)
    try {
      // Find invites where evaluatorCognitoUserId matches
      const invites = await CorporateUserInviteModel.scan("evaluatorCognitoUserId").eq(userId).exec();
      if (invites && invites.length > 0) {
        for (const invite of invites) {
          await CorporateUserInviteModel.update(
            { PK: invite.PK, SK: invite.SK },
            { icalFreeBusyUrl: icalUrl }
          );
          updated = true;
          global.logger.info(`Updated icalUrl in CorporateUserInvite by evaluatorCognitoUserId for email: ${invite.email}`);
        }
      }

      // Also try email matching if not updated
      const invitesByEmail = await CorporateUserInviteModel.scan("email").eq(userEmail).exec();
      if (invitesByEmail && invitesByEmail.length > 0) {
        for (const invite of invitesByEmail) {
          await CorporateUserInviteModel.update(
            { PK: invite.PK, SK: invite.SK },
            { icalFreeBusyUrl: icalUrl }
          );
          updated = true;
          global.logger.info(`Updated icalUrl in CorporateUserInvite by email: ${userEmail}`);
        }
      }
    } catch (err) {
      global.logger.error("Error updating icalUrl in CorporateUserInvite: ", err);
    }

    // 3. Try to find/update in UserDetail
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
      global.logger.warn(`No record found in CorporateUser, CorporateUserInvite, or UserDetail for userId: ${userId}, email: ${userEmail}`);
      throw new BaseError("User not found in the database to associate the calendar link.", HttpStatusCode.NOT_FOUND_404);
    }
  }

  /**
   * Retrieves the icalFreeBusyUrl for a user.
   */
  async getIcalUrl(userId: string, userEmail: string): Promise<string | null> {
    // 1. Try CorporateUser
    try {
      const corporateUserUlid = uuidToULID(userId);
      const corpUserQuery = await corporateUserDaoObj.getById(corporateUserUlid);
      if (corpUserQuery.count && corpUserQuery[0]?.icalFreeBusyUrl) {
        return corpUserQuery[0].icalFreeBusyUrl;
      }
    } catch (err) {
      global.logger.error("Error fetching icalUrl from CorporateUser: ", err);
    }

    // 2. Try CorporateUserInvite
    try {
      const invites = await CorporateUserInviteModel.scan("evaluatorCognitoUserId").eq(userId).exec();
      if (invites && invites.length > 0 && invites[0].icalFreeBusyUrl) {
        return invites[0].icalFreeBusyUrl;
      }

      const invitesByEmail = await CorporateUserInviteModel.scan("email").eq(userEmail).exec();
      if (invitesByEmail && invitesByEmail.length > 0 && invitesByEmail[0].icalFreeBusyUrl) {
        return invitesByEmail[0].icalFreeBusyUrl;
      }
    } catch (err) {
      global.logger.error("Error fetching icalUrl from CorporateUserInvite: ", err);
    }

    // 3. Try UserDetail
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
  async getBusySlots(icalUrl: string): Promise<BusySlot[]> {
    const busySlots: BusySlot[] = [];
    try {
      const data = await ical.async.fromURL(icalUrl);
       for (const key in data) {
        const event = data[key];
        if (event && event.type === "VEVENT") {
          busySlots.push({
            start: event.start,
            end: event?.end || event.start, // If end is missing, use start time as end time
          });
        }
      }
      busySlots.sort((a, b) => a.start.getTime() - b.start.getTime());
    } catch (error) {
      global.logger.error(`Failed to parse ICS URL: ${icalUrl}`, error);
    }
    return busySlots;
  }

  /**
   * Batch get free-busy slots for multiple users.
   */
  async getBatchFreeBusy(
    usersPayload: Array<{ userId: string; userEmail: string; userName: string }>
  ): Promise<FreeBusyResponse> {
    const users: UserBusy[] = [];
    let totalBusySlots = 0;

    const userPromises = usersPayload.map(async (user) => {
      const icalUrl = await this.getIcalUrl(user.userId, user.userEmail);
      let busySlots: BusySlot[] = [];
      if (icalUrl) {
        busySlots = await this.getBusySlots(icalUrl);
      }
      return {
        id: user.userId,
        name: user.userName,
        email: user.userEmail,
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
