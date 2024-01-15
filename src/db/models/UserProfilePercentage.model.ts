// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// Define the structure for User ProfilePercentage Database Data Transfer Object (DTO)

interface DBFieldDto {
  field: string;
  expPerc: number;
  curPerc: number;
}

interface DBFieldGroupDto {
  fieldGroup: string;
  expPerc: number;
  curPerc: number;
  fields: DBFieldDto[];
}

class DbUserProfilePercentageDto extends BaseDbDto {
  candidate!: DBFieldGroupDto[];

  employee!: DBFieldGroupDto[];
}

const FieldSchema = new dynamoose.Schema({
  field: {
    type: String,
    required: true,
  },
  expPerc: {
    type: Number,
    required: true,
  },
  curPerc: {
    type: Number,
    required: true,
  },
});

const FieldGroupSchema = new dynamoose.Schema({
  fieldGroup: {
    type: String,
    required: true,
  },
  expPerc: {
    type: Number,
    required: true,
  },
  curPerc: {
    type: Number,
    required: true,
  },
  fields: {
    type: Array,
    schema: [FieldSchema],
  },
});

const UserProfilePercentageSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    candidate: {
      type: Array,
      schema: [FieldGroupSchema],
      required: true,
    },
    employee: {
      type: Array,
      schema: [FieldGroupSchema],
      required: true,
    },
    // Add other user-specific attributes here
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Create the UserProfilePercentageModel using the defined schema
const UserProfilePercentageModel = dynamoose.model<DbUserProfilePercentageDto>(
  "UserProfilePercentage",
  UserProfilePercentageSchema
);

// Export the UserProfilePercentageModel
export { UserProfilePercentageModel };
