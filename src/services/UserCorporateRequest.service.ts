// Import Local Packages
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import DAOs
import userCorporateRequestDao from "../daos/UserCorporateRequest.dao";

// Import DTOs
import {
    UserCorporateRequestCreateDto,
    UserCorporateRequestFilterDto,
    UserCorporateRequestUpdateDto,
} from "../dtos/UserCorporateRequest.dto";

// Import Models
import { DbUserCorporateRequestDto } from "../db/models/UserCorporateRequest.model";

/**
 * UserCorporateRequestService
 *
 * Class responsible for managing user corporate request related operations.
 */
class UserCorporateRequestService {
    /**
     * createCorporateRequest
     *
     * Creates a new corporate request for a user.
     *
     * @param {string} emailAddress - Email of the user for whom the request is being created.
     * @param {UserCorporateRequestCreateDto} userCorporateRequestCreateDto - Corporate request data.
     * @returns {Promise<DbUserCorporateRequestDto>} - A Promise that resolves to the created corporate request object.
     */
    async createCorporateRequest(
        emailAddress: string,
        userCorporateRequestCreateDto: UserCorporateRequestCreateDto
    ): Promise<DbUserCorporateRequestDto> {
        // Log the creation of the corporate request
        global.logger.info("Creating corporate request entry", {
            filePath: __filename,
            methodName: this.createCorporateRequest.name,
            userEmail: emailAddress,
            requestData: userCorporateRequestCreateDto.userEmail,
        });

        // Return the created corporate request details
        return userCorporateRequestDao.createCorporateRequest(
            emailAddress,
            userCorporateRequestCreateDto
        );
    }

    /**
     * updateCorporateRequestById
     *
     * Updates an existing corporate request by its ID.
     *
     * @param {string} userEmail - The email address of the user.
     * @param {string} requestId - The ID of the corporate request to update.
     * @param {UserCorporateRequestUpdateApiDto} updateRequestBody - The updated data for the corporate request.
     * @returns {Promise<DbUserCorporateRequestDto>} - A Promise that resolves to the updated corporate request object.
     */
    async updateCorporateRequestById(
        userEmail: string,
        requestId: string,
        updatedCorporateRequestData: UserCorporateRequestUpdateDto
    ): Promise<DbUserCorporateRequestDto> {

        // Update the corporate request through the DAO
        return userCorporateRequestDao.updateCorporateRequestById(
            userEmail,
            requestId,
            updatedCorporateRequestData
        );
    }

    /**
     * getUserCorporateRequestList
     *
     * Retrieves a list of corporate requests based on filter options.
     *
     * @param {UserCorporateRequestFilterDto} filterOptions - Filter options for retrieving corporate requests.
     * @returns {Promise<QueryResponse<DbUserCorporateRequestDto>>} - A Promise that resolves to the list of corporate requests.
     */
    async getUserCorporateRequestList(
        filterOptions: UserCorporateRequestFilterDto
    ): Promise<QueryResponse<DbUserCorporateRequestDto>> {
        // Call the DAO method to retrieve corporate request list
        return userCorporateRequestDao.getUserCorporateRequestList(filterOptions);
    }

    /**
     * getCorporateRequestById
     *
     * Retrieves a corporate request by its ID.
     *
     * @param {string} requestId - The ID of the corporate request to retrieve.
     * @returns {Promise<QueryResponse<DbUserCorporateRequestDto>>} - A Promise that resolves to the corporate request.
     */
    async getCorporateRequestById(
        requestId: string
    ): Promise<QueryResponse<DbUserCorporateRequestDto>> {
        // Call the DAO method to retrieve corporate request by ID
        return userCorporateRequestDao.getCorporateRequestById(requestId);
    }
}

// Export an instance of the UserCorporateRequestService class
export default new UserCorporateRequestService();
