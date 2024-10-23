// Import daos
import userDetailDao from "../daos/UserDetail.dao";
import userReferralDao from "../daos/UserReferral.dao";

// Import DTOs
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { DbUserReferralDto } from "../db/models/UserReferral.model";

// Import helpers
import { base64EncodeStrToLastKey, lastKeyToBase64EncodeStr } from "../helpers/dynamoose.helper";

// Import utilities
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

// Import services
import UserExperienceService from "./UserExperience.service";
import UserSubscriptionService from "./UserSubscription.service";
import UserReferralService from "./UserReferral.service";

// Import libraries
import { AwsDynamoDBLibrary } from "../libraries/aws-dynamoDb-client.library";
import { awsDynamoDBClientLibrary } from "../configs/aws-sdk.config";
import { DbUserSubsDto } from "../db/models/UserSubscription.model";

/**
 * ScriptService
 *
 * Service for handling script-related operations related to updating GSI attributes.
 */
class ScriptService {
  constructor() {}

  /**
   * updateAllUserSubscriptionsGSI1SK
   *
   * Updates the GSI1PK and GSI1SK attributes for all user subscriptions in the DynamoDB table.
   * This function handles batch processing of user subscriptions and updates the necessary GSI attributes
   * to ensure data consistency according to the defined model.
   *
   * @returns {Promise<any[]>} - A promise that resolves to an array of updated user subscriptions
   */
  async updateAllUserSubscriptionsGSI1SK(): Promise<any[]> {
    let userAllSubscriptions: DbUserSubsDto[] = [];
    let lastKey: any;
    const pageSize = 25; // Number of items per batch

    do {
      // Retrieve a batch of user subscriptions
      let userSubscriptions =
        await UserSubscriptionService.getAllUsersSubscriptions({
          pageSize,
          lastKey,
        });

      // If there are any user subscriptions, concatenate them to the list of all subscriptions
      if (userSubscriptions.length) {
        userAllSubscriptions = userAllSubscriptions.concat(userSubscriptions);
      }

      // retrive the last key and pass it for another loop
      lastKey = userSubscriptions.lastKey;
    } while (lastKey);

    // Update GSI1PK and GSI1SK for each subscription in the current batch
    const updatePromises = userAllSubscriptions.map(async (subscription) => {
      const userEmail = subscription.PK.split("#")[2];
      console.log(`User Email is ${userEmail}`);
      return UserSubscriptionService.updateUserSubscriptionGSIsWithSubsId(
        userEmail,
        subscription.id
      );
    });

    // Wait for all updates to complete
    const updatedSubscriptions = await Promise.all(updatePromises);
    global.logger.info(
      `Updated ${updatedSubscriptions.length} subscriptions so far`
    );
    return updatedSubscriptions;
  }

