
// Import daos
import BaseDao from "./Base.dao";

// Import dtos
import { UserGuidanceRequestCreateApiDTO } from "../dtos/User.dto";

// Import db models
import { DbUserGuidanceRequestDto, UserGuidanceRequestModel } from "../db/models/UserGuidanceRequest.model";

// Import services
import UlidService from "../services/Ulid.service";

/**
 * UserGuidanceRequestDao
 */
class UserGuidanceRequestDao implements BaseDao {
  modelName = "UserGuidanceRequest";
  partitianKey = "USR#EML#{primaryEmail}";
  sortKeys = { SK_INIT: "GUIDANCE#RQST#ID#{id}" }; // `id` is the generated ulid
  GSI1PK = "GUIDANCE#RQST#";
  GSI1SK = "ID#{id}"; // `id` is the generated ulid

  /**
   * createUserGuidanceRequest
   * 
   * Creates a new user guidance request in the database
   *
   * @param {string} cognitoUserId - the id of the user who is creating the request
   * @param {string} email - the email of the user who is creating the request
   * @param {UserGuidanceRequestCreateApiDTO} validatedRequestBody - the data required to create the user guidance request
   * @returns {Promise<DbUserGuidanceRequestDto>} - a promise that resolves to the newly created user guidance request
   */
  async createUserGuidanceRequest(
    cognitoUserId: string,
    email: string,
    validatedRequestBody: UserGuidanceRequestCreateApiDTO
  ): Promise<DbUserGuidanceRequestDto> {
    // logger
    global.logger.info("Create User Guidance Request [dao]", {
      cognitoUserId,
      email,
      methodName: this.createUserGuidanceRequest.name,
    });

    // Generate a unique id
    const ulidId: string = UlidService.getUlidId();

    // Prepare data required to create a new user guidance request
    const userGuidanceRequestData = {
      ...validatedRequestBody,
      id: ulidId,
      PK: this.partitianKey.strtr({
        "{primaryEmail}": email,
      }),
      SK: this.sortKeys.SK_INIT.strtr({
        "{id}": ulidId,
      }),
      GSI1PK: this.GSI1PK,
      GSI1SK: this.GSI1SK.strtr({
        "{id}": ulidId,
      }),
      createdByUserId: cognitoUserId,
    };

    return UserGuidanceRequestModel.create(userGuidanceRequestData);
  }
}

const userGuidanceRequestDaoObj = new UserGuidanceRequestDao();
export {
   userGuidanceRequestDaoObj,
   UserGuidanceRequestDao
}