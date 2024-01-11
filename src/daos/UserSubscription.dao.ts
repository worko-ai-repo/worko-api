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
  async get(email: string) {
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });

    return UserSubModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith("SUBS#CAND#ID#")
      .attributes([
        "amount",
        "status",
        "name",
        "availableReferrals",
        "acceptedReferrals",
        "requestedReferrals",
        "expiryDate",
        "purchaseDate",
      ])
      .exec();
  }

  /**
   * create a subscription using SubscriptionDTO and email
   *
   * @param subscriptionDto - Subscription data to be added
   * @param email - Email associated with the subscription
   */
  async create(subscriptionDto: SubscriptionDTO, email: string) {
    const newSubscriptionDto = {
      PK: this.partitianKey.strtr({ "{primaryEmail}": email }),
      SK: this.sortKeys.SK_SUBS.strtr({
        "{subsId}": UlidService.getUlidId(),
      }),
      GSI1PK: this.sortKeys.SK_SUBS.strtr({
        "ID#{subsId}": "",
      }),
      GSI1SK: this.partitianKey.strtr({
        "{primaryEmail}": email,
      }),
      ...subscriptionDto,
    };
    return UserSubModel.create(newSubscriptionDto);
  }
}

// Export an instance of UserSubscriptionDao
const userSubscriptionDao = new UserSubscriptionDao();

export default userSubscriptionDao;
