// Load dynamoose library
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Load DAOs
import userSupportDao from "../../daos/UserSupport.dao";

// Load DTO
import { DbUserSupportDto } from "../../db/models/UserSupport.model";
import { UserSupportListingFilterOptions } from "../dtos/UserSupport.dto";

/**
 * UserSupportService
 *
 * Service class to handle operations related to user support requests.
 */
class UserSupportService {
  /**
   * getSupportRequests
   *
   * Retrieves support requests based on the provided filter options.
   *
   * @param {UserSupportListingFilterOptions} supportFilterOptions - The filter options for retrieving support requests.
   * @return {Promise<QueryResponse<DbUserSupportDto>>} A Promise that resolves to the list of support requests.
   */
  async getSupportRequests(
    supportFilterOptions: UserSupportListingFilterOptions
  ): Promise<QueryResponse<DbUserSupportDto>> {
    global.logger.info("get User support list [admin user support service]");

    // return support list from dao
    return userSupportDao.getSupportRequests(supportFilterOptions);
  }

  /**
   * getSupportRequestById
   *
   * Retrieves support request by their supportId.
   *
   * @param {string} supportId - The supportId of the support request to retrieve.
   * @return {Promise<QueryResponse<DbUserSupportDto>>} A Promise that resolves to the support request.
   */
  async getSupportRequestById(
    supportId: string
  ): Promise<QueryResponse<DbUserSupportDto>> {
    global.logger.info("get User support details by id [service]");

    // return support list based on supportId from dao
    return userSupportDao.getSupportById(supportId);
  }
}

// Create an instance of the UserSupportService
const userSupportServiceObj = new UserSupportService();

// Export an instance of the UserSupportService
export { userSupportServiceObj, UserSupportService };
