// Load the local daos
import userDetailDao from "../daos/UserDetail.dao";
import userSubscriptionDao from "../daos/UserSubscription.dao";
import { SubscriptionPlanDetailDTO } from "../dtos/MasterSubscription.dto";

// Load the local dtos
import { UserLinkedinSignUpDTO } from "../dtos/User.dto";
import MasterSubscriptionService from "./MasterSubscription.service";
import UserSubscriptionService from "./UserSubscription.service";

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
      return userDetailDao.getUserInfo(email);
    } catch (error) {
      console.log("Error -> ", error);
      throw error;
    }
  }

  /**
   * Retrieves user details by email id.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - Details of the user
   */
  async getUserDetailByEmail(email: string, SK: string) {
    try {
      console.log("Get user detail by id [service]");
      return userDetailDao.getUserDetails(email, SK);
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
      if (userType === "CAND") {
        userDetailDao.add(userSignUpDTO, userType);
        const subscriptionPlanDetailDTO: SubscriptionPlanDetailDTO =
          await MasterSubscriptionService.getSubscriptionPlanDetail("Free");
        UserSubscriptionService.createSubscription(
          subscriptionPlanDetailDTO,
          userSignUpDTO.email
        );
      } else {
        userDetailDao.add(userSignUpDTO, userType);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * getSK
   *
   * @param email - Email of the user making the request
   */
  async getSK(email: string) {
    console.log("Get user SK [service]");
    return userDetailDao.getUserDetailSK(email);
  }

  /**
   *
   *  getSubscriptionStatus
   *
   * @param email - Email of the user making the request
   * @param SK
   * @returns
   */
  async getSubscriptionStatus(email: string, SK: string) {
    console.log("Get user Subscription status [service]");
    return userDetailDao.getUserSubscriptionStatus(email, SK);
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

  /**
   *
   * Decrease referral
   *
   * @param email
   */
  async decreaseReferralCount(email: string) {
    console.log("Decrease referral count [service]");
    //To Get SK
    const SK = await this.getSK(email);
    //To Get referral count
    const refCount = await userDetailDao.getUserSubscriptionStatus(email, SK);
    console.log("refCount: ", refCount[0].referralCount);
    const currRefCount = refCount[0].referralCount - 1;
    //if referral count is below 1 then subscription status is set to be false
    if (currRefCount < 1) {
      userDetailDao.updateIsSubscribedStatus(SK, email, false);
    }
    /* Ensure that the referral count is never below zero.
    If somehow the referral count goes below zero (negative number),
    reset it to zero to maintain a non-negative count. */
    if (currRefCount < 0) {
      return userDetailDao.updateReferralCount(SK, email, 0);
    }
    // updating referral count
    return userDetailDao.updateReferralCount(SK, email, currRefCount);
  }
}

// Export an instance of the UserService class
export default new UserService();
