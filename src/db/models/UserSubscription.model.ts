// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// Define the structure for User Subscription Database Data Transfer Object (DTO)
class DbUserSubsDto extends BaseDbDto {
  amount!: Number;
  status!: String;
  name!: String;
  availableReferrals!: Number;
  acceptedReferrals!: Number;
  requestedReferrals!: Number;
  expiryDate!: Date;
  purchaseDate!: Date;
  GSI1PK!: String;
  GSI1SK!: String;
}

const UserSubscriptionSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    availableReferrals: {
      type: Number,
      required: true,
    },
    acceptedReferrals: {
      type: Number,
      required: true,
    },
    requestedReferrals: {
      type: Number,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
    GSI1PK: {
      type: String,
      required: true,
    },
    GSI1SK: {
      type: String,
      required: true,
    },
    // Add other user-specific attributes here
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Create the UserSubModel using the defined schema
const UserSubModel = dynamoose.model<DbUserSubsDto>(
  "UserSubs", // @here this value is not same as the file name. We need to make sure we are consistent with naming convension.
  UserSubscriptionSchema
);

// Export the UserSubModel
export { UserSubModel };
