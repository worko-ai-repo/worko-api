// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto, DBBaseSchema, dbModel } from "./Base.model";

// Define the structure for User Subscription Database Data Transfer Object (DTO)
class UserSubsDbDto extends BaseDbDto {
  amount!: Number;
  status!: String;
  expiryDate!: Date;
  purchaseDate!: Date;
  GSI1PK!: String;
  GSI1SK!: String;
}

const UserSubscriptionSchema = new dynamoose.Schema(
  {
    ...DBBaseSchema.attributes, // Use the attributes property from DBBaseSchema
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
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
const UserSubModel = dynamoose.model<UserSubsDbDto>(
  "UserSubs",
  UserSubscriptionSchema
);

// Register the UserSubModel within the database model
dbModel.registerModel(UserSubModel);

// Export the UserSubModel
export { UserSubModel };
