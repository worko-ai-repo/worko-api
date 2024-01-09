// Load the local daos
import userExperienceDao from "../daos/UserExperience.dao";
import { UserExperienceDTO } from "../dtos/UserExperience.dto";

// Load the local dtos

/**
 *  UserExperienceService class responsible for managing user Experience-related operations.
 */
class UserExperienceService {
  /**
   * Retrieves user Experience by email id.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - Experience of the user
   */
  async get(email: string) {
    global.logger.info("Get user experience by id [service]");
    return userExperienceDao.get(email);
  }

  /**
   *
   * @param email
   * @param UserExperienceDto
   */
  async create(email: string, userExperienceDto: UserExperienceDTO) {
    global.logger.info("Create employee Work Experience [service]");
    userExperienceDao.create(email, userExperienceDto);
  }

  /**
   * Updates an existing user Experience.
   *
   * @param email - Email of the user
   * @param userExperienceDTO - Data Transfer Object containing updated user Experience details
   * @returns {Promise<any>} - A Promise that resolves when the Experience is successfully updated
   */
  async update(
    email: string,
    SK: string,
    userExperienceDTO: UserExperienceDTO
  ): Promise<any> {
    // Logging the action of updating user Experience in the service layer
    logger.info("Updating user Experience [UserExperienceService]");

    return userExperienceDao.update(email, SK, userExperienceDTO);
  }
}

// Export an instance of the UserExperienceService class
export default new UserExperienceService();
