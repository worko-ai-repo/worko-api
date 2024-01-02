// Load the local daos
import userSocialProfileDao from "../daos/UserSocialProfile.dao";

//Load the local dto
import { UserSocialProfileDTO } from "../dtos/UserSocialProfile.dto";

/**
 * UserSocialProfileService class is responsible for managing user SocialProfile-related operations.
 */
class UserSocialProfileService {
  /**
   * Retrieves user SocialProfile by email.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - A Promise that resolves to the SocialProfile of the user
   */
  async get(email: string): Promise<any> {
    // Logging the action of getting user SocialProfile by email in the service layer
    logger.info(
      "Fetching user SocialProfile by email [UserSocialProfileService]"
    );
    return userSocialProfileDao.get(email);
  }

  /**
   * Creates a new user SocialProfile.
   *
   * @param email - Email of the user
   * @param userSocialProfileDTO - Data Transfer Object containing user SocialProfile details
   * @returns {Promise<any>} - A Promise that resolves when the SocialProfile is successfully created
   */
  async createSocialProfile(
    email: string,
    userSocialProfileDTO: UserSocialProfileDTO
  ): Promise<any> {
    // Logging the action of creating user SocialProfile in the service layer
    logger.info("Creating user SocialProfile [UserSocialProfileService]");
    return userSocialProfileDao.create(email, userSocialProfileDTO);
  }

  /**
   * Updates an existing user SocialProfile.
   *
   * @param email - Email of the user
   * @param userSocialProfileDTO - Data Transfer Object containing updated user SocialProfile details
   * @returns {Promise<any>} - A Promise that resolves when the SocialProfile is successfully updated
   */
  async update(
    email: string,
    userSocialProfileDTO: UserSocialProfileDTO
  ): Promise<any> {
    // Logging the action of updating user SocialProfile in the service layer
    logger.info("Updating user SocialProfile [UserSocialProfileService]");

    return userSocialProfileDao.update(email, userSocialProfileDTO);
  }
}

// Exporting an instance of the UserSocialProfileService class
export default new UserSocialProfileService();
