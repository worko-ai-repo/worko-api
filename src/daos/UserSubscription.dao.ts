// Load dynamoose libraries
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

//Load the base dao
import BaseDao from "./Base.dao";

// Load the helpers
import { getPaginatedResultsWithMatchingConditions } from "../helpers/dynamoose.helper";

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
import { PaginatedResultsWithMatchingConditionsResponse, RecordListingFilterOptions } from "../dtos/Common.dto";
import { SubscriptionListingFilterOptions } from "../admin/dtos/Subscription.dto";

// Load the local enums
import {
  UserSubscriptionStatus,
  UserSubscriptionType,
} from "../enums/UserSubscription.enum";
import { SortOrderTypeEnum } from "../enums/Common.enum";

//Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";

// Class definition for UserSubscriptionDao implementing BaseDao
class UserSubscriptionDao implements BaseDao {
  modelName = "UserSubs";
  partitianKey = "USR#EML#{primaryEmail}";
  sortKeys = { SK_SUBS: "SUBS#CAND#ID#{subsId}" };

  GSI1PK: string = "SUBS#CAND#";
  GSI1SK = "ID#{id}";

  /**
   * getAllUsersSubscriptionsAdmin
   *
   * Retrieves all user subscriptions based on the provided options and status for admin.
   *
   * @param {SubscriptionListingFilterOptions} subscriptionRecordListingFilterRequest - The options for filtering the user subscriptions.
   */
  async getAllUsersSubscriptionsAdmin(
    subscriptionRecordListingFilterRequest: SubscriptionListingFilterOptions
  ): Promise<PaginatedResultsWithMatchingConditionsResponse<DbUserSubsDto>> {
    // Log the action of fetching user bought subscription list
    global.logger.info(
      "Fetching User's Bought Subscription List in [admin dao]"
    );

    // query that returns all the subscriptions of a user
    let query = UserSubModel.query("GSI1PK")
      .eq(this.GSI1PK)
      .where("GSI1SK")
      .beginsWith("ID#")
      .where("name")
      .not()
      .eq(UserSubscriptionType.FREE);

    // if status is provided, add it to the query where status is equal to the provided value
    if (subscriptionRecordListingFilterRequest.status) {
      query = query
        .where("status")
        .eq(subscriptionRecordListingFilterRequest.status);
    }

    // When you use the sort() method in Dynamoose, it sorts the items based on the sort key of the index you're querying.
    query.sort(
      subscriptionRecordListingFilterRequest.sortOrder as SortOrderTypeEnum
    );

    // Apply date range filter if provided
    if (
      subscriptionRecordListingFilterRequest.fromDate ||
      subscriptionRecordListingFilterRequest.toDate
    ) {
      query = query.and().parenthesis((condition) => {
        if (subscriptionRecordListingFilterRequest.fromDate) {
          condition.where("purchaseDate").ge(subscriptionRecordListingFilterRequest.fromDate);
        }
        if (subscriptionRecordListingFilterRequest.toDate) {
          condition.where("purchaseDate").le(subscriptionRecordListingFilterRequest.toDate);
        }
        return condition;
      });
    }

    // search by searchText if provided
    if (subscriptionRecordListingFilterRequest.searchText) {
      // remove trailing and leading spaces from the search text
      let searchTextValue =
        subscriptionRecordListingFilterRequest.searchText.trim();

      /* 
      The and() method initiates a condition block where all conditions within it must be satisfied.
      The parenthesis() method allows grouping of conditions for complex queries.
      */
      query = query.and().parenthesis((condition) => {
        condition
          .where("status") // "status" can be any one of "ACTIVE","EXPIRED","USED"
          .contains(searchTextValue.toUpperCase())
          .or()
          .where("name")
          .contains(searchTextValue.toLowerCase());

        // Return the built condition
        return condition;
      });
    }

    // Execute the query by applying the paginateQuery helper and return the results
    return getPaginatedResultsWithMatchingConditions<
      DbUserSubsDto,
      SubscriptionListingFilterOptions
    >(query, subscriptionRecordListingFilterRequest);
  }

  /**
   * getSubscriptionDetailById
   *
   * Retrieves the subscription details based on the provided ID.
   *
   * @param {string} subscriptionId - The ID of the subscription
   * @return {Promise<QueryResponse<DbUserSubsDto>>} The result of the query for the subscriptions
   */
  async getSubscriptionDetailById(
    subscriptionId: string
  ): Promise<QueryResponse<DbUserSubsDto>> {
    // Log the action of fetching user bought subscription list
    global.logger.info("Fetching User's Bought Subscription by ID in [dao]");

    // replace the {id} with the id in the GSI1SK
    const GSI1SK = this.GSI1SK.strtr({
      "{id}": subscriptionId,
    });

    // query that returns all the subscriptions of a user by id
    return UserSubModel.query("GSI1PK")
      .eq(this.GSI1PK)
      .where("GSI1SK")
      .eq(GSI1SK)
      .exec();
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
    // Log the action of fetching user bought subscription list by email
    global.logger.info("get Users Bought Subscription List by email in [dao]");

    // replace the {primaryEmail} with the email in the partition key
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": userEmail,
    });

    // query that returns all the subscriptions of a user by email
    let query = UserSubModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith("SUBS#CAND#ID#");

    // if status is provided, add the condition to the query
    if (subscriptionStatus) {
      query = query.where("status").eq(subscriptionStatus);
    }

    // execute the query and and using the query.sort(order) function sorts the items you receive back by the rangeKey. By default, if not provided, it will sort in ascending order.
    return query.sort("descending").exec();
  }

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
   * Retrieves all user subscriptions based on the provided options and status.
   *
   * @param {RecordListingFilterOptions} options - The options for filtering the user subscriptions.
   * @return {Promise<QueryResponse<DbUserSubsDto>>} A promise that resolves to a QueryResponse containing the user subscriptions.
   */
  async getAllUsersSubscriptions(
    options: RecordListingFilterOptions
  ): Promise<QueryResponse<DbUserSubsDto>> {
    global.logger.info("Get all user subscriptions [DAO]");
    global.logger.info("Options for paginatins with data ", options);

    // construct query
    let query = UserSubModel.query("GSI1PK").eq(this.GSI1PK);

    // apply lastkey if provided
    if (options.lastKey) {
      query = query.startAt(options.lastKey);
    }

    // apply pageSize if provided
    if (options.pageSize) {
      query = query.limit(options.pageSize);
    }

    return query.exec();
  }

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
    id: string
  ): Promise<DbUserSubsDto> {
    global.logger.info("Update User Subscriptions GSIs[DAO}");

    // prepare The keys.
    const PK = this.partitianKey.strtr({ "{primaryEmail}": email });
    const SK = this.sortKeys.SK_SUBS.strtr({ "{subsId}": id });

    // retrun with updated keys and valeus
    return UserSubModel.update(
      { PK, SK },
      { GSI1PK: this.GSI1PK, GSI1SK: this.GSI1SK.replace("{id}", id) }
    );
  }
}

// Export an instance of UserSubscriptionDao
const userSubscriptionDao = new UserSubscriptionDao();

export default userSubscriptionDao;
