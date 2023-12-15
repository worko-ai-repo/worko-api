// Load the local daos
import userSubscriptionDao from "../daos/UserSubscription.dao";

// Load the local dtos
import SubscriptionDTO from "../dtos/Subscription.dto";
import { SubscriptionPlanDetailDTO } from "../dtos/MasterSubscription.dto";

/**
 * UserSubscriptionService
 *
 *  Responsible for handling user subscription-related operations.
 */
class UserSubscriptionService {
  constructor() {}

  /**
   *
   * Creates a new subscription based on provided details.
   *
   * @param subscriptionDto - Subscription details
   * @param email - Email of the user creating the subscription
   * @returns
   */
  async createNewSubscription(subscriptionDto: SubscriptionDTO, email: string) {
    try {
      return userSubscriptionDao.addSubscription(subscriptionDto, email);
    } catch (error) {
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
   *
   * Creates a new subscription based on provided details.
   *
   * @param subscriptionDto - Subscription details
   * @param email - Email of the user creating the subscription
   * @returns
   */
  async createSubscription(
    subscriptionPlanDetailDto: SubscriptionPlanDetailDTO,
    email: string
  ) {
    console.log("create subscription for candidate[service]");
    return userSubscriptionDao.addNewSubscription(
      subscriptionPlanDetailDto,
      email
    );
  }
}

// Export an instance of the UserSubscriptionService class
export default new UserSubscriptionService();
