// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// Define the structure for User Experience Database Data Transfer Object (DTO)
class DbUserReferralDto extends BaseDbDto {
  status!: string;
  companySK!: string;
  jobUrl!: string;
  jdExtracted?: object;
  matchingScore!: number;
  passedByUserIds?: String[];
  rejectedByUserIds?: String[];
  acceptedByUserId?: String;
  doneByEmployee?: Date;
  doneByCandidate?: Date;
  GSI1PK!: string;
  GSI1SK!: string;
}

const UserReferralSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    status: {
      type: String,
      required: true,
    },
    companySK: {
      type: String,
      required: true,
    },
    jobUrl: {
      type: String,
      required: true,
    },
    jdExtracted: {
      type: Object, // Use the Map data type
      required: false,
    },
    matchingScore: {
      type: Number,
      required: true,
    },
    passedByUserIds: {
      type: Array,
      required: false,
    },
    rejectedByUserIds: {
      type: Array,
      required: false,
    },
    acceptedByUserId: {
      type: String,
      required: false,
    },
    doneByEmployee: {
      type: Date,
      required: false,
    },
    doneByCandidate: {
      type: Date,
      required: false,
    },
    GSI1PK: {
      type: String,
      index: {
        name: "GSI1",
        type: "global",
        rangeKey: "GSI1SK",
      },
    },
    GSI1SK: {
      type: String,
      index: {
        name: "GSI1",
        type: "global",
      },
    },
    // Add other user-specific attributes here
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Create the UserReferralModel using the defined schema
const UserReferralModel = dynamoose.model<DbUserReferralDto>(
  "UserReferral",
  UserReferralSchema
);

// Export the UserReferralModel
export { UserReferralModel };
