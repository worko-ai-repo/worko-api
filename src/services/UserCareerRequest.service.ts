// Import Local Packages
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import DAOs
import userCareerRequestDao from "../daos/UserCareerRequest.dao";

// Import DTOs
import {
    UserCareerRequestCreateDto,
    UserCareerRequestFilterDto,
    UserCareerRequestUpdateDto,
} from "../dtos/UserCareerRequest.dto";

// Import Models
import { DbUserCareerRequestDto } from "../db/models/UserCareerRequest.model";

/**
 * UserCareerRequestService
 *
 * Class responsible for managing user career request related operations.
 */
class UserCareerRequestService {
    /**
     * createCareerRequest
     *
     * Creates a new career request for a user.
     *
     * @param {string} emailAddress - Email of the user for whom the request is being created.
     * @param {UserCareerRequestCreateDto} userCareerRequestCreateDto - Career request data.
     * @returns {Promise<DbUserCareerRequestDto>} - A Promise that resolves to the created career request object.
     */
    async createCareerRequest(
        emailAddress: string,
        userCareerRequestCreateDto: UserCareerRequestCreateDto
    ): Promise<DbUserCareerRequestDto> {
        // Log the creation of the career request
        global.logger.info("Creating career request entry", {
            filePath: __filename,
            methodName: this.createCareerRequest.name,
            userEmail: emailAddress,
            requestData: userCareerRequestCreateDto.userEmail,
        });

        // Return the created career request details
        return userCareerRequestDao.createCareerRequest(
            emailAddress,
            userCareerRequestCreateDto
        );
    }

    /**
     * updateCareerRequestById
     *
     * Updates an existing career request by its ID.
     *
     * @param {string} userEmail - The email address of the user.
     * @param {string} requestId - The ID of the career request to update.
     * @param {UserCareerRequestUpdateApiDto} updateRequestBody - The updated data for the career request.
     * @returns {Promise<DbUserCareerRequestDto>} - A Promise that resolves to the updated career request object.
     */
    async updateCareerRequestById(
        userEmail: string,
        requestId: string,
        updatedCareerRequestData: UserCareerRequestUpdateDto
    ): Promise<DbUserCareerRequestDto> {

        // Update the career request through the DAO
        return userCareerRequestDao.updateCareerRequestById(
            userEmail,
            requestId,
            updatedCareerRequestData
        );
    }

    /**
     * getUserCareerRequestList
     *
     * Retrieves a list of career requests based on filter options.
     *
     * @param {UserCareerRequestFilterDto} filterOptions - Filter options for retrieving career requests.
     * @returns {Promise<QueryResponse<DbUserCareerRequestDto>>} - A Promise that resolves to the list of career requests.
     */
    async getUserCareerRequestList(
        filterOptions: UserCareerRequestFilterDto
    ): Promise<QueryResponse<DbUserCareerRequestDto>> {
        // Call the DAO method to retrieve career request list
        return userCareerRequestDao.getUserCareerRequestList(filterOptions);
    }

    /**
     * getCareerRequestById
     *
     * Retrieves a career request by its ID.
     *
     * @param {string} requestId - The ID of the career request to retrieve.
     * @returns {Promise<QueryResponse<DbUserCareerRequestDto>>} - A Promise that resolves to the career request.
     */
    async getCareerRequestById(
        requestId: string
    ): Promise<QueryResponse<DbUserCareerRequestDto>> {
        // Call the DAO method to retrieve career request by ID
        return userCareerRequestDao.getCareerRequestById(requestId);
    }
}

// Export an instance of the UserCareerRequestService class
export default new UserCareerRequestService();
