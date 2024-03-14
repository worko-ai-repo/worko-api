// Load the local daos
import userEducationDao from "../daos/UserEducation.dao";

//Load the local dto
import { UserEducationDTO } from "../dtos/UserEducation.dto";

/**
 * UserEducationService class is responsible for managing user Education-related operations.
 */
class UserEducationService {
  /**
   * Retrieves user Education by email.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - A Promise that resolves to the Education of the user
   */
  async get(email: string): Promise<any> {
    // Logging the action of getting user Education by email in the service layer
    logger.info("Fetching user Education by email [UserEducationService]");
    return userEducationDao.get(email);
  }

  /**
   * Creates a new user Education.
   *
   * @param email - Email of the user
   * @param userEducationDTO - Data Transfer Object containing user Education details
   * @returns {Promise<any>} - A Promise that resolves when the Education is successfully created
   */
  async createEducation(
    email: string,
    userEducationDTO: UserEducationDTO
  ): Promise<any> {
    // Logging the action of creating user Education in the service layer
    logger.info("Creating user Education [UserEducationService]");
    return userEducationDao.create(email, userEducationDTO);
  }

  /**
   * Updates an existing user Education.
   *
   * @param email - Email of the user
   * @param userEducationDTO - Data Transfer Object containing updated user Education details
   * @returns {Promise<any>} - A Promise that resolves when the Education is successfully updated
   */
  async update(
    email: string,
    SK: string,
    userEducationDTO: UserEducationDTO
  ): Promise<any> {
    // Logging the action of updating user Education in the service layer
    logger.info("Updating user Education [UserEducationService]");

    return userEducationDao.update(email, SK, userEducationDTO);
  }

  /**
   * Deletes an existing user Education or Entries.
   * @param email - Email of the user
   * @param SK - Secondary key of the user
   * @returns {Promise<any>} - A Promise that resolves when the Education is successfully deleted
   * or Entries are successfully deleted
   */

  async delete(email: string, id: string): Promise<any> {
    // Logging the action of deleting  user Education in the service layer
    logger.info("Deleting user Education Entries [UserEducationService]");
    // return the Promise that resolves when the Education is successfully deleted
    return userEducationDao.delete(email, id);
  }
}

// Exporting an instance of the UserEducationService class
export default new UserEducationService();
