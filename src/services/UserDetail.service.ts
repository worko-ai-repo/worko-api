// Load the local daos
import userDetailDao from "../daos/UserDetail.dao";

// Load the local dtos

// @todo all methods from everything (Dao, Service, etc) should return the response,
// it will help the caller to know what happed with the action and what is the response.

/**
 *  UserDetailService class responsible for managing user-related operations.
 */
class UserDetailService {
  /**
   * Retrieves user details by email id.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - Details of the user
   */
  async get(email: string) {
    console.log("Get user detail by email [service]");
    return userDetailDao.get(email);
  }
}

// Export an instance of the UserService class
export default new UserDetailService();
