// import dynamoose types
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Load dtos
import { SubscriptionListingFilterOptions } from "../dtos/Subscription.dto";
import { PaginatedResultsWithMatchingConditionsResponse } from "../../dtos/Common.dto";

// Import DAOs
import userSubscriptionDao from "../../daos/UserSubscription.dao";

// Load enums
import { UserSubscriptionStatus } from "../../enums/UserSubscription.enum";

// Import models
import { DbUserSubsDto } from "../../db/models/UserSubscription.model";

/**
 * UserSubscriptionService
 *
 * Service class to handle operations related to user subscriptions.
 */
class UserSubscriptionService {
  /**
   * getAllUsersSubscriptions
   * 
   * A function to fetch all user subscriptions.
   *
   * @param {SubscriptionListingFilterOptions} subscriptionRecordListingFilterRequest - Options for filtering user subscriptions.
   */
  async getAllUsersSubscriptions(
    subscriptionRecordListingFilterRequest: SubscriptionListingFilterOptions
  ): Promise<PaginatedResultsWithMatchingConditionsResponse<DbUserSubsDto>> {
    // Log the action of fetching user bought subscription list
    global.logger.info(
      "Fetching User's Bought Subscription List in [admin user subscription service]"
    );

    // Retrieve user subscriptions from DAO
    return userSubscriptionDao.getAllUsersSubscriptionsAdmin(
      subscriptionRecordListingFilterRequest
    );
  }

  /**
   * getSubscriptionDetailById
   *
   * Retrieves the user subscription detail by ID.
   *
   * @param {string} subscriptionId - The ID of the user subscription.
   * @return {Promise<QueryResponse<DbUserSubsDto>>} A promise that resolves to the query response containing the user subscription detail.
   */
  async getSubscriptionDetailById(
    subscriptionId: string
  ): Promise<QueryResponse<DbUserSubsDto>> {
    // Log the action of fetching user bought subscription by id
    global.logger.info(
      "Fetching User's Bought Subscription by ID in [admin user subscription service]"
    );

    // Retrieve user subscriptions from DAO by subscription id
    return userSubscriptionDao.getSubscriptionDetailById(subscriptionId);
  }

  /**
   * getUserSubscriptionsByEmail
   *
   * Retrieves the list of user subscriptions based on the provided email and status.
   *
   * @param {string} userEmail - The email of the user.
   * @param {UserSubscriptionStatus} [subscriptionStatus] [Optional] - The status of the subscriptions (optional).
   * @return {Promise<QueryResponse<DbUserSubsDto>>} A promise that resolves to the query response containing the list of user subscriptions.
   */
  async getUserSubscriptionsByEmail(
    userEmail: string,
    subscriptionStatus?: UserSubscriptionStatus
  ): Promise<QueryResponse<DbUserSubsDto>> {
    // Log the action of fetching user bought subscription list
    global.logger.info(
      "Fetching User's Bought Subscription List in [admin user subscription service]"
    );

    // Retrieve user subscriptions from DAO
    return userSubscriptionDao.getUserSubscriptionsByEmail(
      userEmail,
      subscriptionStatus
    );
  }
}

// Create an instance of UserSubscriptionService
const userSubscriptionServiceObj = new UserSubscriptionService();

// Export the UserSubscriptionService instance and class
export { userSubscriptionServiceObj, UserSubscriptionService };
