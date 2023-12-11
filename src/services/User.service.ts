// Load the local daos
import userDetailDao from "../daos/UserDetail.dao";
import userReferralDao from "../daos/UserReferral.dao";
import userSubscriptionDao from "../daos/UserSubscription.dao";

// Load the local dtos
import {
  UserLinkedinSignUpDTO,
  UserReferralRequestDTO,
} from "../dtos/User.dto";

// @todo all methods from everything (Dao, Service, etc) should return the response,
// it will help the caller to know what happed with the action and what is the response.

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
      console.log("Get user detail by id [service]");
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
    // @todo Kindly update the method name to "getSubscriptionDetails" (S capital).
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
      console.log("Create candidate/employee [service]");
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
      console.log("update EmailVerify Status [service]");
      const SK = await userDetailDao.getUserDetailSK(email);
      userDetailDao.updateEmailVerify(SK, email);
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
    // @todo change the method name to "updateUserDetails" and update the code to update all ther attributes not just CV.
    try {
      console.log("Update user resume [service]");
      const SK = await userDetailDao.getUserDetailSK(email);
      userDetailDao.updateCv(SK, email, resume);
    } catch (error) {
      throw error;
    }
  }
}

// Export an instance of the UserService class
export default new UserService();
