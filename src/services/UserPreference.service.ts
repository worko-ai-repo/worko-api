
// Import dynamoose types
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import daos
import { userPreferenceDaoObj } from "../daos/UserPreference.dao";

// Import dtos
import { UserPreferenceCommonUpdateDto, UserPreferenceCreateOrUpdateApiDto, UserPreferenceCreateDto, } from "../dtos/UserPreference.dto";

// Import helpers
import { userAuthorization } from "../helpers/user.helper";

// Import models
import { DbUserPreferenceDto } from "../db/models/UserPreference.model";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

class UserPreferenceService {
  private async checkUserPreferenceAuthorization(
    cognitoUserId: string,
    requestedEmail: string,
  ): Promise<void> {
    const isAuthorized: boolean = await userAuthorization(
      cognitoUserId,
      requestedEmail
    );

    if (!isAuthorized) {
      throw new BaseError("Unauthorized", HttpStatusCode.UNAUTHORIZED_401);
    }
  }

  async createOrUpdateUserPreference(
    requestBody: UserPreferenceCreateOrUpdateApiDto
  ): Promise<DbUserPreferenceDto> {
    global.logger.info("Create user preference [Service]");

    const cognitoUserId: string = global.requestLocalContext.userId;

    await this.checkUserPreferenceAuthorization(
      cognitoUserId,
      requestBody.email
    );

    const existingUserPreference: QueryResponse<DbUserPreferenceDto> = await this.getUserPreferenceByEmail(requestBody.email);

    if (existingUserPreference.count) {
      const existingUserPreferenceData: DbUserPreferenceDto = existingUserPreference[0];

      if (existingUserPreferenceData.createdByUserId !== cognitoUserId) {
        global.logger.error("Unauthorized to update user preference", {
          methodName: this.createUserPreference.name,
          error: "Unauthorized to update user preference",
          userPreferenceCreatedByUserId: existingUserPreferenceData.createdByUserId,
          cognitoUserId: cognitoUserId,
        });

        throw new BaseError("Unauthorized", HttpStatusCode.UNAUTHORIZED_401);
      }

      // Exclude email from the update data because no need to update email again
      const {email, ...updateData} = requestBody;

      const finalUpdateData: Partial<UserPreferenceCommonUpdateDto> = {
        ...updateData,
        updatedByUserId: cognitoUserId,
      };

      return this.updateUserPreference(email, finalUpdateData);
    }

    const userPreferenceData: UserPreferenceCreateDto = {
      ...requestBody,
      createdByUserId: global.requestLocalContext.userId,
    };

    return this.createUserPreference(userPreferenceData);
  }

  async createUserPreference(userPreferenceData: UserPreferenceCreateDto): Promise<DbUserPreferenceDto> {
    global.logger.info("Create user preference [Service]");
    return userPreferenceDaoObj.createUserPreference(userPreferenceData);
  }

  async getUserPreferenceByEmail(
    email: string
  ): Promise<QueryResponse<DbUserPreferenceDto>> {
    global.logger.info("Get user preference [Service]");
    return userPreferenceDaoObj.getUserPreferenceByEmail(email);
  }

  async getUserPreferenceBasicDetails(email: string): Promise<QueryResponse<DbUserPreferenceDto>> {
    global.logger.info("Get user preference basic details [Service]");
    return userPreferenceDaoObj.getUserPreferenceBasicDetails(email);
  }

  async updateUserPreference(
    email: string,
    updateData: Partial<UserPreferenceCommonUpdateDto>
  ): Promise<DbUserPreferenceDto> {
    global.logger.info("Update user preference [Service]");
    return userPreferenceDaoObj.updateUserPreference(email, updateData);
  }
}

const userPreferenceServiceObj: UserPreferenceService = new UserPreferenceService();
export { userPreferenceServiceObj, UserPreferenceService };