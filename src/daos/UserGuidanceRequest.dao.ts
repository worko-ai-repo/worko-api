//Import dynamoose
import { Query } from "dynamoose/dist/ItemRetriever";

// Import daos
import BaseDao from "./Base.dao";

// Import dtos
import { PaginatedResultsWithMatchingConditionsResponse } from "../dtos/Common.dto";
import {
  UserGuidanceRequestCreateApiDTO,
  UserGuidanceRequestFilterOptions,
} from "../dtos/User.dto";

// Import db models
import {
  DbUserGuidanceRequestDto,
  UserGuidanceRequestModel,
} from "../db/models/UserGuidanceRequest.model";

// Import enums
import { SortOrderTypeEnum } from "../enums/Common.enum";

// Import helpers
import { getPaginatedResultsWithMatchingConditions } from "../helpers/dynamoose.helper";

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

  /**
   * getAllUserGuidanceRequestByFilterOptions
   *
   * Retrieves all user guidance requests based on the provided filter options.
   *
   * @param {UserGuidanceRequestFilterOptions} userGuidanceRequestBody - The filter options for querying user guidance requests.
   * @returns {Promise<PaginatedResultsWithMatchingConditionsResponse<DbUserGuidanceRequestDto>>} A promise that resolves to a paginated response containing the matching user guidance requests.
   *
   */
  async getAllUserGuidanceRequestByFilterOptions(
    userGuidanceRequestBody: UserGuidanceRequestFilterOptions
  ): Promise<
    PaginatedResultsWithMatchingConditionsResponse<DbUserGuidanceRequestDto>
  > {
    // logger
    global.logger.info("Get User Guidance Request by Filter Options [dao]", {
      methodName: this.getAllUserGuidanceRequestByFilterOptions.name,
      userGuidanceRequestBody,
    });

    let query: Query<DbUserGuidanceRequestDto>;
    if (userGuidanceRequestBody.email) {
      query = UserGuidanceRequestModel.query("PK")
        .eq(
          this.partitianKey.strtr({
            "{primaryEmail}": userGuidanceRequestBody.email,
          })
        )
        .where("SK")
        .beginsWith(this.sortKeys.SK_INIT.strtr({ "{id}": "" }));
    } else {
      query = UserGuidanceRequestModel.query("GSI1PK")
        .eq(this.GSI1PK)
        .where("GSI1SK")
        .beginsWith(this.GSI1SK.strtr({ "{id}": "" }));
    }

    // Sort the results based on the provided sort order
    query = query.sort(
      userGuidanceRequestBody.sortOrder ?? SortOrderTypeEnum.DESCENDING
    );

    // Apply status filter if provided
    if (userGuidanceRequestBody.guidanceRequestType) {
      query = query
        .where("guidanceRequestType")
        .eq(userGuidanceRequestBody.guidanceRequestType);
    }

    // Apply date range filter if provided
    if (userGuidanceRequestBody.fromDate || userGuidanceRequestBody.toDate) {
      query = query.and().parenthesis((condition) => {
        if (userGuidanceRequestBody.fromDate) {
          condition = condition
            .where("createdAt")
            .ge(userGuidanceRequestBody.fromDate);
        }
        if (userGuidanceRequestBody.toDate) {
          condition = condition
            .where("createdAt")
            .le(userGuidanceRequestBody.toDate);
        }
        return condition;
      });
    }
    // Execute the query by applying the pagination helper and return the results
    return getPaginatedResultsWithMatchingConditions<
      DbUserGuidanceRequestDto,
      UserGuidanceRequestFilterOptions
    >(query, userGuidanceRequestBody);
  }
}

const userGuidanceRequestDaoObj = new UserGuidanceRequestDao();
export { userGuidanceRequestDaoObj, UserGuidanceRequestDao };
