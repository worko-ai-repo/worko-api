// UserDetailsModel.ts
import { DB_CONSTANTS, DBSchema } from "../DB.constants";
import * as dynamoose from "dynamoose";

const UserDetailsSchema = new dynamoose.Schema(
  {
    ...DBSchema.attributes, // Use the attributes property from DBSchema
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

const UserReqModel = dynamoose.model("User", UserDetailsSchema);
const UserTable = new dynamoose.Table(DB_CONSTANTS.WORKO_TABLE_NAME, [
  UserReqModel,
]);
export { UserReqModel, UserTable };
