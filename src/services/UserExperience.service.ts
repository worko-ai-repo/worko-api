// Load the local daos
import userExperienceDao from "../daos/UserExperience.dao";

// Load the local dtos

/**
 *  UserExperienceService class responsible for managing user Experience-related operations.
 */
class UserExperienceService {
  /**
   *
   * @param email
   * @param companyName
   * @param companyEmailId
   */
  async createExperience(
    email: string,
    department: string,
    designation: string
  ) {
    try {
      console.log("Create employee Work Experience [service]");
      userExperienceDao.create(email, department, designation);
    } catch (error) {
      throw error;
    }
  }
}

// Export an instance of the UserExperienceService class
export default new UserExperienceService();
