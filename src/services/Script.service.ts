
// Import dynamoose types
import { ObjectType } from "dynamoose/dist/General";
import { Query, QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import configs
import { awsDynamoDBClientLibrary } from "../configs/aws-sdk.config";
import type { QueryCommandInput, QueryCommandOutput } from "@aws-sdk/client-dynamodb";

// Import daos
import userDetailDao from "../daos/UserDetail.dao";
import userReferralDao from "../daos/UserReferral.dao";
import { corporateUserDaoObj } from "../daos/CorporateUser.dao";
import { corporateInviteDaoObj } from "../daos/CorporateUserInvite.dao";

// Import dtos
import { ScriptPkAndSk, ScriptPkAndSkWithCreatedAt } from "../dtos/Script.dto";

// Import services
import UserSubscriptionService from "./UserSubscription.service";
import { CorporateUserService } from "./CorporateUser.service";
import UserReferralService from "./UserReferral.service";
import { corporateUserInviteServiceObj } from "./CorporateUserInvite.service";

// Import utilities
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

// Import models
import { DbUserSubsDto } from "../db/models/UserSubscription.model";
import { DbCorporateUserDto } from "../db/models/CorporateUser.model";
import { DbUserDetailDto, UserDetailModel } from "../db/models/UserDetail.model";

// Import utils
import ErrorCodeName from "../utils/error-code-name.util";

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
  ): Promise<QueryCommandOutput> {
    const params: QueryCommandInput = {
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
   * scriptUpdateSkForCorporateUsers
   *
   * @returns {Promise<boolean>} A promise that resolves to a boolean value indicating whether the update was successful or not.
   */
  async scriptUpdateSkForCorporateUsers(): Promise<boolean> {
    const corporateUsers: DbCorporateUserDto[] =
      await CorporateUserService.scriptGetAllCorporateUsersWithoutPagination();

    return corporateUserDaoObj.scriptUpdateSkForCorporateUsers(corporateUsers);
  }

  /**
   * scriptUpdateSKForCorporateUserInvite
   *
   * @returns {Promise<boolean>} A promise that resolves to a boolean value indicating whether the update was successful or not.
   */
  async scriptUpdateSKForCorporateUserInvite(): Promise<boolean> {
    const corporateUserInvites =
      await corporateUserInviteServiceObj.getAllCorporateUserInvitesWithoutPagination();

    return corporateInviteDaoObj.scriptUpdateSKForCorporateUserInvite(
      corporateUserInvites
    );
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

  /**
   * scripToUpdateRegisteredUserGsiTwo
   *
   * This function updates the GSI2PK and GSI2SK attributes for registered users
   * in the DynamoDB table. It employs a retry mechanism with exponential backoff
   * to handle throttling errors during both query and update operations. The function
   * processes users in batches and maintains a record of successfully updated users
   * and those that failed to update.
   *
   * @returns {Promise<{ totalUpdated: number, totalFailed: number, updatedUserPksAndSks: { PK: string, SK: string }[], failedUserPksAndSks: { PK: string, SK: string, createdAt: string }[] }>}
   *          An object containing counts and lists of updated and failed user keys.
   */
  async scripToUpdateRegisteredUserGsiTwo(): Promise<{
    totalUpdated: number;
    totalFailed: number;
    updatedUserPksAndSks: ScriptPkAndSk[];
    failedUserPksAndSks: ScriptPkAndSkWithCreatedAt[];
  }> {
    const updatedUserPksAndSks: ScriptPkAndSk[] = [];
    const failedUserPksAndSks: ScriptPkAndSkWithCreatedAt[] = [];
    let totalFailed: number = 0;

    let lastKey: ObjectType | undefined;

    do {
      let result: ObjectType[] = [];
      let resultQueryResponse = {} as QueryResponse<DbUserDetailDto>;

      // Retry logic for query with exponential backoff
      let queryRetries = 0;
      const maxQueryRetries = 4;
      let retrievedSuccess = false;

      while (queryRetries < maxQueryRetries && !retrievedSuccess) {
        try {
          let query: Query<DbUserDetailDto> = UserDetailModel.query("GSI1PK")
            .eq(userDetailDao.GSI1PK)
            .where("GSI1SK")
            .beginsWith("ID#");

          if (lastKey) {
            query = query.startAt(lastKey);
          }

          resultQueryResponse = await query.exec();
          result = resultQueryResponse.toJSON();

          retrievedSuccess = true;
        } catch (error: any) {
          if (
            error.name ===
              ErrorCodeName.PROVISIONED_THROUGHPUT_EXCEEDED_EXCEPTION &&
            queryRetries < maxQueryRetries
          ) {
            queryRetries++;
            const delay = Math.pow(2, queryRetries) * 1000; // Exponential backoff
            global.logger.warn(
              `Query throttled, retrying in ${delay}ms (attempt ${queryRetries})`
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
          } else {
            global.logger.error(`Error retrieving user details`, {
              error,
              methodName: this.scripToUpdateRegisteredUserGsiTwo.name,
              failedUserPksAndSks,
              updatedUserPksAndSks,
            });

            throw new BaseError(
              "Error retrieving user details",
              HttpStatusCode.INTERNAL_SERVER_ERROR_500
            );
          }
        }
      }

      if (!retrievedSuccess) {
        global.logger.error(
          `Failed to retrieve user details after ${maxQueryRetries} retries`,
          {
            failedUserPksAndSks,
            updatedUserPksAndSks,
          }
        );
        throw new BaseError(
          "Failed to retrieve user details",
          HttpStatusCode.INTERNAL_SERVER_ERROR_500
        );
      }

      // Process users with retry logic for updates
      for (const user of result) {
        try {
          // Skip if already updated
          if (
            user?.GSI2PK === userDetailDao.GSI2PK &&
            user?.GSI2SK === user?.createdAt
          ) {
            updatedUserPksAndSks.push({ PK: user.PK, SK: user.SK });
            continue;
          }

          // Retry logic for update with exponential backoff
          let updateRetries = 0;
          const maxUpdateRetries = 4;
          let updateSuccess = false;

          while (updateRetries < maxUpdateRetries && !updateSuccess) {
            try {
              const updatedUserDetail: DbUserDetailDto =
                await UserDetailModel.update(
                  { PK: user.PK, SK: user.SK },
                  {
                    GSI2PK: userDetailDao.GSI2PK,
                    GSI2SK: user.createdAt,
                  }
                );

              if (updatedUserDetail?.id) {
                updatedUserPksAndSks.push({
                  PK: updatedUserDetail.PK,
                  SK: updatedUserDetail.SK,
                });
                updateSuccess = true;
              }
            } catch (updateError: any) {
              if (
                updateError.name ===
                  ErrorCodeName.PROVISIONED_THROUGHPUT_EXCEEDED_EXCEPTION &&
                updateRetries < maxUpdateRetries
              ) {
                global.logger.warn(`Update throttled for user ${user.PK}`);
                updateRetries++;
                const delay = Math.pow(2, updateRetries) * 1000; // Exponential backoff
                global.logger.warn(
                  `Update throttled for user ${user.PK}, retrying in ${delay}ms (attempt ${updateRetries})`
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
              } else {
                global.logger.error(
                  `Other Error while updating user: ${user.PK}`,
                  {
                    error: updateError,
                  }
                );
                updateRetries = maxUpdateRetries;
              }
            }

            if (!updateSuccess) {
              global.logger.warn(`Max retries reached for user ${user.PK}`);
              failedUserPksAndSks.push({
                PK: user.PK,
                SK: user.SK,
                createdAt: user.createdAt,
              });
              totalFailed += 1;
            }
          }
        } catch (error) {
          global.logger.error(
            `Failed to update user with PK: ${user.PK} at main catch block`,
            {
              error,
            }
          );
          failedUserPksAndSks.push({
            PK: user.PK,
            SK: user.SK,
            createdAt: user.createdAt,
          });
          totalFailed += 1;
        }
      }

      lastKey = resultQueryResponse.lastKey;

      // Add delay between pages to avoid overwhelming DynamoDB
      if (lastKey) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } while (lastKey);

    return {
      totalUpdated: updatedUserPksAndSks.length,
      totalFailed,
      updatedUserPksAndSks,
      failedUserPksAndSks,
    };
  }

  /**
   * scripToRetryUpdateRegisteredUserGsiTwo
   *
   * Retry failed updates for a list of users
   *
   * Updates the GSI2PK and GSI2SK for a list of users that failed to update previously.
   * This function will retry each update up to 4 times with a delay between each retry
   * that increases exponentially to avoid overwhelming DynamoDB.
   *
   * @param failedUsers The list of users to retry updating.
   * @returns An object with the total number of users that were updated successfully,
   * the total number of users that still failed to update, an array of the PK and SK of
   * the users that were updated successfully, and an array of the PK, SK, and createdAt of
   * the users that still failed to update.
   */
  async scripToRetryUpdateRegisteredUserGsiTwo(
    failedUsers: ScriptPkAndSkWithCreatedAt[]
  ): Promise<{
    totalUpdated: number;
    totalFailed: number;
    updatedUserPksAndSks: ScriptPkAndSk[];
    failedUserPksAndSks: ScriptPkAndSkWithCreatedAt[];
  }> {
    const updatedUserPksAndSks: ScriptPkAndSk[] = [];
    const stillFailedUsers: ScriptPkAndSkWithCreatedAt[] = [];

    for (const user of failedUsers) {
      let updateRetries: number = 0;
      const maxRetries: number = 4;
      let updateSuccess = false;

      while (updateRetries < maxRetries && !updateSuccess) {
        try {
          const updatedUserDetail: DbUserDetailDto =
            await UserDetailModel.update(
              { PK: user.PK, SK: user.SK },
              {
                GSI2PK: userDetailDao.GSI2PK,
                GSI2SK: user.createdAt,
              }
            );

          if (updatedUserDetail?.id) {
            updatedUserPksAndSks.push({
              PK: updatedUserDetail.PK,
              SK: updatedUserDetail.SK,
            });
            updateSuccess = true;
          }
        } catch (error: any) {
          if (
            error.name ===
              ErrorCodeName.PROVISIONED_THROUGHPUT_EXCEEDED_EXCEPTION &&
            updateRetries < maxRetries
          ) {
            updateRetries++;
            const delay: number =
              Math.pow(2, updateRetries) * 1000 + Math.random() * 1000; // Add jitter
            global.logger.warn(
              `Retry failed update for user ${user.PK}, attempt ${updateRetries}, waiting ${delay}ms`
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
          } else {
            global.logger.error(
              `Other error while retrying update for ${user.PK}`,
              { error }
            );
            break;
          }
        }
      }

      if (!updateSuccess) {
        stillFailedUsers.push(user);
      }
    }

    return {
      totalUpdated: updatedUserPksAndSks.length,
      totalFailed: stillFailedUsers.length,
      updatedUserPksAndSks,
      failedUserPksAndSks: stillFailedUsers,
    };
  }

  async scriptToSendSmsToUser(): Promise<boolean> {
    global.logger.info("scriptToSendSmsToUser [service]");
    return false;
  }
}

// Export the ScriptService class and its instance  
const scriptServiceObj = new ScriptService();
export { scriptServiceObj, ScriptService };
