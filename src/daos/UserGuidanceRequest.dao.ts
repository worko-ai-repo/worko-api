//Import dynamoose
import { Query, QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import daos
import BaseDao from "./Base.dao";

// Import dtos
import { PaginatedResultsWithMatchingConditionsResponse } from "../dtos/Common.dto";
import {
  UserGuidanceRequestCreateApiDTO,
  UserGuidanceRequestFilterOptions,
  UserGuidanceRequestCommonUpdateDto,
} from "../dtos/UserGuidanceRequest.dto";

// Import enums
import { UserType } from "../enums/User.enum";
import { UserGuidanceRequestStatusEnum } from "../enums/UserGuidanceRequest.enum";

// Import db models
import {
  DbUserGuidanceRequestDto,
  UserGuidanceRequestModel,
} from "../db/models/UserGuidanceRequest.model";

// Import enums
import { SortOrderTypeEnum } from "../enums/Common.enum";

// Import helpers
import { getPaginatedResultsWithMatchingConditions } from "../helpers/dynamoose.helper";
import { dateHelperObj } from "../helpers/date.helper";

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

  preparePKAndSKForQuery(
    primaryEmail: string,
    id: string
  ): {
    PK: string;
    SK: string;
  } {
    return {
      PK: this.partitianKey.strtr({
        "{primaryEmail}": primaryEmail,
      }),
      SK: this.sortKeys.SK_INIT.strtr({
        "{id}": id,
      }),
    };
  }

  prepareGSI1PKAndGSI1SKForQuery(id: string): {
    GSI1PK: string;
    GSI1SK: string;
  } {
    return {
      GSI1PK: this.GSI1PK,
      GSI1SK: this.GSI1SK.strtr({
        "{id}": id,
      }),
    };
  }

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
      status: UserGuidanceRequestStatusEnum.PENDING,
      statusTracker: [
        {
          newStatus: UserGuidanceRequestStatusEnum.PENDING,
          actionDate: dateHelperObj.getISODate(),
          actionByUserId: cognitoUserId,
          actionByUserType: UserType.CAND,
        },
      ],
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

    if(userGuidanceRequestBody.mentorId) {
      query = query
        .where("mentorDetails.userId")
        .eq(userGuidanceRequestBody.mentorId);
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

    if (userGuidanceRequestBody.searchText) {
      // remove trailing and leading spaces from the search text
      let searchTextValue: string = userGuidanceRequestBody.searchText
        .trim()
        .toLowerCase();

      /* 
      The and() method initiates a condition block where all conditions within it must be satisfied.
      The parenthesis() method allows grouping of conditions for complex queries.
      */
      query = query.and().parenthesis((condition) => {
        condition
          .where("companyName")
          .contains(searchTextValue);

        // Return the built condition
        return condition;
      });
    }

    // Execute the query by applying the pagination helper and return the results
    return getPaginatedResultsWithMatchingConditions<
      DbUserGuidanceRequestDto,
      UserGuidanceRequestFilterOptions
    >(query, userGuidanceRequestBody);
  }

  async getUserGuidanceRequestById(
    userGuidanceRequestId: string
  ): Promise<QueryResponse<DbUserGuidanceRequestDto>> {
    // logger
    global.logger.info("Get User Guidance Request by Id [dao]", {
      methodName: this.getUserGuidanceRequestById.name,
      userGuidanceRequestId,
    });

    const { GSI1PK, GSI1SK } = this.prepareGSI1PKAndGSI1SKForQuery(
      userGuidanceRequestId
    );

    return UserGuidanceRequestModel.query("GSI1PK")
      .eq(GSI1PK)
      .where("GSI1SK")
      .eq(GSI1SK)
      .exec();
  }

  async updateUserGuidanceRequestByIdAndEmail(
    userGuidanceRequestId: string,
    email: string,
    updateData: Partial<UserGuidanceRequestCommonUpdateDto>
  ): Promise<DbUserGuidanceRequestDto> {
    // logger
    global.logger.info("Update User Guidance Request by Id and Email [dao]", {
      methodName: this.updateUserGuidanceRequestByIdAndEmail.name,
      userGuidanceRequestId,
      email,
      updateData,
    });

    const { PK, SK } = this.preparePKAndSKForQuery(
      email,
      userGuidanceRequestId
    );

    return UserGuidanceRequestModel.update({ PK: PK, SK: SK }, updateData);
  }
}

const userGuidanceRequestDaoObj = new UserGuidanceRequestDao();
export { userGuidanceRequestDaoObj, UserGuidanceRequestDao };
