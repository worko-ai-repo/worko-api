// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { BaseDbDto, DBBaseSchema, dbModel } from "./Base.model";
import { DB_CONSTANTS } from "../DB.constants";

// Define the structure for User Details Database Data Transfer Object (DTO)
class UserDetailsDbDto extends BaseDbDto {
  firstName!: string;
  lastName!: string;
  emailList!: { [key: string]: string };
}

// Define the schema for the User Details model using DynamoDB
const UserDetailsSchema = new dynamoose.Schema(
  {
    ...DBBaseSchema.attributes, // Use the attributes property from DBBaseSchema
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    emailList: {
      type: Object,
      required: true,
    },
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Create the UserDetailsModel using the defined schema
const UserDetailsModel = dynamoose.model<UserDetailsDbDto>(
  "UserDetails",
  UserDetailsSchema
);

// Register the UserDetailsModel within the database model
dbModel.registerModel(UserDetailsModel);

// Export the UserDetailsModel
export { UserDetailsModel };
