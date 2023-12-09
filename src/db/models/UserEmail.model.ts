// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { BaseDbDto } from "./Base.model";
import { DB_CONSTANTS } from "../DB.constants";

// Define the structure for User Emaill Database Data Transfer Object (DTO)
// @todo where is the actual "email" field value here? Can we connect to talk on this?
class DbUserEmailDto extends BaseDbDto {
  companyName!: string;
  emailId!: String;
}

// Define the schema for the User Emaill model using DynamoDB
const UserEmailSchema = new dynamoose.Schema(
  {
    // ...DBBaseSchema.attributes, // Use the attributes property from DBBaseSchema
    ...DB_CONSTANTS.WORKO_PK_SK,
    companyName: {
      type: String,
      required: true,
    },
    emailId: {
      type: String,
      required: true,
    },
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Create the UserEmaillsModel using the defined schema
const UserEmailModel = dynamoose.model<DbUserEmailDto>("UserEmail", [
  UserEmailSchema, // @todo why it is in [] bracket and everywhere it is without any brackets?
]);

// Export the UserEmaillModel
export { UserEmailModel };
