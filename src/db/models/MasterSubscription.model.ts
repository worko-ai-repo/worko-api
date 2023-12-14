// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// Define the structure for Master Subscription Database Data Transfer Object (DTO)
class DbMasterSubscriptionDto extends BaseDbDto {}

const MasterSubscriptionSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    // Add other mater-specific attributes here
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Create the MasterSubscriptionModel using the defined schema
const MasterSubscriptionModel = dynamoose.model<DbMasterSubscriptionDto>(
  "MasterSubscription",
  MasterSubscriptionSchema
);

// Export the MasterSubscription
export { MasterSubscriptionModel };
