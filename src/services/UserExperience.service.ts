// Load the local daos
import userExperienceDao from "../daos/UserExperience.dao";

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
    console.log("Get user experience by id [service]");
    return userExperienceDao.get(email);
  }

  /**
   *
   * @param email
   * @param companyName
   * @param companyEmailId
   */
  async createExperience(
    email: string,
    department: string,
    designation: string,
    designationTag: number
  ) {
    try {
      console.log("Create employee Work Experience [service]");
      userExperienceDao.create(email, department, designation, designationTag);
    } catch (error) {
      throw error;
    }
  }
}

// Export an instance of the UserExperienceService class
export default new UserExperienceService();
