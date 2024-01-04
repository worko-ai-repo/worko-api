// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// Define the structure for User Education Database Data Transfer Object (DTO)
class DbUserEducationDto extends BaseDbDto {
  collage!: string;
  degree!: string;
  startedYear?: number;
  passingYear!: number;
  grade?: string;
  field?: string;
}

const UserEducationSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    collage: {
      type: String,
      required: true,
    },
    degree: {
      type: String,
      required: true,
    },
    startedYear: {
      type: Number,
      required: false,
    },
    passingYear: {
      type: Number,
      required: true,
    },
    grade: {
      type: String,
      required: false,
    },
    field: {
      type: String,
      required: false,
    },
    // Add other user-specific attributes here
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Create the UserEducationModel using the defined schema
const UserEducationModel = dynamoose.model<DbUserEducationDto>(
  "UserEducation",
  UserEducationSchema
);

// Export the UserEducationModel
export { UserEducationModel };
