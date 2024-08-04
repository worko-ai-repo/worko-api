// import luxon
import { DateTime } from 'luxon';

// Load the local daos
import userSubscriptionDao from "../daos/UserSubscription.dao";
import MasterSubscriptionService from "./MasterSubscription.service";

// Load the local dtos
import { SubscriptionCreateRequestDTO, SubscriptionCreateDTO, SubscriptionUpdateDTO } from "../dtos/Subscription.dto";

// Load the local dynamoose libraries 
import { QueryResponse, ScanResponse } from "dynamoose/dist/ItemRetriever";

// Load the local model
import { DbUserSubsDto } from "../db/models/UserSubscription.model";

// Load the local utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError } from "../utils/errors.util";

// Load the local services
import UserService from './User.service';
import UserDetailService from './UserDetail.service';
import { RecordListingFilterOptions, RecordListingResponseDTO } from '../dtos/Common.dto';

// import enums
import { UserSubscriptionType, UserSubscriptionStatus } from '../enums/UserSubscription.enum';

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
    const mastersubscriptionDetails = await MasterSubscriptionService.getById(masterSubscriptionId);
    if (!mastersubscriptionDetails) {
      throw new BaseError("The Master subscription for given Id is not found.", HttpStatusCode.NOT_FOUND_404);
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
    let newSubscription = await userSubscriptionDao.create(subscriptionDto, email);

    // Do necessary update of subscription
    await this.updateUserDetailsCountsOnNewSubscription(email, newSubscription.id);

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
  async getById(email: string, id: string): Promise<QueryResponse<DbUserSubsDto>> {
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
    return userSubscriptionDao.update(email, userSubscriptionId, updatedSubscriptionDto);
  }

  /**
   * getActiveSubscriptionForUser
   *
   * getActiveSubscriptionForUser
   *
   * @param email - Email of the user
   */
  async getActiveSubscriptionForUser(email: string): Promise<QueryResponse<DbUserSubsDto>> {
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
  async updateUserDetailsCountsOnNewSubscription(userEmail: string, newSubscriptionId: string): Promise<void> {
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

  /**
   * getUsersAllSubscriptions
   * 
    * This function is intended to retrive the details for all user subscriptions
   *  It should be used exclusively for this purpose and should not be
   * used for any other operations or purposes.
   * Retrieves all user subscriptions.
   *
   * @returns {Promise<QueryResponse<DbUserSubsDto>>} All user subscriptions
   */
  async getAllUsersSubscriptions(options: RecordListingFilterOptions): Promise<QueryResponse<DbUserSubsDto>> {
    return userSubscriptionDao.getAllUsersSubscriptions(options);
  }

  /**
   * updateUserSubscriptionGSIsWithSubsId
   *
   * This function is intended to update the GSI1SK and GSI1PK for all user subscriptions
   * in the database. It should be used exclusively for this purpose and should not be
   * used for any other operations or purposes.
   *
   * Updates the GSI1PK and GSI1SK for a specific user subscription.
   *
   * @param {string} email - The email of the user
   * @param {string} id - The ID of the subscription
   * @param {string} newGSI1PK - The new GSI1PK value
   * @param {string} newGSI1SK - The new GSI1SK value
   * @returns {Promise<DbUserSubsDto>} The updated user subscription
   */
  async updateUserSubscriptionGSIsWithSubsId(email: string, id: string): Promise<DbUserSubsDto> {
    global.logger.info("Updateing User SUbscription GSIs [service]");
    return userSubscriptionDao.updateUserSubscriptionGSIsWithSubsId(email, id);
  }

  /**
   * Adds a free subscription for a user.
   *
   * @param {string} email - The email of the user.
   * @return {Promise< DbUserSubsDto>} - A promise that resolves when the free subscription is added successfully.
   * @throws {BaseError} - If the user already has a subscription.
   * This module defines a route for creating a free subscription for a user.
   * Note: This route is intended to be used only for one-time purposes, such as to add subscription for a missing user account.
   * It should not be used for any internal purposes or major subscription management tasks.
   *
   */
  async addUserFreeSubscription(email: string): Promise<DbUserSubsDto> {
    // Log the action of fetching user bought subscription list
    global.logger.info("Adding Free Subscription for user [service]");

    // Retrieve the user's existing subscriptions, if any
    let userExistingSubscriptions = await userSubscriptionDao.get(email);

    // Throw an error if any subscriptions are found
    if (userExistingSubscriptions.count > 0) {
      throw new BaseError(
        "Cannot add a free subscription. The user already has an existing subscription.",
        HttpStatusCode.CONFLICT_409
      );
    }

    // Retrieve the FREE subscription plan for the candidate
    const planName = UserSubscriptionType.FREE;
    const subscriptionPlan = await MasterSubscriptionService.getByPlan(planName);

    // Throw an error if the subscription plan is not found
    if (!subscriptionPlan) {
      throw new BaseError(
        `Unable to add free subscription: The subscription plan '${planName}' does not exist in the system.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    // Create partial data for subscription
    const subscriptionCreateRequest: SubscriptionCreateRequestDTO = {
      status: UserSubscriptionStatus.ACTIVE,
      orderId: "0",
      requestedReferrals: 0,
      acceptedReferrals: 0,
      completedReferrals: 0,
    };
    return await this.create(subscriptionPlan.SK, email, subscriptionCreateRequest);
  }
}


// Export an instance of the UserSubscriptionService class
export default new UserSubscriptionService();
