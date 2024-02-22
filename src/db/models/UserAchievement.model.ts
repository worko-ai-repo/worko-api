// Load the npm packagesSocialProfile
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// Define the structure for User Achievement Database Data Transfer Object (DTO)
class DbUserAchievementDto extends BaseDbDto {
  achievements?: {
    title: string;
    acquiredFrom: string;
    achievDate: Date;
    timestamps?: {
      createdAt: Date;
      updatedAt: Date;
    };
  }[];
}

const AchievementSchema = new dynamoose.Schema({
  achievement: {
    type: Object,
    schema: {
      title: String,
      acquiredFrom: String,
      achievDate: Date,
      timestamps: Object,
    },
  },
});

const UserAchievementSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    achievements: {
      type: Array,
      required: true,
      schema: [AchievementSchema],
    },
    // Add other user-specific attributes here
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Create the UserAchievementModel using the defined schema
const UserAchievementModel = dynamoose.model<DbUserAchievementDto>(
  "UserAchievement",
  UserAchievementSchema
);

// Export the UserAchievementModel
export { UserAchievementModel };
