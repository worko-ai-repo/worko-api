// import required Npm packages
import { QueryResponse } from "dynamoose/dist/ItemRetriever";
import { Query } from "dynamoose/dist/ItemRetriever";

// Import the base dao
import BaseDao from "./Base.dao";

// Import the dtos
import {
  UserSupportCreateDto,
  UserSupportFilterDto,
  UserSupportUpdateApiDto,
} from "../dtos/UserSupport.dto";
import { UserSupportListingFilterOptions } from "../admin/dtos/UserSupport.dto";
import { PaginatedResultsWithMatchingConditionsResponse } from "../dtos/Common.dto";

// Import the enums
import { SortOrderTypeEnum } from "../enums/Common.enum";

// Import the helpers
import { getPaginatedResultsWithMatchingConditions } from "../helpers/dynamoose.helper";

// Import the models
import {
  DbUserSupportDto,
  UserSupportModel,
} from "../db/models/UserSupport.model";

// Import the services
import UlidService from "../services/Ulid.service";

/**
 * UserSupportDao
 *

/**
 * UserSupportDao
 * 
 * Class responsible for managing user support related operations and communicating with DynamoDb
 */
class UserSupportDao implements BaseDao {
  modelName: string = "UserSupport";

  partitianKey: string = "USR#EML#{emailId}";
  sortKeys: { SK_INIT: string } = {
    SK_INIT: "SPRT#{id}",
  };

  GSI1PK: string = "SPRT#";
  GSI1SK = "ID#{id}";

  /**
   * getSupportRequests
   *
   * Retrieves support requests from the database based on the provided filter options.
   *
   * @param {UserSupportListingFilterOptions} supportFilterOptions - The filter options to apply when retrieving the support requests.
   */
  async getSupportRequests(
    supportFilterOptions: UserSupportListingFilterOptions
  ): Promise<PaginatedResultsWithMatchingConditionsResponse<DbUserSupportDto>> {
    // Log the action of getting support requests in the dao
    global.logger.info("Get support requests [admin dao]");

    // Prepare the query and define data type
    let query: Query<DbUserSupportDto>;

    // Check if userEmail is provided, then use the appropriate partition key
    if (supportFilterOptions.userEmail) {
      const PK = this.partitianKey.replace(
        "{emailId}",
        supportFilterOptions.userEmail
      );
      const SK = this.sortKeys.SK_INIT.split("#")[0];
      console.log(SK);
      // Construct Query based on user email
      query = UserSupportModel.query("PK").eq(PK).where("SK").beginsWith(SK);
    } else {
      query = UserSupportModel.query("GSI1PK").eq(this.GSI1PK);
    }

    // Add additional filters if provided
    if (supportFilterOptions.status) {
      query = query.where("status").eq(supportFilterOptions.status);
    }

    if (supportFilterOptions.userSupportType) {
      // Filter by user support type (free text search)
      query = query
        .where("userSupportType")
        .contains(supportFilterOptions.userSupportType);
    }

    if (supportFilterOptions.contextType) {
      // Filter by context type (free text search)
      query = query.where("contextType").eq(supportFilterOptions.contextType);
    }

    if (supportFilterOptions.contextId) {
      // Filter by context ID (free text search)
      query = query.where("contextId").eq(supportFilterOptions.contextId);
    }

    if (supportFilterOptions.assignedToUserId) {
      // Filter by assigned user ID (free text search)
      query = query
        .where("assignedToUserId")
        .eq(supportFilterOptions.assignedToUserId);
    }

    if (supportFilterOptions.resolvedbyUserId) {
      // Filter by resolved by user ID (free text search)
      query = query
        .where("resolvedByUserId")
        .eq(supportFilterOptions.resolvedbyUserId);
    }

    // When you use the sort() method in Dynamoose, it sorts the items based on the sort key of the index you're querying.
    query.sort(supportFilterOptions.sortOrder as SortOrderTypeEnum);

    // Apply date range filter if provided
    if (supportFilterOptions.fromDate || supportFilterOptions.toDate) {
      query = query.and().parenthesis((condition) => {
        if (supportFilterOptions.fromDate) {
          condition.where("createdAt").ge(supportFilterOptions.fromDate);
        }
        if (supportFilterOptions.toDate) {
          condition.where("createdAt").le(supportFilterOptions.toDate);
        }
        return condition;
      });
    }

    // search by searchText if provided
    if (supportFilterOptions.searchText) {
      // remove trailing and leading spaces from the search text
      let searchTextValue = supportFilterOptions.searchText.trim();

      /* 
      The and() method initiates a condition block where all conditions within it must be satisfied.
      The parenthesis() method allows grouping of conditions for complex queries.
      */
      query = query.and().parenthesis((condition) => {
        condition
          .where("userEmail")
          .contains(searchTextValue.toLowerCase())
          .or()
          .where("userFirstName") // @todo: Need to check in the Dynamod db whether all the values are in lower case or not
          .contains(searchTextValue)
          .or()
          .where("userLastName") // @todo: Need to check in the Dynamod db whether all the values are in lower case or not
          .contains(searchTextValue);

        // Return the built condition
        return condition;
      });
    }

    // Execute the query by applying the paginateQuery helper and return the results
    return getPaginatedResultsWithMatchingConditions<
      DbUserSupportDto,
      UserSupportListingFilterOptions
    >(query, supportFilterOptions);
  }

