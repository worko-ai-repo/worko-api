
// Import dynamoose types
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import dtos
import { UserDetailSettingCreateApiDTO } from "../dtos/User.dto";

// Import daos
import { userDetailSettingDaoObj } from "../daos/UserDetailSetting.dao";

// Import models
import { DbUserDetailSettingDto } from "../db/models/UserDetailSetting.model";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 * UserDetailSettingService
 */
class UserDetailSettingService {
  /**
   * createUserDetailSetting
   *
   * @param {string} email
   * @param {UserDetailSettingCreateApiDTO} validatedRequestBody
   * @returns {Promise<DbUserDetailSettingDto>}
   */
  async createUserDetailSetting(
    email: string,
    validatedRequestBody: UserDetailSettingCreateApiDTO
  ): Promise<DbUserDetailSettingDto> {
    global.logger.info(`Create user detail setting [service]`, {
      methodName: this.createUserDetailSetting.name,
    });

    /**
     * @todo: If user wants to subscribe with different email then,
     * we need to discuss about it with management and team lead.
     */
    const existingUserDetailSetting: QueryResponse<DbUserDetailSettingDto> =
      await userDetailSettingDaoObj.getUserDetailSettingByEmail(email);
    if (existingUserDetailSetting.count) {
      throw new BaseError(
        `User detail setting already exists for email ${email}. Please check the information and try again.`,
        HttpStatusCode.CONFLICT_409
      );
    }

    return userDetailSettingDaoObj.createUserDetailSetting(
      email,
      validatedRequestBody
    );
  }
}

const userDetailSettingServiceObj = new UserDetailSettingService();
export { userDetailSettingServiceObj, UserDetailSettingService };