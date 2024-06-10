// import luxon
import { DateTime } from 'luxon';

// Load the local daos
import userSubscriptionDao from "../daos/UserSubscription.dao";
import MasterSubscriptionService from "./MasterSubscription.service";

// Load the local dtos
import {SubscriptionCreateRequestDTO, SubscriptionCreateDTO, SubscriptionUpdateDTO} from "../dtos/Subscription.dto";

// Load the local dynamoose libraries 
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Load the local model
import { DbUserSubsDto } from "../db/models/UserSubscription.model";

// Load the local utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError } from "../utils/errors.util";

// Load the local services
import UserService from './User.service';
import UserDetailService from './UserDetail.service';

/**
 * UserSubscriptionService
 *
 *  Responsible for handling user subscription-related operations.
 */
class UserSubscriptionService {
  constructor() {}

  /**
   * Creates a new subscription based on provided details.
   *
   * @param {string} masterSubscriptionId - The ID of the master subscription
   * @param {string} email - The email of the user creating the subscription
   * @param {SubscriptionCreateRequestDTO} subscriptionCreateRequest - The details of the subscription to be created
   * @returns {Promise<DbUserSubsDto>} - A promise that resolves to the newly created subscription
   * @throws {BaseError} - If the master subscription for the given ID is not found
   */
  async create(
    masterSubscriptionId: string,
    email: string,
    subscriptionCreateRequest: SubscriptionCreateRequestDTO
  ): Promise<DbUserSubsDto> {
    global.logger.info(`[ creating subscription for email: ${email} ]`);

    // Retrive mastersubscriptionDetails
    const mastersubscriptionDetails = await MasterSubscriptionService.getById(
      masterSubscriptionId
    );
    if (!mastersubscriptionDetails) {
      throw new BaseError(
        "The Master subscription for given Id is not found.",
        HttpStatusCode.NOT_FOUND_404
      );
    }
    global.logger.debug("Master subscription service detail.", {
      filePath: __filename,
      methodName: this.constructor.name,
      mastersubscriptionDetails: mastersubscriptionDetails,
    });

    // Use Luxon for date manipulation
    const purchaseDate = DateTime.now();

    // Calculating expiryDate based on purchaseDate and duration
    const expiryDate = purchaseDate.plus({
      days: mastersubscriptionDetails.duration,
    });

    // Creating subscription details from the request details and master subscription details.
    const subscriptionDto: SubscriptionCreateDTO = {
      ...subscriptionCreateRequest,
      name: mastersubscriptionDetails.name,
      creditedReferrals: mastersubscriptionDetails.referralCount,
      availableReferrals: mastersubscriptionDetails.referralCount,
      expiryDate: expiryDate.toJSDate(),
      purchaseDate: purchaseDate.toJSDate(),
    };

    // Create New Subscription For User
    let newSubscription = await userSubscriptionDao.create(
      subscriptionDto,
      email
    );

    // Do necessary update of subscription
    await this.updateUserDetailsCountsOnNewSubscription(
      email,
      newSubscription.id
    );

    return newSubscription;
  }

  /**
   * Retrieves subscription details by user email id.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - Subscription details of the user
   */
  async get(email: string): Promise<QueryResponse<DbUserSubsDto>> {
    return userSubscriptionDao.get(email);
  }

  /**
   * Retrieves subscription details by user email id.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - Subscription details of the user
   */
  async getById(
    email: string,
    id: string
  ): Promise<QueryResponse<DbUserSubsDto>> {
    global.logger.info("[ getting subscription details by id ]");
    return userSubscriptionDao.getById(email, id);
  }
  /**
   * Updates the subscription details for a given user email.
   *
   * @param email - Email of the user
   * @param updatedSubscriptionDto - Updated subscription details
   * @returns Promise<any> - Promise resolving to the updated subscription details
   */
  async update(
    email: string,
    userSubscriptionId: string,
    updatedSubscriptionDto: SubscriptionUpdateDTO
  ): Promise<DbUserSubsDto> {
    global.logger.info("[ updating subscription details ]");
    return userSubscriptionDao.update(
      email,
      userSubscriptionId,
      updatedSubscriptionDto
    );
  }

  /**
   * getActiveSubscriptionForUser
   *
   * getActiveSubscriptionForUser
   *
   * @param email - Email of the user
   */
  async getActiveSubscriptionForUser(
    email: string
  ): Promise<QueryResponse<DbUserSubsDto>> {
    global.logger.info("[ getting active subscription id for user ]");
    return userSubscriptionDao.getActiveSubscriptionForUser(email);
  }

  /**
   * updateUserDetailsCountsOnNewSubscription
   * 
   * Updates the referral count and subscription status for a new user subscription.
   *
   * @param {string} userEmail - The email of the user.
   * @param {string} newSubscriptionId - The ID of the new subscription.
   * @throws {Error} If the new subscription is not found or the user details are not found.
   * @return {Promise<void>} A promise that resolves when the referral count and subscription status are updated.
   */
  async updateUserDetailsCountsOnNewSubscription(
    userEmail: string,
    newSubscriptionId: string
  ): Promise<void> {
    global.logger.info("[ updating user referral count on new subscription ]");
    // Get the new subscription details
    const newSubscription = await this.getById(userEmail, newSubscriptionId);

    if (!newSubscription || newSubscription.count === 0) {
      throw new Error("New subscription not found");
    }

    // Get the user details
    let userDetails = await UserDetailService.get(userEmail);
    if (!userDetails || userDetails.count === 0) {
      throw new Error("User Details not found");
    }

    // Update referralCount and isSubscribed in UserService
    await UserService.updateReferralCount(userDetails[0].id, userEmail, {
      referralCount: newSubscription[0].creditedReferrals,
      isSubscribed: true,
      expiryDate: newSubscription[0].expiryDate, // @todo we dont need this. If yes then change the name to "subscriptionExpiryDate"
    });
  }
}

// Export an instance of the UserSubscriptionService class
export default new UserSubscriptionService();
