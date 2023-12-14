//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import { MasterSubscriptionModel } from "../db/models/MasterSubscription.model";

//Load the local dtos

//Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";

// Class definition for MasterSubscriptionDao implementing BaseDao
class MasterSubscriptionDao implements BaseDao {
  modelName = "MasterSubscription";
  partitianKey = "";
  sortKeys = { SK_SUBS: "" };
}

// Export an instance of MasterSubscriptionDao
const masterSubscriptionDao = new MasterSubscriptionDao();

export default masterSubscriptionDao;
