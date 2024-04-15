// Load the local daos
import { QueryResponse } from "dynamoose/dist/ItemRetriever";
import userReferralResponseDao from "../daos/UserReferralResponse.dao";

//Load the local dto
import { UserReferralResponseDTO } from "../dtos/UserReferralResponse.dto";
import { DbUserReferralResponseDto } from "../db/models/UserReferralResponse.model";

/**
 * UserReferralResponseService class is responsible for managing user ReferralResponse-related operations.
 */
class UserReferralResponseService {
  /**
   * Retrieves user ReferralResponse by email.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - A Promise that resolves to the ReferralResponse of the user
   */
  async get(email: string): Promise<any> {
    // Logging the action of getting user ReferralResponse by email in the service layer
    global.logger.info(
      "Fetching user ReferralResponse by email [UserReferralResponseService]"
    );
    return userReferralResponseDao.get(email);
  }

  /**
   * getByEmailWithSpecifiedAttributes
   * 
   * Retrieves user ReferralResponse by email.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - A Promise that resolves to the ReferralResponse of the user
   */
  async getByEmailWithSpecifiedAttributes(email: string, attributes: string[]): Promise<any> {
    // Logging the action of getting user ReferralResponse by email in the service layer
    global.logger.info(
      "Fetching user ReferralResponse by email [UserReferralResponseService]"
    );
    return userReferralResponseDao.getByEmailWithSpecifiedAttributes(email, attributes);
  }


  /**
   * Creates a new user ReferralResponse.
   *
   * @param email - Email of the user
   * @param userReferralResponseDTO - Data Transfer Object containing user ReferralResponse details
   * @returns {Promise<any>} - A Promise that resolves when the ReferralResponse is successfully created
   */
  async create(
    email: string,
    userReferralResponseDTO: UserReferralResponseDTO
  ): Promise<any> {
    // Logging the action of creating user ReferralResponse in the service layer
    global.logger.info(
      "Creating user ReferralResponse [UserReferralResponseService]"
    );
    return userReferralResponseDao.create(email, userReferralResponseDTO);
  }

  /**
   * Updates existing user ReferralResponse.
   *
   * @param email - Email of the user
   * @param userReferralResponseDTO - Data Transfer Object containing updated user ReferralResponse details
   * @returns {Promise<any>} - A Promise that resolves when the ReferralResponse is successfully updated
   */
  async update(
    email: string,
    userReferralResponseDTO: UserReferralResponseDTO
  ): Promise<any> {
    // Logging the action of updating user ReferralResponse in the service layer
    logger.info("Updating user ReferralResponse [UserReferralResponseService]");

    return userReferralResponseDao.update(email, userReferralResponseDTO);
  }
}

// Exporting an instance of the UserReferralResponseService class
export default new UserReferralResponseService();
