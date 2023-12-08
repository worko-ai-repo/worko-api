// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { BaseDbDto } from "./Base.model";
import { DB_CONSTANTS } from "../DB.constants";

// Define the structure for User Details Database Data Transfer Object (DTO)
class DbUserDetailDto extends BaseDbDto {
  name!: string;
  emailList!: { [key: string]: string };
  number!: number;
  userType!: string[];
  linkedinUrl!: string;
  isEmailVerified!: boolean;
  isNumberVerified!: boolean;
  isSubscribed!: boolean;
  ECTC!: number;
  YOE!: number;
  CV!: string;
}

// Define the schema for the User Details model using DynamoDB
const UserDetailSchema = new dynamoose.Schema(
  {
    // ...DBBaseSchema.attributes, // Use the attributes property from DBBaseSchema
    ...DB_CONSTANTS.WORKO_PK_SK,
    name: {
      type: String,
      required: true,
    },
    emailList: {
      type: Object,
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
    userType: {
      type: Set,
      schema: [String],
      required: true,
    },
    linkedinUrl: {
      type: String,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      required: true,
    },
    isNumberVerified: {
      type: Boolean,
      required: true,
    },
    isSubscribed: {
      type: Boolean,
      required: true,
    },
    ECTC: {
      type: Number,
      required: false,
    },
    YOE: {
      type: Number,
      required: true,
    },
    CV: {
      type: String,
      required: false,
    },
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Create the UserDetailsModel using the defined schema
const UserDetailModel = dynamoose.model<DbUserDetailDto>("UserDetail", [
  UserDetailSchema,
]);

// Export the UserDetailsModel
export { UserDetailModel };
