// Load dynamoose libraries
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

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


// Class definition for UserSubscriptionDao implementing BaseDao
class UserSubscriptionDao implements BaseDao {
  modelName = "user";
  partitianKey = "USR#EML#{primaryEmail}";
  sortKeys = { SK_SUBS: "SUBS#CAND#ID#{subsId}" };

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
      GSI1PK: this.sortKeys.SK_SUBS.strtr({
        "ID#{subsId}": "",
      }),
      GSI1SK: this.partitianKey.strtr({
        "{primaryEmail}": email,
      }),
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
}

// Export an instance of UserSubscriptionDao
const userSubscriptionDao = new UserSubscriptionDao();

export default userSubscriptionDao;
