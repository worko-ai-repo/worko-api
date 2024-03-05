//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import { MasterSubscriptionModel } from "../db/models/MasterSubscription.model";

//Load the local dtos
import { MasterSubscriptionDTO } from "../dtos/MasterSubscription.dto";

//Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";

// Class definition for MasterSubscriptionDao implementing BaseDao
class MasterSubscriptionDao implements BaseDao {
  modelName = "MasterSubscription";
  partitianKey = "SUBS#";
  sortKeys = { SK_SUBS: "TYPE#{type}#ID#{ID}" };

  /**
   * Adds a subscription using masterSubscriptionDto
   *
   * @param masterSubscriptionDto - Subscription data to be added
   */
  async create(masterSubscriptionDto: MasterSubscriptionDTO) {
    console.log("Create new mater subscription plan [DAO]");
    const newMasterSubscriptionDto = {
      PK: this.partitianKey,
      SK: this.sortKeys.SK_SUBS.strtr({
        "{type}": "CAND",
        "{ID}": UlidService.getUlidId(),
      }),

      ...masterSubscriptionDto,
    };
    return MasterSubscriptionModel.create(newMasterSubscriptionDto);
  }

  /**
   *
   * Get all subscription plans
   *
   */
  async get() {
    console.log("get all master subscription plans [DAO]");

    const PK = this.partitianKey;
    const SK = this.sortKeys.SK_SUBS.strtr({
      "{type}": "CAND",
      "{ID}": "",
    });
    return MasterSubscriptionModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith(SK)
      .exec();
  }

  /**
   *
   * Get subscription plan details
   *
   */
  async getByPlan(plan: string) {
    console.log("get subscription plan detail [DAO]");

    const PK = this.partitianKey;
    return MasterSubscriptionModel.query("PK")
    .eq(PK)
    .where("name")
    .eq(plan)
    .attributes(["SK", "amount", "duration", "referralCount"])
    .exec();
  }

  /**
   *
   * Get subscription plan details
   *
   */
  async getById(masterSubscriptionId: string) {
    global.logger.info("get subscription plan detail by Id [DAO]");

    const PK = this.partitianKey;
    return MasterSubscriptionModel.query("PK")
      .eq(PK)
      .where("SK")
      .eq(masterSubscriptionId)
      .attributes(["SK", "PK", "name", "amount", "duration", "referralCount"])
      .exec();
  }
}

// Export an instance of MasterSubscriptionDao
const masterSubscriptionDao = new MasterSubscriptionDao();

export default masterSubscriptionDao;
