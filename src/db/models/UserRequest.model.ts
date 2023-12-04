// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { dbModel } from "./Base.model";

const UserRequestSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
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

// Create the UserRequestModel using the defined schema
const UserRequestModel = dynamoose.model("UserRequest", UserRequestSchema);

// Register the UserRequestModel within the database model
/* const UserTable = new dynamoose.Table(DB_CONSTANTS.WORKO_TABLE_NAME, [
  UserRequestModel,
]); */
dbModel.registerModel(UserRequestModel);

// Export the UserRequestModel
export { UserRequestModel };
