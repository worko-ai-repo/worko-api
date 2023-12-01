//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import { UserSubModel } from "../db/models/UserSubscription.model";

//Load the local dtos
import SubscriptionDTO from "../dtos/Subscription.dto";

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
   * @param email - Email used to fetch subscription details
   * @returns Promise of subscription details
   */
  async subscriptionDetails(email: string) {
    try {
      const PK = this.partitianKey.strtr({
        "{primaryEmail}": email,
      });
      // const SK = this.USER_CONSTANTS.SK_SUBS;
      const SK = this.sortKeys.SK_SUBS.strtr({
        "ID#{subsId}": "",
      });

      return UserSubModel.query({
        PK,
        SK,
      }).exec();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Adds a subscription using SubscriptionDTO and email
   *
   * @param subscriptionDto - Subscription data to be added
   * @param email - Email associated with the subscription
   */
  async addSubscription(subscriptionDto: SubscriptionDTO, email: string) {
    try {
      subscriptionDto.PK = this.partitianKey.strtr({ "{primaryEmail}": email });
      subscriptionDto.SK = this.sortKeys.SK_SUBS.strtr({
        "{subsId}": UlidService.getUlidId(),
      });
      subscriptionDto.GSI1PK = this.sortKeys.SK_SUBS.strtr({
        "ID#(subsId}": "",
      });
      subscriptionDto.GSI1SK = this.partitianKey.strtr({
        "{primaryEmail}": email,
      });
      const timestamp = Date.now();
      subscriptionDto.expiryDate = new Date(timestamp);
      subscriptionDto.purchaseDate = new Date(timestamp);
      console.log("ubcriptionDto: ", subscriptionDto);
      return UserSubModel.create(subscriptionDto);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

// Export an instance of UserSubscriptionDao
const userSubscriptionDao = new UserSubscriptionDao();

export default userSubscriptionDao;
