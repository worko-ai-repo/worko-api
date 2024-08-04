// Import DTOs
import { AttributeValue } from "@aws-sdk/client-dynamodb";

// Import helpers
import { base64EncodeStrToLastKey, lastKeyToBase64EncodeStr } from "../helpers/dynamoose.helper";

// Import utilities
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

// Import services
import UserExperienceService from "./UserExperience.service";
import UserSubscriptionService from "./UserSubscription.service";

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
  constructor() { }

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
      let userSubscriptions = await UserSubscriptionService.getAllUsersSubscriptions({
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
      return UserSubscriptionService.updateUserSubscriptionGSIsWithSubsId(userEmail, subscription.id);
    });

    // Wait for all updates to complete
    const updatedSubscriptions = await Promise.all(updatePromises);
    global.logger.info(`Updated ${updatedSubscriptions.length} subscriptions so far`);
    return updatedSubscriptions;
  }

  // /**
  //  * updateUserExperiencesGSIs
  //  *
  //  * Updates the GSI1PK and GSI1SK attributes for all user experiences in the DynamoDB table.
  //  * This function retrieves all user experiences and applies the necessary updates to ensure
  //  * consistency with the defined data model.
  //  *
  //  * @returns {Promise<any[]>} - A promise that resolves to an array of updated user experiences
  //  */
  // async updateUserExperiencesGSIs(): Promise<any[]> {
  //   global.logger.info("updateUserExperiencesGSIs() called");
  //   let lastKey: any = undefined;
  //   let userExperiences: any[] = [];

  //   do {
  //     // Retrieve a batch of user experiences
  //     const { Items: userExps, LastEvaluatedKey: lastEvaluatedKey } = await this.scanUserExperiences(lastKey);
  //     lastKey = lastEvaluatedKey;

  //     // Add user experiences to the array
  //     if (userExps?.length) {
  //       userExperiences = userExperiences.concat(userExps);
  //     }
  //     lastKey = lastEvaluatedKey;
  //   } while (lastKey);

  //   if (!userExperiences.length) {
  //     throw new BaseError("Unable to get user experiences.", HttpStatusCode.NOT_FOUND_404);
  //   }

  //   // Update GSI1PK and GSI1SK for each experience in the batch
  //   const updatePromises = userExperiences.map(async (userExp) => {
  //     const userEmail = userExp.PK.split("#")[2];
  //     return UserExperienceService.updateUserExperienceGSIsWithExpId(userEmail, userExp.id, userExp.companyId);
  //   });

  //   return Promise.all(updatePromises);
  // }

  // private async scanUserExperiences(lastKey?: any): Promise<AWS.DynamoDB.ScanOutput> {
  //   return awsDynamoDBClientLibrary.scan({
  //     TableName: process.env.APP_AWS_DYNAMODB_TABLE_NAME || "worko",
  //     FilterExpression: "begins_with(SK, :skPrefix)",
  //     ExpressionAttributeValues: {
  //       ":skPrefix": { S: "EXP#ID#" },
  //     } as Record<string, AttributeValue>,
  //     ExclusiveStartKey: lastKey,
  //     Limit: 25,
  //   });
  // }
}

export default new ScriptService();
