// Load the local daos
import userEmailDao from "../daos/UserEmail.dao";

// Load the local dtos

/**
 *
 *  UserEmailService class responsible for managing user email-related operations.
 *
 */
class UserEmailService {
  /**
   *
   * @param email
   * @param companyName
   * @param companyEmailId
   */
  async createEmailt(
    email: string,
    companyName: string,
    companyEmailId: string
  ) {
    try {
      userEmailDao.create(email, companyName, companyEmailId);
    } catch (error) {
      throw error;
    }
  }
}

// Export an instance of the UserService class
export default new UserEmailService();
