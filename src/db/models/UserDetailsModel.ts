// UserDetailsModel.ts
import { DB_CONSTANTS, DBSchema } from "../DB.constants";
import * as dynamoose from "dynamoose";

const UserDetailsSchema = new dynamoose.Schema(
  {
    ...DBSchema.attributes, // Use the attributes property from DBSchema
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    emailList: {
      type: Set, // Use Set for storing a list of emails
      schema: [String], // Specify the type of elements in the set
      required: true,
    },
    // Add other user-specific attributes here
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

const UserModel = dynamoose.model("User", UserDetailsSchema);
const UserTable = new dynamoose.Table(DB_CONSTANTS.WORKO_TABLE_NAME, [
  UserModel,
]);
export { UserModel, UserTable };
