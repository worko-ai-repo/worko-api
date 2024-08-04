// Load dynamoose libraries
import { QueryResponse, ScanResponse } from "dynamoose/dist/ItemRetriever";

//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import {
  DbUserSubsDto,
  UserSubModel,
} from "../db/models/UserSubscription.model";

//Load the local dtos
import {
  SubscriptionCreateDTO,
  SubscriptionUpdateDTO,
} from "../dtos/Subscription.dto";

// Load the local enums
import { UserSubscriptionStatus } from '../enums/UserSubscription.enum';

//Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";
import { RecordListingFilterOptions, RecordListingResponseDTO } from "../dtos/Common.dto";
import { lastKeyToBase64EncodeStr } from "../helpers/dynamoose.helper";


// Class definition for UserSubscriptionDao implementing BaseDao
class UserSubscriptionDao implements BaseDao {
  modelName = "user";
  partitianKey = "USR#EML#{primaryEmail}";
  sortKeys = { SK_SUBS: "SUBS#CAND#ID#{subsId}" };
  
  GSI1PK: string = "SUBS#CAND#";
  GSI1SK = "ID#{id}";
  /**
   * Fetches subscription details based on user email
   * 
   * @todo rename this to "getUserSubscriptions"
   *
   * @param email - Email used to fetch subscription details
   * @returns Promise of subscription details
   */
  async get(email: string): Promise<QueryResponse<DbUserSubsDto>> {
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });

    return UserSubModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith("SUBS#CAND#ID#")
      .attributes([
        "status",
        "name",
        "creditedReferrals",
        "availableReferrals",
        "requestedReferrals",
        "acceptedReferrals",
        "completedReferrals",
        "expiryDate",
        "purchaseDate",
      ])
      .exec();
  }

  /**
   * getById
   *
   * Retrieves a specific subscription for a user by its ID.
   * 
   * @todo rename this to "getUserSubscriptionBySubId"
   *
   * @param email - The user's email address, used as the primary key in the database.
   * @param id - The unique identifier of the subscription.
   * @returns A promise that resolves to a query response containing the subscription details.
   */
  async getById(
    email: string,
    id: string
  ): Promise<QueryResponse<DbUserSubsDto>> {
    global.logger.info("Get subscription by id [DAO]");

    // Generate the partition key using the user's email
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });

    // Generate the sort key using the subscription ID
    const SK = this.sortKeys.SK_SUBS.strtr({
      "{subsId}": id,
    });

    // Query the database for the specific subscription
    return UserSubModel.query("PK").eq(PK).where("SK").eq(SK).exec();
  }

  /**
   * create a subscription using SubscriptionDTO and email
   *
   * @param subscriptionDto - Subscription data to be added
   * @param email - Email associated with the subscription
   */
  async create(
    subscriptionDto: SubscriptionCreateDTO,
    email: string
  ): Promise<DbUserSubsDto> {
    let id = UlidService.getUlidId();
    const newSubscriptionDto = {
      ...subscriptionDto,
      PK: this.partitianKey.strtr({ "{primaryEmail}": email }),
      SK: this.sortKeys.SK_SUBS.strtr({
        "{subsId}": id,
      }),
      GSI1PK: this.GSI1PK,
      GSI1SK: this.GSI1SK.strtr({ "{id}": id }),
      id: id,
    };
    return UserSubModel.create(newSubscriptionDto);
  }

  /**
   * update
   *
   * Updates the subscription details for a given user email.
   *
   * @param email - Email of the user
   * @param userSubscriptionId - subscription Id of the user
   * @param updatedSubscriptionDto - Updated subscription details
   * @returns Promise<DbUserSubsDto> - Promise resolving to the updated subscription details
   */
  async update(
    email: string,
    userSubscriptionId: string,
    updatedSubscriptionDto: SubscriptionUpdateDTO
  ): Promise<DbUserSubsDto> {
    global.logger.info("Update subscription [DAO]");

    // Generate the keys using the user's email and subscription ID
    const PK = this.partitianKey.strtr({ "{primaryEmail}": email });
    const SK = this.sortKeys.SK_SUBS.strtr({ "{subsId}": userSubscriptionId });
    return UserSubModel.update({ PK: PK, SK: SK }, updatedSubscriptionDto);
  }

  /**
   * getActiveSubscriptionForUser
   * 
   * Gets the active subscription for a given user.
   * 
   * @todo rename this to "getUserActiveSubscriptions"
   *
   * @param email - The user's email address.
   * @returns A promise that resolves to the user's active subscription, if any.
   */
  async getActiveSubscriptionForUser(
    email: string
  ): Promise<QueryResponse<DbUserSubsDto>> {
    global.logger.info("Get active subscription for user [DAO]");

    // Create the partition key from the user's email
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });

    // Query the database for an active subscription
    return UserSubModel.query("PK")
      .eq(PK) 
      .where("SK")
      .beginsWith("SUBS#CAND#ID#") 
      .where("status")
      .eq(UserSubscriptionStatus.ACTIVE) // Only get active ones
      .exec();
  }

  /**
   * getUsersAllSubscriptions
   * 
    * This function is intended to retrive the details for all user subscriptions
   *  It should be used exclusively for this purpose and should not be
   * used for any other operations or purposes.
   * Retrieves all user subscriptions.
   * Retrieves all user subscriptions from the database.
   *
   */
  async getAllUsersSubscriptions(options: RecordListingFilterOptions): Promise<QueryResponse<DbUserSubsDto>> {
    console.log("Options for paginatins with data ", options)
    global.logger.info("Get all user subscriptions [DAO]");
    // construct query
    let query = UserSubModel.query("GSI1PK").eq("SUBS#CAND#");

    // apply lastkey if provided
    if (options.lastKey) {
      query = query.startAt(options.lastKey);
    }

    // apply pageSize if provided
    if (options.pageSize) {
      query = query.limit(options.pageSize);
    }
    return query.exec();
  };

  /**
   * updateUserSubscriptionGSIsWithSubsId
   *
   * This function is intended to update the GSI1SK and GSI1PK for all user subscriptions
   * in the database. It should be used exclusively for this purpose and should not be
   * used for any other operations or purposes.
   * 
   * Updates the GSI1PK and GSI1SK for a specific user subscription in the database.
   *
   * @param {string} email - The email of the user
   * @param {string} id - The ID of the subscription
   * @param {string} newGSI1PK - The new GSI1PK value
   * @param {string} newGSI1SK - The new GSI1SK value
   * @returns {Promise<DbUserSubsDto>} The updated user subscription
   */
  async updateUserSubscriptionGSIsWithSubsId(
    email: string,
    id: string,
  ): Promise<DbUserSubsDto> {
    global.logger.info("Update User Subscriptions GSIs[DAO}");

    // prepare The keys.
    const PK = this.partitianKey.strtr({ "{primaryEmail}": email });
    const SK = this.sortKeys.SK_SUBS.strtr({ "{subsId}": id });

    // retrun with updated keys and valeus
    return UserSubModel.update(
      { PK, SK },
      { GSI1PK: this.GSI1PK, GSI1SK: this.GSI1SK.replace("{id}", id) },
    );
  }
}

// Export an instance of UserSubscriptionDao
const userSubscriptionDao = new UserSubscriptionDao();

export default userSubscriptionDao;
