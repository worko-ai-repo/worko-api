// Load the local enums
import { UserType } from "../enums/User.enum";

// Load the local daos
import userDetailDao from "../daos/UserDetail.dao";

// Load the local dtos
import { UserDetailDTO } from "../dtos/UserDetail.dto";
import { EmailTemplatePlaceholderCAND_WELCOME_MSG, EmailTemplatePlaceholderEMP_WELCOME_MSG } from "../dtos/EmailTemplatePlaceholder.dto";

// Load the local libraies
import { EmailSourceDestinationAddress } from "../libraries/email.library";

// Load the local services
import UserService from "./User.service";

// Inport local utils
import { BaseError } from "../utils/errors.util";

// @todo all methods from everything (Dao, Service, etc) should return the response,
// it will help the caller to know what happed with the action and what is the response.

/**
 *  UserDetailService class responsible for managing user-related operations.
 */
class UserDetailService {
  /**
   * Retrieves user details by email id.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - Details of the user
   */
  async get(email: string) {
    console.log("Get user detail by email [service]");
    return userDetailDao.get(email);
  }

  /**
   * Retrieves user details by user id.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - Details of the user
   */
  async getUserById(userId: string) {
    console.log("Get user detail by email [service]");
    return userDetailDao.getUserById(userId);
  }

  /**
   * Updates an existing user Detail.
   *
   * @param email - Email of the user
   * @param userDetailDTO - Data Transfer Object containing updated user Detail details
   * @returns {Promise<any>} - A Promise that resolves when the Detail is successfully updated
   */
  async update(
    email: string,
    SK: string,
    userDetailDTO: Partial<UserDetailDTO>
  ): Promise<any> {
    // Logging the action of updating user Detail in the service layer
    logger.info("Updating user Detail [UserDetailService]");

    return userDetailDao.update(email, SK, userDetailDTO);
  }
  
  /**
   * Retrieves user details and sends a welcome email based on the user type.
   *
   * @param userEmail - Email of the user
   * @returns {Promise<boolean>} - True if email was sent successfully, false otherwise
   */
  async sendWelcomeEmail(userEmail: string): Promise<boolean> {
    logger.info(
      `Attempting to send welcome email for user: ${userEmail} [UserDetailService]`
    );
    
    // Retrieve the userSignupDetails by userEmail provided in message
    const userSignupDetails = await this.get(userEmail);

    // If no user found, log and return false
    if (!userSignupDetails.count) {
      throw new BaseError(`The user details not found for the provided email "${userEmail}" address.`);
    }

    // Retrieve userDetails and userTypes from userSignUpdetails
    const userDetails = userSignupDetails[0];
    const userType = userDetails.userType[0];    
    const name: string = userDetails.name;
    const email: string = userDetails.emailList.primary;
    const toAddress: EmailSourceDestinationAddress = {
      email: email,
      fullName: name,
    };

    // Check if the user type is invalid
    if (![UserType.CAND as string, UserType.EMP as string].includes(userType)){
      throw new BaseError(`Unable to identify the user type for the provided email "${userEmail}" address.`);
    }

    // Check if the user type is cand then send candidate email
    if (userType === UserType.CAND) {
      const emailPlaceholders: EmailTemplatePlaceholderCAND_WELCOME_MSG = {
        candName: name.toTitleCase(),
      };

      // Send a welcome email to the candidate
      await UserService.sendEmailToCandWelcomeMessage(
        emailPlaceholders,
        toAddress
      );
    } 
    // Check if the user type is EMP then send employee email
    else if (userType === UserType.EMP) {
      const emailPlaceholders: EmailTemplatePlaceholderEMP_WELCOME_MSG = {
        empName: name.toTitleCase(),
      };

      // Send a welcome email to the employer
      await UserService.sendEmailToEmpWelcomeMessage(
        emailPlaceholders,
        toAddress
      );
    }

    return true;
  }

  /**
 * updateLastAccessedDash
 * 
 * Updates the last accessed dashboard for a user
 *
 * @param email - Email of the user
 * @param userlastAccessedDash - User's Last Accessed Dashboard
 */
  async updateLastAccessedDash(email: string, userLastAccessedDash: string) {
    // Fetch the User Details .
    let userDetails = await this.get(email);

    // Throw BaseError if user not present
    if (!userDetails.count) {
      throw new BaseError(`The user details not found for the provided email "${email}" address.`);
    }

    // Prepare the details required to be updated for the user
    let userModifiedDetails: Partial<UserDetailDTO> = {
      lastAccessedDash: userLastAccessedDash
    };

    // Check if userType exists or does not exist
    const updatedUserType = userDetails[0].userType || [];

    // If the userType is not present then add it. 
    if (!updatedUserType.includes(userLastAccessedDash)) {
      // Push the user type as it is not present
      updatedUserType.push(userLastAccessedDash);

      // Update the user type
      userModifiedDetails.userType = updatedUserType;
    }

    // Update the user details
    return this.update(email, userDetails[0].SK, userModifiedDetails)
  }
}

// Export an instance of the UserService class
export default new UserDetailService();
