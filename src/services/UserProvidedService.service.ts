// Load the local daos
import userProvidedServiceDao from "../daos/UserProvidedService.dao";

//Load the local dto
import { UserProvidedServiceDTO } from "../dtos/UserProvidedService.dto";

/**
 * UserProvidedServiceService class is responsible for managing user ProvidedService-related operations.
 */
class UserProvidedServiceService {
  /**
   * Retrieves user ProvidedService by email.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - A Promise that resolves to the ProvidedService of the user
   */
  async get(email: string): Promise<any> {
    // Logging the action of getting user ProvidedService by email in the service layer
    logger.info(
      "Fetching user ProvidedService by email [UserProvidedServiceService]"
    );
    return userProvidedServiceDao.get(email);
  }

  /**
   * Creates a new user ProvidedService.
   *
   * @param email - Email of the user
   * @param userProvidedServiceDTO - Data Transfer Object containing user ProvidedService details
   * @returns {Promise<any>} - A Promise that resolves when the ProvidedService is successfully created
   */
  async create(
    email: string,
    userProvidedServiceDTO: UserProvidedServiceDTO
  ): Promise<any> {
    // Logging the action of creating user ProvidedService in the service layer
    logger.info("Creating user ProvidedService [UserProvidedServiceService]");
    return userProvidedServiceDao.create(email, userProvidedServiceDTO);
  }

  /**
   * Updates an existing user ProvidedService.
   *
   * @param email - Email of the user
   * @param userProvidedServiceDTO - Data Transfer Object containing updated user ProvidedService details
   * @returns {Promise<any>} - A Promise that resolves when the ProvidedService is successfully updated
   */
  async update(
    email: string,
    SK: string,
    userProvidedServiceDTO: UserProvidedServiceDTO
  ): Promise<any> {
    // Logging the action of updating user ProvidedService in the service layer
    logger.info("Updating user ProvidedService [UserProvidedServiceService]");

    return userProvidedServiceDao.update(email, SK, userProvidedServiceDTO);
  }
}

// Exporting an instance of the UserProvidedServiceService class
export default new UserProvidedServiceService();
