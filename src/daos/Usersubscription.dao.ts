import SubscriptionDTO from "../dtos/Subscription.dto";
import UlidService from "../services/Ulid.service";
import { UserSubModel } from "../db/models/UserSubscription.model";
import BaseDao from "./Base.dao";

class UserSubscriptionDao implements BaseDao {
  modelName = "user";
  partitianKey = "USR#EML#{primaryEmail}";
  sortKeys = { SK_SUBS: "SUBS#CAND#ID#{subsId}" };
  /**
   *
   * @param email
   * @returns
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
   *
   * @param subscriptionDto
   * @param email
   */
  async addSubscription(subscriptionDto: SubscriptionDTO, email: string) {
    try {
      subscriptionDto.PK = this.partitianKey.replace("{primaryEmail}", email);
      subscriptionDto.SK = this.sortKeys.SK_SUBS.replace(
        "{subsId}",
        UlidService.getUlidId()
      );
      subscriptionDto.GSI1PK = this.sortKeys.SK_SUBS.replace("ID#(subsId}", "");
      subscriptionDto.GSI1SK = this.partitianKey.replace(
        "{primaryEmail}",
        email
      );
      const timestamp = Date.now();
      subscriptionDto.expiryDate = new Date(timestamp);
      subscriptionDto.purchaseDate = new Date(timestamp);
      console.log(subscriptionDto);
      await UserSubModel.create(subscriptionDto);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export default new UserSubscriptionDao();
