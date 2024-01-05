// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { BaseDbDto } from "./Base.model";
import { DB_CONSTANTS } from "../DB.constants";

// @todo the "DbUserDetailDto" and "UserDetailSchema" should be in sync.
// For ex, the "DbUserDetailDto.CV" is required but the "UserDetailSchema.CV" is optional.
// So update this and review all DTOs and makre they are in sync with respective Schemas.

// Define the structure for User Details Database Data Transfer Object (DTO)
class DbUserDetailDto extends BaseDbDto {
  name!: string;
  emailList!: { [key: string]: string }; // @todo we should consider removing this. And make the fields are always upto date. Instead use the "UserEmail" SK.
  number!: number;
  userType!: string[];
  linkedinUrl!: string;
  isEmailVerified!: boolean;
  isNumberVerified!: boolean;
  isSubscribed!: boolean;
  referralCount!: number;
  location?: string;
  about?: string;
  CTC?: number;
  ECTC?: number;
  noticePeriod?: number;
  YOE!: number;
  CV?: string;
  coverLetter?: string;
  lastAccessedDash!: string;
  profileImage?: string;
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
    referralCount: {
      type: Number,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: false,
    },
    about: {
      type: String,
      required: false,
    },
    CTC: {
      type: Number,
      required: false,
    },
    ECTC: {
      type: Number,
      required: false,
    },
    noticePeriod: {
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
    coverLetter: {
      type: String,
      required: false,
    },
    lastAccessedDash: {
      type: String,
      required: true,
    },
    profileImage: {
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
  UserDetailSchema, // @todo why it is in [] bracket and everywhere it is without any brackets?
]);

// Export the UserDetailsModel
export { UserDetailModel };
