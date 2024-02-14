// Load the local daos
import userAvailabilityDao from "../daos/UserAvailability.dao";

//Load the local dto
import { UserAvailabilityDTO } from "../dtos/UserAvailability.dto";

/**
 * UserAvailabilityService class is responsible for managing user Availability-related operations.
 */
class UserAvailabilityService {
  /**
   * Retrieves user Availability by email.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - A Promise that resolves to the Availability of the user
   */
  async get(email: string): Promise<any> {
    // Logging the action of getting user Availability by email in the service layer
    global.logger.info(
      "Fetching user Availability by email [UserAvailabilityService]"
    );
    return userAvailabilityDao.get(email);
  }

  /**
   * Creates a new user Availability.
   *
   * @param email - Email of the user
   * @param userAvailabilityDTO - Data Transfer Object containing user Availability details
   * @returns {Promise<any>} - A Promise that resolves when the Availability is successfully created
   */
  async create(
    email: string,
    userAvailabilityDTO: UserAvailabilityDTO
  ): Promise<any> {
    // Logging the action of creating user Availability in the service layer
    global.logger.info("Creating user Availability [UserAvailabilityService]");
    return userAvailabilityDao.create(email, userAvailabilityDTO);
  }

  /**
   * Updates existing user Availability.
   *
   * @param email - Email of the user
   * @param userAvailabilityDTO - Data Transfer Object containing updated user Availability details
   * @returns {Promise<any>} - A Promise that resolves when the Availability is successfully updated
   */
  async update(
    email: string,
    userAvailabilityDTO: UserAvailabilityDTO
  ): Promise<any> {
    // Logging the action of updating user Availability in the service layer
    logger.info("Updating user Availability [UserAvailabilityService]");

    return userAvailabilityDao.update(email, userAvailabilityDTO);
  }
}

// Exporting an instance of the UserAvailabilityService class
export default new UserAvailabilityService();