  /**
   * createSupport
   *
   * Creates a new user support request.
   *
   * @param {string} emailId - Email of the user creating the support request
   * @param {UserSupportCreateApiDto} supportData - Data for the support request
   * @returns {Promise<DbUserSupportDto>} - Promise resolving to the created support object
   */
  async createSupport(
    emailAddress: string,
    userSupportCreateDto: UserSupportCreateDto
  ): Promise<DbUserSupportDto> {
    // Unique id of the entry
    let id = UlidService.getUlidId();

    // Prepare the required details to create entry in the database
    const supportDbDetails = {
      ...userSupportCreateDto,
      PK: this.partitianKey.replace("{emailId}", emailAddress),
      SK: this.sortKeys.SK_INIT.replace("{id}", id),
      GSI1PK: this.GSI1PK,
      GSI1SK: this.GSI1SK.replace("{id}", id),
      id: id,
      userLastName: userSupportCreateDto.userLastName ?? "",
    };

    // Logger message
    global.logger.info("Creating support entry (request).", {
      filePath: __filename,
      methodName: this.createSupport.name,
      userEmail: emailAddress,
      userSupportCreateDto: userSupportCreateDto,
      supportDbDetails: supportDbDetails,
    });

    // return th result of the create operation
    return UserSupportModel.create(supportDbDetails);
  }
  /**
   * updateSupportById
   *
   * Updates an existing user support request by its ID.
   *
   * @param {string} supportId - The ID of the support request to update.
   * @param {UserSupportUpdateApiDto} updateRequestBody - The updated data for the support request.
   * @returns {Promise<DbUserSupportDto>} - A Promise that resolves to the updated support object.
   */
  async updateSupportById(
    emailAddress: string,
    supportId: string,
    updateRequestBody: UserSupportUpdateApiDto
  ): Promise<DbUserSupportDto> {
    // prepare the inputKey for which the data has to be updated .
    let inputKey = {
      PK: this.partitianKey.replace("{emailId}", emailAddress),
      SK: this.sortKeys.SK_INIT.replace("{id}", supportId),
    };
    // return the result of the update operation
    return UserSupportModel.update(inputKey, updateRequestBody);
  }

  /**
   * getUserSupportList
   *
   * Retrieves a list of user support requests based on the provided filter options.
   *
   * @param {UserSupportFilterDto} filterOptions - The filter options to apply when retrieving the support list.
   * @returns {Promise<QueryResponse<DbUserSupportDto>>} - A Promise that resolves to a QueryResponse containing the list of support requests.
   */
  async getUserSupportList(
    filterOptions: UserSupportFilterDto
  ): Promise<QueryResponse<DbUserSupportDto>> {
    // Prepare the query and define data type
    let query: Query<DbUserSupportDto>;

    // Check if userEmail is provided, then use the appropriate partition key
    if (filterOptions.userEmail) {
      const PK = this.partitianKey.replace(
        "{emailId}",
        filterOptions.userEmail
      );
      const SK = this.sortKeys.SK_INIT.split("#")[0];
      console.log(SK);
      // Construct Query based on user email
      query = UserSupportModel.query("PK").eq(PK).where("SK").beginsWith(SK);
    } else {
      query = UserSupportModel.query("GSI1PK").eq(this.GSI1PK);
    }

    // Add additional filters if provided
    if (filterOptions.status) {
      query = query.where("status").eq(filterOptions.status);
    }

    if (filterOptions.userSupportType) {
      // Filter by user support type (free text search)
      query = query
        .where("userSupportType")
        .contains(filterOptions.userSupportType);
    }

    if (filterOptions.contextType) {
      // Filter by context type (free text search)
      query = query.where("contextType").eq(filterOptions.contextType);
    }

    if (filterOptions.contextId) {
      // Filter by context ID (free text search)
      query = query.where("contextId").eq(filterOptions.contextId);
    }

    if (filterOptions.assignedToUserId) {
      // Filter by assigned user ID (free text search)
      query = query
        .where("assignedToUserId")
        .eq(filterOptions.assignedToUserId);
    }

    if (filterOptions.resolvedbyUserId) {
      // Filter by resolved by user ID (free text search)
      query = query
        .where("resolvedByUserId")
        .eq(filterOptions.resolvedbyUserId);
    }

    // Execute the query and return the results
    // TODO: Add Paginations to support large result sets
    return query.exec();
  }

  /**
   * getSupportById
   *
   * Retrieves support data from the database based on the provided support ID.
   *
   * @param {string} supportId - The ID of the support data to retrieve.
   * @return {Promise<QueryResponse<DbUserSupportDto>>} A promise that resolves to the query response containing the support data.
   */
  async getSupportById(
    supportId: string
  ): Promise<QueryResponse<DbUserSupportDto>> {
    // Prepare the sort key using the support ID
    let GSI1SK = this.GSI1SK.replace("{id}", supportId);

    // Execute the query and return the results
    return UserSupportModel.query("GSI1PK")
      .eq(this.GSI1PK)
      .where("GSI1SK")
      .eq(GSI1SK)
      .exec();
  }
}

// Create and export the UserSupportDao instance
const userSupportDao = new UserSupportDao();
export default userSupportDao;
