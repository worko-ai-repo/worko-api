// Load the local daos
import userAchievementDao from "../daos/UserAchievement.dao";

//Load the local dto
import { UserAchievementDTO } from "../dtos/UserAchievement.dto";

/**
 * UserAchievementService class is responsible for managing user Achievement-related operations.
 */
class UserAchievementService {
  /**
   * Retrieves user Achievement by email.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - A Promise that resolves to the Achievement of the user
   */
  async get(email: string): Promise<any> {
    // Logging the action of getting user Achievement by email in the service layer
    logger.info("Fetching user Achievement by email [UserAchievementService]");
    return userAchievementDao.get(email);
  }

  /**
   * Creates a new user Achievement.
   *
   * @param email - Email of the user
   * @param userAchievementDTO - Data Transfer Object containing user Achievement details
   * @returns {Promise<any>} - A Promise that resolves when the Achievement is successfully created
   */
  async create(
    email: string,
    userAchievementDTO: UserAchievementDTO
  ): Promise<any> {
    // Logging the action of creating user Achievement in the service layer
    logger.info("Creating user Achievement [UserAchievementService]");
    return userAchievementDao.create(email, userAchievementDTO);
  }

  /**
   * Updates an existing user Achievement.
   *
   * @param email - Email of the user
   * @param userAchievementDTO - Data Transfer Object containing updated user Achievement details
   * @returns {Promise<any>} - A Promise that resolves when the Achievement is successfully updated
   */
  async update(
    email: string,
    userAchievementDTO: UserAchievementDTO
  ): Promise<any> {
    // Logging the action of updating user Achievement in the service layer
    logger.info("Updating user Achievement [UserAchievementService]");

    return userAchievementDao.update(email, userAchievementDTO);
  }
}

// Exporting an instance of the UserAchievementService class
export default new UserAchievementService();
