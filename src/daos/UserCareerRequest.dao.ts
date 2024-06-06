//import required Npm packages
import { QueryResponse } from "dynamoose/dist/ItemRetriever";
import { Query } from "dynamoose/dist/ItemRetriever";

// Import the base dao
import BaseDao from "./Base.dao";

// Import the dtos
import {
  UserCareerRequestCreateDto,
  UserCareerRequestFilterDto,
  UserCareerRequestUpdateDto,
} from "../dtos/UserCareerRequest.dto";

// Import the models
import {
  DbUserCareerRequestDto,
  UserCareerRequestModel,
} from "../db/models/UserCareerRequest.model";

// Import the services
import UlidService from "../services/Ulid.service";

/**
 * UserCareerRequestDao
 *
 * Class responsible for managing user career request related operations and communicating with DynamoDb
 */
class UserCareerRequestDao implements BaseDao {
  modelName: string = "UserCareerRequest";
  partitianKey: string = "USR#EML#{emailId}";
  sortKeys: { SK_INIT: string } = {
    SK_INIT: "CAREER#REQ#ID#{id}",
  };
  GSI1PK: string = "CAREER";
  GSI1SK = "ID#{id}";

  /**
   * createCareerRequest
   *
   * Creates a new user career request.
   *
   * @param {string} emailId - Email of the user creating the career request
   * @param {UserCareerRequestCreateDto} requestDto - Data for the career request
   * @returns {Promise<DbUserCareerRequestDto>} - Promise resolving to the created career request object
   */
  async createCareerRequest(
    emailAddress: string,
    userCareerRequestCreateDto: UserCareerRequestCreateDto
  ): Promise<DbUserCareerRequestDto> {
    // Unique id of the entry
    let id = UlidService.getUlidId();

    // Prepare the required details to create entry in the database
    const requestDbDetails = {
      ...userCareerRequestCreateDto,
      PK: this.partitianKey.replace("{emailId}", emailAddress),
      SK: this.sortKeys.SK_INIT.replace("{id}", id),
      GSI1PK: this.GSI1PK,
      GSI1SK: this.GSI1SK.replace("{id}", id),
      id: id,
    };

    // Logger message
    global.logger.info("Creating career request entry.", {
      filePath: __filename,
      methodName: this.createCareerRequest.name,
      userEmail: emailAddress,
      requestDto: userCareerRequestCreateDto,
      requestDbDetails: requestDbDetails,
    });

    // return the result of the create operation
    return UserCareerRequestModel.create(requestDbDetails);
  }

  /**
   * updateCareerRequestById
   *
   * Updates an existing user career request by its ID.
   *
   * @param {string} emailAddress - The email address of the user
   * @param {string} requestId - The ID of the career request to update
   * @param {UserCareerRequestUpdateApiDto} updateRequestBody - The updated data for the career request
   * @returns {Promise<DbUserCareerRequestDto>} - A Promise that resolves to the updated career request object
   */
  async updateCareerRequestById(
    emailAddress: string,
    requestId: string,
    updatedCareerRequestData: UserCareerRequestUpdateDto
  ): Promise<DbUserCareerRequestDto> {
    // prepare the inputKey for which the data has to be updated
    let inputKey = {
      PK: this.partitianKey.replace("{emailId}", emailAddress),
      SK: this.sortKeys.SK_INIT.replace("{id}", requestId),
    };

    // return the result of the update operation
    return UserCareerRequestModel.update(inputKey, updatedCareerRequestData);
  }

  /**
   * getUserCareerRequestList
   *
   * Retrieves a list of user career requests based on the provided filter options.
   *
   * @param {UserCareerRequestFilterDto} filterOptions - The filter options to apply when retrieving the career request list
   * @returns {Promise<QueryResponse<DbUserCareerRequestDto>>} - A Promise that resolves to a QueryResponse containing the list of career requests
   */
  async getUserCareerRequestList(
    filterOptions: UserCareerRequestFilterDto
  ): Promise<QueryResponse<DbUserCareerRequestDto>> {
    // Prepare the query and define data type
    let query: Query<DbUserCareerRequestDto>;

    // Check if userEmail is provided, then use the appropriate partition key
    if (filterOptions.userEmail) {
      const PK = this.partitianKey.replace(
        "{emailId}",
        filterOptions.userEmail
      );
      const SK = this.sortKeys.SK_INIT.split("#")[0];
      // Construct Query based on user email
      query = UserCareerRequestModel.query("PK")
        .eq(PK)
        .where("SK")
        .beginsWith(SK);
    } else {
      query = UserCareerRequestModel.query("GSI1PK").eq(this.GSI1PK);
    }

    // Add additional filters if provided
    if (filterOptions.status) {
      query = query.where("status").eq(filterOptions.status);
    }

    if (filterOptions.userContactNumber) {
      query = query
        .where("userContactNumber")
        .eq(filterOptions.userContactNumber);
    }
    
    // Execute the query and return the results
    // TODO: Add Pagination to support large result sets
    return query.exec();
  }

  /**
   * getCareerRequestById
   *
   * Retrieves a career request by its ID.
   *
   * @param {string} requestId - The ID of the career request to retrieve
   * @returns {Promise<QueryResponse<DbUserCareerRequestDto>>} - A Promise that resolves to the career request
   */
  async getCareerRequestById(
    requestId: string
  ): Promise<QueryResponse<DbUserCareerRequestDto>> {
    // Prepare the sort key using the request ID
    let GSI1SK = this.GSI1SK.replace("{id}", requestId);

    // Execute the query and return the results
    return UserCareerRequestModel.query("GSI1PK")
      .eq(this.GSI1PK)
      .where("GSI1SK")
      .eq(GSI1SK)
      .exec();
  }

  /**
   * getCountByEmail
   *
   * Checking whether the form is filled only once or not
   *
   * @param email - User email used to fill the form
   */
  async getCountByEmail(email: string) {
    const PK = this.partitianKey.strtr({
      "{emailId}": email,
    });
    return UserCareerRequestModel.query("PK")
    .eq(PK)
    .where("SK")
    .beginsWith("CAREER#REQ#ID#")
    .exec();
  }
}

// Create and export the UserCareerRequestDao instance
const userCareerRequestDao = new UserCareerRequestDao();
export default userCareerRequestDao;
