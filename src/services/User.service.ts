// Load the local daos
import userDetailDao from "../daos/Userdetail.dao";
import userSubscriptionDao from "../daos/Usersubscription.dao";
import userReferralDao from "../daos/Userreferral.dao";

// Load the local dtos
import {
  UserLinkedinSignUpDTO,
  UserReferralRequestDTO,
} from "../dtos/User.dto";

/**
 *  UserService class responsible for managing user-related operations.
 */
class UserService {
  /**
   * Retrieves user details by email id.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - Details of the user
   */
  async getUserByEmail(email: string) {
    try {
      return userDetailDao.getUserDetails(email);
    } catch (error) {
      console.log("Error -> ", error);
      throw error;
    }
  }

  /**
   * Retrieves subscription details by user email id.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - Subscription details of the user
   */
  async getsubscriptionDetails(email: string) {
    try {
      return userSubscriptionDao.subscriptionDetails(email);
    } catch (error) {
      console.log("Error -> ", error);
      throw error;
    }
  }

  /**
   * create a new user with provided details.
   *
   * @param userSignUpDTO - Details of the user to be added
   * @param email - Email of the user
   */
  async addUser(userSignUpDTO: UserLinkedinSignUpDTO, userType: string) {
    try {
      userDetailDao.add(userSignUpDTO, userType);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Processes a referral request made by a user(candidate).
   *
   * @param referralRequest - Referral request details
   * @param email - Email of the user making the referral request
   */
  async referralRequest(
    referralRequest: UserReferralRequestDTO,
    email: string
  ) {
    try {
      userReferralDao.requestReferral(referralRequest, email);
    } catch (error) {
      throw error;
    }
  }

  /**
   * EmailVerified
   *
   * @param email - Email of the user making the request
   */
  async verifyEmail(email: string) {
    try {
      userDetailDao.updateEmailVerify(email);
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * updateUserCV
   *
   * @param email
   * @param resume
   */
  async updateUserCV(email: string, resume: string) {
    try {
      userDetailDao.updateCv(email, resume);
    } catch (error) {
      throw error;
    }
  }
}

// Export an instance of the UserService class
export default new UserService();
