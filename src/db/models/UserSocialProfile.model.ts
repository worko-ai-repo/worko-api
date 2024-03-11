// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// Define the structure for User Social profile Database Data Transfer Object (DTO)
class DbUserSocialProfileDto extends BaseDbDto {
  twitter?: string[];
  github?: string[];
  linkedin?: string[];
}

const UserSocialProfileSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    twitter: {
      type: Array, // Updated to an array of strings
      required: false,
    },
    github: {
      type: Array, // Updated to an array of strings
      required: false,
    },
    linkedin: {
      type: Array, // Updated to an array of strings
      required: true,
    },
    // Add other user-specific attributes here
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Create the UserSocialProfileModel using the defined schema
const UserSocialProfileModel = dynamoose.model<DbUserSocialProfileDto>(
  "UserSocialProfile",
  UserSocialProfileSchema
);

// Export the UserSocialProfileModel
export { UserSocialProfileModel };