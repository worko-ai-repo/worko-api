// Load the local daos
import userProfilePercentageDao from "../daos/UserProfilePercentage.dao";

//Load the local dto
import { UserProfilePercentageDTO } from "../dtos/UserProfilePercentage.dto";

/**
 * UserProfilePercentageService class is responsible for managing user ProfilePercentage-related operations.
 */
class UserProfilePercentageService {
  /**
   * Retrieves user ProfilePercentage by email.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - A Promise that resolves to the ProfilePercentage of the user
   */
  async get(email: string): Promise<any> {
    // Logging the action of getting user ProfilePercentage by email in the service layer
    global.logger.info(
      "Fetching user ProfilePercentage by email [UserProfilePercentageService]"
    );
    return userProfilePercentageDao.get(email);
  }

  /**
   * Creates a new user ProfilePercentage.
   *
   * @param email - Email of the user
   * @param userProfilePercentageDTO - Data Transfer Object containing user ProfilePercentage details
   * @returns {Promise<any>} - A Promise that resolves when the ProfilePercentage is successfully created
   */
  async create(
    email: string,
    userProfilePercentageDTO: UserProfilePercentageDTO
  ): Promise<any> {
    // Logging the action of creating user ProfilePercentage in the service layer
    global.logger.info(
      "Creating user ProfilePercentage [UserProfilePercentageService]"
    );
    return userProfilePercentageDao.create(email, userProfilePercentageDTO);
  }

  /**
   * Updates an existing user ProfilePercentage.
   *
   * @param email - Email of the user
   * @param userProfilePercentageDTO - Data Transfer Object containing updated user ProfilePercentage details
   * @returns {Promise<any>} - A Promise that resolves when the ProfilePercentage is successfully updated
   */
  async update(
    email: string,
    userProfilePercentageDTO: UserProfilePercentageDTO
  ): Promise<any> {
    // Logging the action of updating user ProfilePercentage in the service layer
    global.logger.info(
      "Updating user ProfilePercentage [UserProfilePercentageService]"
    );

    return userProfilePercentageDao.update(email, userProfilePercentageDTO);
  }
}

// Exporting an instance of the UserProfilePercentageService class
export default new UserProfilePercentageService();
