// Load the local daos
import UsersubscriptionDao from "../daos/Usersubscription.dao";

// Load the local dtos
import SubscriptionDTO from "../dtos/Subscription.dto";

/**
 * SubscriptionService
 *
 *  Responsible for handling subscription-related operations.
 */
class SubscriptionService {
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
      return UsersubscriptionDao.addSubscription(subscriptionDto, email);
    } catch (error) {
      throw error;
    }
  }
}

// Export an instance of the SubscriptionService class
export default new SubscriptionService();
