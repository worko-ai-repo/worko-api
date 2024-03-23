// Import the installed packages
import * as dynamoose from "dynamoose";

// Import configurations
import { DB_CONSTANTS } from "../DB.constants";

// Import enums
import { MasterServiceCode } from "../../enums/MasterService.enum";
import { UserReviewCandContext, UserReviewEmpContext } from "../../enums/User.enum";

// Import models
import { BaseDbDto } from "./Base.model";

/**
 * DbUserRatingAvgDto
 * 
 * Define the structure for UserRatingAvg Database
 */
class DbUserRatingAvgDto extends BaseDbDto {
  overallRating!: number;
  overallForCand!: number;
  overallForEmp!: number;
  contextWise!: {
    context: UserReviewEmpContext | UserReviewCandContext;
    subContext?: MasterServiceCode;
    sum: number;
    len: number;
    avg: number;
  }[];
}

/**
 * UserRatingAvgSchema
 * 
 * Define the schema for the UserRatingAvg model using DynamoDB
 */
const UserRatingAvgSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    overallRating: {
      type: Number,
      required: true,
    },
    overallForCand: {
      type: Number,
      required: true,
    },
    overallForEmp: {
      type: Number,
      required: true,
    },
    contextWise: {
      type: Array,
      required: true,
      schema: [
        {
          type: Object,
          schema: {
            context: {
              type: String,
              required: true,
            },
            subContext: {
              type: String,
              required: false,
            },
            sum: {
              type: Number,
              required: true,
            },
            len: {
              type: Number,
              required: true,
            },
            avg: {
              type: Number,
              required: true,
            },
          },
        },
      ],
    },
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Create the UserRatingAvgModel using the defined schema
const UserRatingAvgModel = dynamoose.model<DbUserRatingAvgDto>(
  "UserRatingAvg",
  UserRatingAvgSchema
);

// Export the UserRatingAvgModel
export { UserRatingAvgModel, DbUserRatingAvgDto };
