
// Import dynamoose types
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import daos
import BaseDao from "./Base.dao";

// Import dtos
import { UserDetailSettingCreateApiDTO } from "../dtos/User.dto";

// Import models
import { DbUserDetailSettingDto, UserDetailSettingModel } from "../db/models/UserDetailSetting.model";

// import services
import UlidService from "../services/Ulid.service";

/**
 * UserDetailSettingDao
 */
class UserDetailSettingDao implements BaseDao {
  modelName = "UserDetailSetting";
  partitianKey = "USR#EML#{primaryEmail}"; // Partition key format
  sortKeys = { SK_INIT: "CAND#SETTINGS#" };

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
    // logger
    global.logger.info(`Create user detail settings [Dao]`, {
      methodName: this.createUserDetailSetting.name,
    });

    const ulidId: string = UlidService.getUlidId();

    return UserDetailSettingModel.create({
      PK: this.partitianKey.strtr({
        "{primaryEmail}": email,
      }),
      SK: this.sortKeys.SK_INIT,
      id: ulidId,
      subscribedEmailId: validatedRequestBody.subscribedEmailId ?? email,
      jobNotification: true,
    });
  }

  /**
   * getUserDetailSettingByEmail
   *
   * @param {string} email
   * @returns {Promise<QueryResponse<DbUserDetailSettingDto>>}
   */
  async getUserDetailSettingByEmail(
    email: string
  ): Promise<QueryResponse<DbUserDetailSettingDto>> {
    global.logger.info(`Get user detail settings [Dao]`, {
      methodName: this.getUserDetailSettingByEmail.name,
    });
    return UserDetailSettingModel.query("PK")
      .eq(this.partitianKey.strtr({ "{primaryEmail}": email }))
      .where("SK")
      .beginsWith(this.sortKeys.SK_INIT)
      .exec();
  }
}

const userDetailSettingDaoObj = new UserDetailSettingDao();
export { userDetailSettingDaoObj, UserDetailSettingDao };
