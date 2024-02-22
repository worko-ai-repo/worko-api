// Load the local daos
import userDao from "../daos/User.dao";
import userDetailDao from "../daos/UserDetail.dao";
import userSubscriptionDao from "../daos/UserSubscription.dao";

// Load the local dtos
import { UserSignUpDTO } from "../dtos/User.dto";
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
    global.logger.info("Get user detail by id [service]");
    return userDao.getUserInfo(email);
  }

  /**
   * Retrieves user details by email id.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - Details of the user
   */
  async getUserDetailByEmail(email: string, SK: string) {
    global.logger.info("Get user detail by id [service]");
    return userDetailDao.getUserDetails(email, SK);
  }

  /**
   *Get Count(pk)
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - Details of the user
   */
  async getCount(email: string) {
    global.logger.info("Get count by id [service]");
    return userDao.getCount(email);
  }

  /**
   * create a new user with provided details.
   *
   * @param userSignUpDTO - Details of the user to be added
   * @param email - Email of the user
   */
  async addUser(userSignUpDTO: UserSignUpDTO, userType: string) {
    global.logger.info("Create candidate/employee [service]");
    //Creating new user
    const newUser = await userDetailDao.add(userSignUpDTO, userType);
    if (userType === "CAND") {
      //Adding the FREE subscription plan for Candidate
      const subPlan = await MasterSubscriptionService.getByPlan("Free");
      UserSubscriptionService.create(subPlan.SK, userSignUpDTO.email);
    }
    return newUser;
  }

  /**
   * getSK
   *
   * @param email - Email of the user making the request
   */
  async getSK(email: string) {
    global.logger.info("Get user SK [service]");
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
    global.logger.info("Get user Subscription status [service]");
    return userDetailDao.getUserSubscriptionStatus(email, SK);
  }

  /**
   * EmailVerified
   *
   * @param email - Email of the user making the request
   */
  async verifyEmail(email: string) {
    global.logger.info("update user Email status to true [service]");
    const SK = await userDetailDao.getUserDetailSK(email);
    userDetailDao.updateEmailVerify(SK, email);
  }

  /**
   *
   * updateUserCV
   *
   * @param email
   * @param resume
   */
  async updateUserCV(email: string, resume: string) {
    global.logger.info("Update user resume [service]");
    const SK = await userDetailDao.getUserDetailSK(email);
    userDetailDao.updateCv(SK, email, resume);
  }

  /**
   *
   * Decrease referral
   *
   * @param email
   */
  async decreaseReferralCount(email: string) {
    global.logger.info("Decrease referral count [service]");
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
