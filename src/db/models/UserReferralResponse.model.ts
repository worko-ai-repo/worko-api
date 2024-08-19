// Load the npm packagesSocialProfile
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// Define the structure for User Achievement Database Data Transfer Object (DTO)
class DbUserReferralResponseDto extends BaseDbDto {
  passedRefIds!: string[];
  rejectedRefIds!: string[];
  acceptedRefIds!: string[];
  doneRefIds!: string[]
}

const UserReferralResponseSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    passedRefIds: {
      type: Array,
      required: true,
    },
    rejectedRefIds: {
      type: Array,
      required: true,
    },
    acceptedRefIds: {
      type: Array,
      required: true,
    },
    doneRefIds: {
      type: Array,
      required: true,
    },
    // Add other user-specific attributes here
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Create the UserReferralResponseModel using the defined schema
const UserReferralResponseModel = dynamoose.model<DbUserReferralResponseDto>(
  "UserReferralResponse",
  UserReferralResponseSchema
);

// Export the UserReferralResponseModel
export { UserReferralResponseModel ,DbUserReferralResponseDto};
