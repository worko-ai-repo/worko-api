import { DB_CONSTANTS, DBSchema } from "../DB.constants";
import * as dynamoose from "dynamoose";

const UserSubscriptionSchema = new dynamoose.Schema(
  {
    ...DBSchema.attributes, // Use the attributes property from DBSchema
    subList: {
      type: [],
      required: true,
    },
    expiryDate: {
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

const UserSubModel = dynamoose.model("User", UserSubscriptionSchema);
const UserTable = new dynamoose.Table(DB_CONSTANTS.WORKO_TABLE_NAME, [
  UserSubModel,
]);
export { UserSubModel, UserTable };
