// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// Define the structure for Master Subscription Database Data Transfer Object (DTO)
class DbMasterSubscriptionDto extends BaseDbDto {
  name!: string;
  amount!: number;
  duration!: number;
  referralCount!: number;
  isActive!: boolean;
  details?: string;
}

const MasterSubscriptionSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    name: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    referralCount: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
    },
    details: {
      type: String,
      required: false,
    },
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
export { MasterSubscriptionModel, DbMasterSubscriptionDto };
