// Load the local daos
import userBankDetailDao from "../daos/UserBankDetail.dao";

//Load the local dto
import { UserBankDetailDTO } from "../dtos/UserBankDetail.dto";

/**
 * UserBankDetailService class is responsible for managing user BankDetail-related operations.
 */
class UserBankDetailService {
  /**
   * Retrieves user BankDetail by email.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - A Promise that resolves to the BankDetail of the user
   */
  async get(email: string): Promise<any> {
    // Logging the action of getting user BankDetail by email in the service layer
    logger.info("Fetching user BankDetail by email [UserBankDetailService]");
    return userBankDetailDao.get(email);
  }

  /**
   * Creates a new user BankDetail.
   *
   * @param email - Email of the user
   * @param userBankDetailDTO - Data Transfer Object containing user BankDetail details
   * @returns {Promise<any>} - A Promise that resolves when the BankDetail is successfully created
   */
  async create(
    email: string,
    userBankDetailDTO: UserBankDetailDTO
  ): Promise<any> {
    // Logging the action of creating user BankDetail in the service layer
    logger.info("Creating user BankDetail [UserBankDetailService]");
    return userBankDetailDao.create(email, userBankDetailDTO);
  }

  /**
   * Updates an existing user BankDetail.
   *
   * @param email - Email of the user
   * @param userBankDetailDTO - Data Transfer Object containing updated user BankDetail details
   * @returns {Promise<any>} - A Promise that resolves when the BankDetail is successfully updated
   */
  async update(
    email: string,
    userBankDetailDTO: UserBankDetailDTO
  ): Promise<any> {
    // Logging the action of updating user BankDetail in the service layer
    logger.info("Updating user BankDetail [UserBankDetailService]");

    return userBankDetailDao.update(email, userBankDetailDTO);
  }
}

// Exporting an instance of the UserBankDetailService class
export default new UserBankDetailService();
