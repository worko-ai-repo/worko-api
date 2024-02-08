// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// Define the structure for User ProvidedService Database Data Transfer Object (DTO)
class DbUserAvailabilityDto extends BaseDbDto {
  bookingPeriod!: number; //In days
  noticePeriod!: {
    value: number;
    unit: string;
  };
  pauseAvailability!: boolean;
  availability!: {
    dayCode: number;
    dayEnabled: number;
    times: {
      startTime: string;
      endTime: string;
    }[];
  }[];
}

const AvailabilitySchema = new dynamoose.Schema({
  availability: {
    type: Object,
    schema: {
      dayCode: Number,
      dayEnabled: Number,
      times: {
        type: Array,
        schema: [Object],
      },
    },
  },
});

const NoticePeriodSchema = new dynamoose.Schema({
  noticePeriod: {
    type: Object,
    schema: {
      value: Number,
      unit: String,
    },
  },
});

const UserAvailabilitySchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    bookingPeriod: {
      type: Number,
      required: true,
    },
    noticePeriod: {
      type: Object,
      schema: NoticePeriodSchema,
      required: true,
    },
    pauseAvailability: {
      type: Boolean,
      required: true,
    },
    availability: {
      type: Array,
      schema: [AvailabilitySchema],
      required: true,
    },
    // Add other user-specific attributes here
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Create the UserAvailabilityModel using the defined schema
const UserAvailabilityModel = dynamoose.model<DbUserAvailabilityDto>(
  "UserAvailability",
  UserAvailabilitySchema
);

// Export the UserAvailabilityModel
export { UserAvailabilityModel };
