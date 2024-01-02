// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// Define the structure for User Social profile Database Data Transfer Object (DTO)
class DbUserEducationDto extends BaseDbDto {
  collage!: string;
  degree!: string;
  passingYear!: string;
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
    passingYear: {
      type: String,
      required: true,
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
