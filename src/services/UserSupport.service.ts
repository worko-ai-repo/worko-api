// Import Local Packages
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import DAOs
import userSupportDao from "../daos/UserSupport.dao";

// Import DTOs
import { UserSupportCreateDto, UserSupportFilterDto, UserSupportUpdateApiDto, UserSupportUpdateDto } from "../dtos/UserSupport.dto";

// Import Models 
import { DbUserSupportDto } from "../db/models/UserSupport.model";
import { UserSupportStatusEnum } from "../enums/User.enum";

/**
 * UserSupportService
 * 
 * Class responsible for managing user support related operations.
 */
class UserSupportService {
    /**
     * createSupport
     * 
     * Creates a new support request for a user.
     *
     * @param {string} emailAddress - Email of the user for whom the support is being created.
     * @param {UserSupportCreateDto} userSupportCreateDto - Support request data.
     * @returns {Promise<DbUserSupportDto>} - A Promise that resolves to the created support request object.
     */
    async createSupport(emailAddress: string, userSupportCreateDto: UserSupportCreateDto): Promise<DbUserSupportDto> {
        // Log the creation of the support request
        global.logger.info("Creating support request entry", {
            filePath: __filename,
            methodName: this.createSupport.name,
            userEmail: emailAddress,
            supportData: userSupportCreateDto.userEmail,
        });

        // Return the created support request details
        return userSupportDao.createSupport(emailAddress, userSupportCreateDto);
    }

    /**
     * updateSupportById
     * 
     * Updates an existing support request by its ID.
     *
     * @param {string} userEmail - The email address of the user.
     * @param {string} supportId - The ID of the support request to update.
     * @param {UserSupportUpdateApiDto} updateRequestBody - The updated data for the support request.
     * @returns {Promise<DbUserSupportDto>} - A Promise that resolves to the updated support request object.
     */
    async updateSupportById(userEmail: string, supportId: string, updateRequestBody: UserSupportUpdateApiDto): Promise<DbUserSupportDto> {
        // Determine if the status is RESOLVED
        const isResolved = updateRequestBody.status === UserSupportStatusEnum.RESOLVED;

        // Prepare the update data
        let updateData: UserSupportUpdateDto = {
            ...updateRequestBody,
            updatedByUserId: updateRequestBody.actionByUserId,
        };

        // Update resolvedByUserId and resolvedAt if status is RESOLVED
        if (isResolved) {
            updateData.resolvedByUserId = updateRequestBody.assignedToUserId;
            updateData.resolvedAt = new Date();
        }

        // Update the support request through the DAO
        return userSupportDao.updateSupportById(userEmail, supportId, updateData);
    }

    /**
    * getSupportList
    * 
    * Retrieves a list of support requests based on filter options.
    *
    * @param {UserSupportFilterDto} filterOptions - Filter options for retrieving support requests.
    * @returns {Promise<QueryResponse<DbUserSupportDto>>} - A Promise that resolves to the list of support requests.
    */
    async getUserSupportList(filterOptions: UserSupportFilterDto): Promise<QueryResponse<DbUserSupportDto>> {
        // Call the DAO method to retrieve support list
        return userSupportDao.getUserSupportList(filterOptions);
    }

    /**
    * getSupportById
    * 
    * Retrieves a support request by its ID.
    *
    * @param {string} supportId - The ID of the support request to retrieve.
    * @returns {Promise<QueryResponse<DbUserSupportDto>>} - A Promise that resolves to the support request.
    */
    async getSupportById(supportId: string): Promise<QueryResponse<DbUserSupportDto>> {
        // Call the DAO method to retrieve support by ID
        return userSupportDao.getSupportById(supportId);
    }
}

// Export an instance of the UserSupportService class
export default new UserSupportService();