  /**
   * @function updateUserReferralsJdMatchErrorCode
   * @description Retrieves all user referrals in batches, processes each to update
   * the `jdMatchErrorCode` field based on specific conditions, and then updates the
   * data in the database. Returns an array of the updated user referral data.
   *
   * @async
   * @returns {Promise<any[]>} - A promise that resolves to an array of updated user referrals.
   * Each referral contains updated data with the correct `jdMatchErrorCode`.
   *
   * @throws {Error} - Passes any encountered errors during the process.
   */
  async updateUserReferralsJdMatchErrorCode(): Promise<any[]> {
    let userAllReferrals: any[] = [];
    let lastKey: any;
    const pageSize = 25; // Number of referrals to fetch per batch

    do {
      // Retrieve a batch of user referrals using query
      const userReferralsData = await this.getUserAllReferralsByQuery(
        lastKey,
        pageSize
      );

      // If there are any user referrals, concatenate them to the list of all referrals
      if (userReferralsData.Items && userReferralsData.Items.length) {
        userAllReferrals = userAllReferrals.concat(
          userReferralsData.Items as unknown as any[]
        );
      }
      global.logger.info(
        `userAllReferrals length is ${userAllReferrals.length}`
      );

      // Retrieve the last evaluated key and pass it for another loop
      lastKey = userReferralsData.LastEvaluatedKey;
    } while (lastKey);

    // if none referrals are found then throw a error msg
    if (!userAllReferrals.length) {
      throw new BaseError(
        "Unable to get user referrals.",
        HttpStatusCode.NOT_FOUND_404
      );
    }
    // Process each referral to update necessary details
    const updatePromises = userAllReferrals.map(async (userReferral) => {
      // Check if userReferral and userReferral.PK exist
      if (!userReferral) {
        throw new Error("userReferral is undefined");
      }

      // prepare user email from pk
      let pkValue = userReferral.PK.S || "";
      let candEmail = pkValue.split("#")[2];
      global.logger.info(
        `Processing user: ${candEmail} and with PK : ${pkValue}`
      );

      // prepare the variable to store the feilds
      let jdMatchErrorCode: number;
      let matchingScore = Number(userReferral.matchingScore?.N) || 0;
      let userReferralId = userReferral.id?.S || "";

      // If the "jdMatchErrorCode" attribute is present then use it
      if (userReferral.jdMatchErrorCode) {
        jdMatchErrorCode = Number(userReferral.jdMatchErrorCode.N);
      }
      // If the "jdMatchErrorCode" attribute is not present, determine its value based on the "matchingScore"
      else {
        // If the matching score is exactly 0, set the error code to 250
        if (matchingScore == 0) {
          jdMatchErrorCode = 250;
        }
        // If the matching score is between 1 and 100 (inclusive), set the error code to 200
        else if (matchingScore <= 100) {
          jdMatchErrorCode = 200;
        }
        // If the matching score is greater than 100, use the matching score itself as the error code
        else {
          jdMatchErrorCode = matchingScore;
        }
      }

      // Update the user referral data in the database
      return UserReferralService.updateUserReferralsJdMatchErrorCode(
        candEmail,
        userReferralId,
        jdMatchErrorCode
      );
    });

    // Return the updated user referrals (excluding failed updates)
    return Promise.all(updatePromises);
  }

  /**
   * Retrieves a list of user referrals from the database based on the provided pagination options.
   *
   * @param {any} [lastKey] - The last key from the previous query to start the next query from.
   * @param {number} [pageSize=25] - The maximum number of items to return in the query.
   * @return {Promise<AWS.DynamoDB.QueryOutput>} A promise that resolves to a QueryOutput object containing the query results.
   */
  private async getUserAllReferralsByQuery(
    lastKey?: any,
    pageSize: number = 25
  ): Promise<AWS.DynamoDB.QueryOutput> {
    const params: AWS.DynamoDB.QueryInput = {
      TableName: process.env.APP_AWS_DYNAMODB_TABLE_NAME || "worko",
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :gsi1pkPrefix",
      ExpressionAttributeValues: {
        ":gsi1pkPrefix": { S: "REF#" },
      },
      Limit: pageSize,
    };

    // apply lastkey if it is there for pagination.
    if (lastKey) {
      params.ExclusiveStartKey = lastKey;
    }
    // retrun the query
    return awsDynamoDBClientLibrary.query(params);
  }

  /**
   * scriptUpdateUsersToLowerCase
   *
   * Updates all user details to convert email addresses present in `PK` attribute to lower case and `name` attribute to lower case in the DynamoDB table.
   * @returns {Promise<boolean>} A promise that resolves to a boolean value indicating whether the script was successful or not.
   */
  async scriptUpdateUsersToLowerCase(): Promise<boolean> {
    return userDetailDao.scriptUpdateUsersToLowerCase();
  }

  /**
   * scriptUpdatePkEmailToLowerCase
   *
   * Updates the specific email present in `PK` attribute to lower case in the DynamoDB table.
   *
   * @param {string} oldEmail - The old email address.
   * @param {string} newEmail - The new email address.
   * @returns {Promise<boolean>} A promise that resolves to a boolean value indicating whether the script was successful or not.
   */
  async scriptUpdatePkEmailToLowerCase(
    oldEmail: string,
    newEmail: string
  ): Promise<boolean> {
    return userDetailDao.scriptUpdatePkEmailToLowerCase(oldEmail, newEmail);
  }

  /**
   * scriptUpdatejdExtractedToStringDataType
   *
   * To update all `jdExtracted` data type to `string` data type
   * 
   * @returns {Promise<boolean>} A promise that resolves to a boolean value indicating whether the script was successful or not.
   */
  scriptUpdatejdExtractedToStringDataType(): Promise<boolean> {
    return userReferralDao.scriptUpdatejdExtractedToStringDataType();
  }
}

// Export the ScriptService class and its instance  
const scriptServiceObj = new ScriptService();
export { scriptServiceObj, ScriptService };
