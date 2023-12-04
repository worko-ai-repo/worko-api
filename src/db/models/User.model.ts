// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { dbModel } from "./Base.model";

// Define the schema for the User model using DynamoDB
const UserSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Create the UserModel using the defined schema
// const UserModel = model.createDbModel("User", UserSchema);
const UserModel = dynamoose.model("User", UserSchema);

// Register the UserModel within the database model
/* const WorkoTable = new dynamoose.Table(DB_CONSTANTS.WORKO_TABLE_NAME, [
  UserModel,
]); */
dbModel.registerModel(UserModel);

// Export the UserModel
export { UserModel };
