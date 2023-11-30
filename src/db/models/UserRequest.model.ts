// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { DBBaseSchema, dbModel } from "./Base.model";

const UserDetailsSchema = new dynamoose.Schema(
  {
    ...DBBaseSchema.attributes, // Use the attributes property from DBBaseSchema
    status: {
      type: String,
      required: true,
    },
    company: {
      type: String,
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

// Create the UserReqModel using the defined schema
const UserReqModel = dynamoose.model("User", UserDetailsSchema);

// Register the UserReqModel within the database model
const UserTable = new dynamoose.Table(DB_CONSTANTS.WORKO_TABLE_NAME, [
  UserReqModel,
]);

// Export the UserReqModel
export { UserReqModel, UserTable };
