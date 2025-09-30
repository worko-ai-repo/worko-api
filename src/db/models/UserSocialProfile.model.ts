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

  /**
   * @example
   * {
   *   "hackerRank": ["XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"],
   *   "codeChef": ["XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"],
   *   "leetCode": ["XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"]
   * }
   */
  otherSocialPlatForms?: Record<string, string[]>;
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
    otherSocialPlatForms: {
      type: Object, // Updated to an object
      required: false,
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
export { UserSocialProfileModel, DbUserSocialProfileDto };