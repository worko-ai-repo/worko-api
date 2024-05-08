// Import installed packages
import { QueryResponse } from "dynamoose/dist/ItemRetriever";
import { Query } from "dynamoose/dist/ItemRetriever";

// Import the base dao
import BaseDao from "./Base.dao";

// Import the dtos
import {
    UserCorporateRequestCreateDto,
    UserCorporateRequestFilterDto,
    UserCorporateRequestUpdateDto,
} from "../dtos/UserCorporateRequest.dto";

// Import the models
import {
    DbUserCorporateRequestDto,
    UserCorporateRequestModel,
} from "../db/models/UserCorporateRequest.model";

// Import the services
import UlidService from "../services/Ulid.service";

/**
 * UserCorporateRequestDao
 * 
 * Class responsible for managing user corporate request related operations and communicating with DynamoDb
 */
class UserCorporateRequestDao implements BaseDao {
    modelName: string = "UserCorporateRequest";

    partitianKey: string = "USR#EML#{emailId}";
    sortKeys: { SK_INIT: string } = {
        SK_INIT: "CORP#REQ#ID#{id}",
    };

    GSI1PK: string = "CORP";
    GSI1SK = "ID#{id}";

    /**
     * createCorporateRequest
     * 
     * Creates a new user corporate request.
     *
     * @param {string} emailId - Email of the user creating the corporate request
     * @param {UserCorporateRequestCreateDto} requestDto - Data for the corporate request
     * @returns {Promise<DbUserCorporateRequestDto>} - Promise resolving to the created corporate request object
     */
    async createCorporateRequest(
        emailAddress: string,
        userCorporateRequestCreateDto: UserCorporateRequestCreateDto
    ): Promise<DbUserCorporateRequestDto> {
        // Unique id of the entry
        let id = UlidService.getUlidId();

        // Prepare the required details to create entry in the database
        const requestDbDetails = {
            ...userCorporateRequestCreateDto,
            PK: this.partitianKey.replace("{emailId}", emailAddress),
            SK: this.sortKeys.SK_INIT.replace("{id}", id),
            GSI1PK: this.GSI1PK,
            GSI1SK: this.GSI1SK.replace("{id}", id),
            id: id,
        };

        // Logger message
        global.logger.info("Creating corporate request entry.", {
            filePath: __filename,
            methodName: this.createCorporateRequest.name,
            userEmail: emailAddress,
            requestDto: userCorporateRequestCreateDto,
            requestDbDetails: requestDbDetails,
        });

        // return the result of the create operation
        return UserCorporateRequestModel.create(requestDbDetails);
    }

    /**
     * updateCorporateRequestById
     * 
     * Updates an existing user corporate request by its ID.
     *
     * @param {string} emailAddress - The email address of the user
     * @param {string} requestId - The ID of the corporate request to update
     * @param {UserCorporateRequestUpdateApiDto} updateRequestBody - The updated data for the corporate request
     * @returns {Promise<DbUserCorporateRequestDto>} - A Promise that resolves to the updated corporate request object
     */
    async updateCorporateRequestById(
        emailAddress: string,
        requestId: string,
        updatedCorporateRequestData: UserCorporateRequestUpdateDto
    ): Promise<DbUserCorporateRequestDto> {
        // prepare the inputKey for which the data has to be updated
        let inputKey = {
            PK: this.partitianKey.replace("{emailId}", emailAddress),
            SK: this.sortKeys.SK_INIT.replace("{id}", requestId),
        };

        // return the result of the update operation
        return UserCorporateRequestModel.update(inputKey, updatedCorporateRequestData);
    }

    /**
     * getUserCorporateRequestList
     * 
     * Retrieves a list of user corporate requests based on the provided filter options.
     *
     * @param {UserCorporateRequestFilterDto} filterOptions - The filter options to apply when retrieving the corporate request list
     * @returns {Promise<QueryResponse<DbUserCorporateRequestDto>>} - A Promise that resolves to a QueryResponse containing the list of corporate requests
     */
    async getUserCorporateRequestList(
        filterOptions: UserCorporateRequestFilterDto
    ): Promise<QueryResponse<DbUserCorporateRequestDto>> {
        // Prepare the query and define data type
        let query: Query<DbUserCorporateRequestDto>;

        // Check if userEmail is provided, then use the appropriate partition key
        if (filterOptions.userEmail) {
            const PK = this.partitianKey.replace(
                "{emailId}",
                filterOptions.userEmail
            );
            const SK = this.sortKeys.SK_INIT.split("#")[0];

            // Construct Query based on user email
            query = UserCorporateRequestModel.query("PK").eq(PK).where("SK").beginsWith(SK);
        } else {
            query = UserCorporateRequestModel.query("GSI1PK").eq(this.GSI1PK);
        }

        // Add additional filters if provided
        if (filterOptions.status) {
            query = query.where("status").eq(filterOptions.status);
        }

        if (filterOptions.contactNumber) {
            query = query.where("contactNumber").eq(filterOptions.contactNumber);
        }

        // Execute the query and return the results
        // TODO: Add Pagination to support large result sets
        return query.exec();
    }

    /**
     * getCorporateRequestById
     * 
     * Retrieves a corporate request by its ID.
     *
     * @param {string} requestId - The ID of the corporate request to retrieve
     * @returns {Promise<QueryResponse<DbUserCorporateRequestDto>>} - A Promise that resolves to the corporate request
     */
    async getCorporateRequestById(
        requestId: string
    ): Promise<QueryResponse<DbUserCorporateRequestDto>> {
        // Prepare the sort key using the request ID
        let GSI1SK = this.GSI1SK.replace("{id}", requestId);

        // Execute the query and return the results
        return UserCorporateRequestModel.query("GSI1PK")
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
        return UserCorporateRequestModel.query("PK").eq(PK).attributes(["PK"]).exec();
    }
}

// Create and export the UserCorporateRequestDao instance
const userCorporateRequestDao = new UserCorporateRequestDao();
export default userCorporateRequestDao;
