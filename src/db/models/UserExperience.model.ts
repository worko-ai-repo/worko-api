// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { BaseDbDto } from "./Base.model";
import { DB_CONSTANTS } from "../DB.constants";

// Define the structure for User Experience Database Data Transfer Object (DTO)
class DbUserExperienceDto extends BaseDbDto {
  department!: string;
  designation?: string;
  designationTag?: number;
  startedMonth?: number;
  endedMonth?: number;
  startedYear?: number;
  endedYear?: number;
  experienceInMonths?: number;
  companyName!: string;
  companySK!: string;
  emailId!: String;
  isEmailVerified?: boolean;
  isCurrentCompany?: boolean;
}

// Define the schema for the User Experience model using DynamoDB
const UserExperienceSchema = new dynamoose.Schema(
  {
    // ...DBBaseSchema.attributes, // Use the attributes property from DBBaseSchema
    ...DB_CONSTANTS.WORKO_PK_SK,
    department: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: false,
    },
    designationTag: {
      type: Number,
      required: false,
    },
    startedMonth: {
      type: Number, // Assuming it's a number
      required: false,
    },
    endedMonth: {
      type: Number, // Assuming it's a number
      required: false,
    },
    startedYear: {
      type: Number,
      required: false,
    },
    endedYear: {
      type: Number,
      required: false,
    },
    experienceInMonths: {
      type: Number,
      required: false,
    },
    companyName: {
      type: String,
      required: true,
    },
    companySK: {
      type: String,
      required: true,
    },
    emailId: {
      type: String,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      required: false,
    },
    isCurrentCompany: {
      type: Boolean,
      required: false,
    },
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Create the UserExperiencesModel using the defined schema
const UserExperienceModel = dynamoose.model<DbUserExperienceDto>(
  "UserExperience",
  UserExperienceSchema
);

// Export the UserExperienceModel
export { UserExperienceModel };
