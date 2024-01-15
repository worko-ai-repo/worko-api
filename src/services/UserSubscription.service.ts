// Load the local daos
import userSubscriptionDao from "../daos/UserSubscription.dao";
import MasterSubscriptionService from "./MasterSubscription.service";

// Load the local dtos
import SubscriptionDTO from "../dtos/Subscription.dto";
import { UserSubscriptionStatus } from "../enums/UserSubscriptionStatus.enum";

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
  async create(masterSubscriptionId: string, email: string) {
    const result = await MasterSubscriptionService.getById(
      masterSubscriptionId
    );
    global.logger.debug("Master subscription service detail.", {
      filePath: __filename,
      methodName: this.constructor.name,
      result: result,
    });
    const purchaseDate = new Date();

    // Calculating expiryDate based on purchaseDate and duration
    const expiryDate = new Date(purchaseDate);
    expiryDate.setDate(purchaseDate.getDate() + result.duration);
    const subscriptionDto: SubscriptionDTO = {
      amount: result.amount,
      status: UserSubscriptionStatus.ACTIVE,
      name: result.name,
      availableReferrals: result.referralCount,
      acceptedReferrals: 0,
      requestedReferrals: 0,
      expiryDate: expiryDate,
      purchaseDate: purchaseDate,
    };
    return userSubscriptionDao.create(subscriptionDto, email);
  }

  /**
   * Retrieves subscription details by user email id.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - Subscription details of the user
   */
  async get(email: string) {
    return userSubscriptionDao.get(email);
  }
}

// Export an instance of the UserSubscriptionService class
export default new UserSubscriptionService();
