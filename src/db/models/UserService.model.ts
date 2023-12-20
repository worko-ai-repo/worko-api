// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// Define the structure for User Subscription Database Data Transfer Object (DTO)
class DbUserServiceDto extends BaseDbDto {
  mentorLevel!: number;
  status!: string;
  slot1!: Date;
  slot2?: Date;
  slot3?: Date;
  details?: string;
  masterServiceId!: string;
  employeeServiceId?: string;
  role?: string;
  selectedSlot?: Date;
  GSI1PK!: string;
  GSI1SK!: string;
}

const UserServiceSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    mentorLevel: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    slot1: {
      type: Date,
      required: true,
    },
    slot2: {
      type: Date,
      required: false,
    },
    slot3: {
      type: Date,
      required: false,
    },
    masterServiceId: {
      type: String,
      required: true,
    },
    employeeServiceId: {
      type: String,
      required: false,
    },
    details: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      required: false,
    },
    selectedSlot: {
      type: Date,
      required: false,
    },
    GSI1PK: {
      type: String,
      index: {
        name: "PrimaryIndex",
        type: "global",
        rangeKey: "GSI1SK",
      },
    },
    GSI1SK: {
      type: String,
      index: {
        name: "SecondaryIndex",
        type: "global",
      },
    },
    // Add other user-specific attributes here
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Create the UserServiceModel using the defined schema
const UserServiceModel = dynamoose.model<DbUserServiceDto>(
  "UserService",
  UserServiceSchema
);

// Export the UserServiceModel
export { UserServiceModel };
