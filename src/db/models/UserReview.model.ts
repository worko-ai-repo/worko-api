// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";
import { UserReviewEmpContext, UserReviewCandContext, UserType } from "../../enums/User.enum";
import { MasterServiceCode } from "../../enums/MasterService.enum";

// Define the structure for Review Database Data Transfer Object (DTO)
class DbUserReviewDto extends BaseDbDto {
  GSI1PK!: string;
  GSI1SK!: string;
  id!: string;
  ratingByUserId!: string; // The user id of the user who is rating
  ratingForUserId!: string; // The user id of the user for whom the rating is given
  ratingForUserType!: UserType; // Type of user (e.g., EMP, CAND)
  rating!: number; // Rating value
  reviewText?: string;
  createdByUserId!: string;
  updatedByUserId?: string;
  reviewContext!: UserReviewEmpContext | UserReviewCandContext;
  referalId?: string;
  masterServiceCode?: MasterServiceCode;
  serviceReqId?: string; // @todo Chnage this to providedServiceId
}

// Define the schema for the Review model using DynamoDB
const UserReviewSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    GSI1PK: {
      //@todo Add required true to GSI1
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
    ratingByUserId: {
      type: String,
      required: true,
    },
    ratingForUserId: {
      type: String,
      required: true,
    },
    ratingForUserType: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    reviewText: {
      type: String,
      required: false,
    },
    createdByUserId: {
      type: String,
      required: true,
    },
    updatedByUserId: {
      type: String,
      required: false,
    },
    reviewContext: {
      type: String,
      required: true,
    },
    referalId: {
      type: String,
      required: false,
    },
    masterServiceCode: {
      type: String,
      required: false,
    },
    serviceReqId: {
      type: String,
      required: false,
    },
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Create the ReviewModel using the defined schema
const UserReviewModel = dynamoose.model<DbUserReviewDto>(
  "UserReview",
  UserReviewSchema
);

// Export the ReviewModel
export { UserReviewModel, DbUserReviewDto };
