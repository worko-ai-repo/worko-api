// Load the local daos
import userDetailDao from "../daos/UserDetail.dao";

// Load the local dtos
import { UserDetailDTO } from "../dtos/UserDetail.dto";

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

  /**
   * Creates a new user Detail.
   *
   * @param email - Email of the user
   * @param userDetailDTO - Data Transfer Object containing user Detail details
   * @returns {Promise<any>} - A Promise that resolves when the Detail is successfully created
   */
  async create(email: string, userDetailDTO: UserDetailDTO): Promise<any> {
    // Logging the action of creating user Detail in the service layer
    logger.info("Creating user Detail [UserDetailService]");
    return userDetailDao.create(email, userDetailDTO);
  }

  /**
   * Updates an existing user Detail.
   *
   * @param email - Email of the user
   * @param userDetailDTO - Data Transfer Object containing updated user Detail details
   * @returns {Promise<any>} - A Promise that resolves when the Detail is successfully updated
   */
  async update(
    email: string,
    SK: string,
    userDetailDTO: UserDetailDTO
  ): Promise<any> {
    // Logging the action of updating user Detail in the service layer
    logger.info("Updating user Detail [UserDetailService]");

    return userDetailDao.update(email, SK, userDetailDTO);
  }
}

// Export an instance of the UserService class
export default new UserDetailService();
