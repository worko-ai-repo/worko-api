// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// Define the structure for User Experience Database Data Transfer Object (DTO)
class DbUserReferralDto extends BaseDbDto {
  // Id and referances
  id!: string;
  GSI1PK!: string;
  GSI1SK!: string;
  companyId!: string;
  jobId?:string;

  // user's subscriptionId
  userSubscriptionId!: string;

  // The main referaal body related to referal
  status!: string; // @todo: Add enum for referral status i.e AWAITING, DONE, WITHDRAWN, REJECTED, ACCEPTED, CANCELLED
  jobUrl!: string;
  jdExtracted?: string;
  matchingScore!: number;
  scoreDetails?: string;
  jdMatchErrorCode?: number; // Error code details
  jdMatchErrorDesc?: string; // Cv Extract details
  jobPortal?:string;

  /**
   * when the matching score is less than 70, the system will provide feedback content in the `rejectionFeedbackBySystem` attribute,
   * explaining the reason for rejection.
   *
   * If the matching score is 70 or higher, then the `rejectionFeedbackBySystem` attribute will be set to an empty string.
   */
  rejectionFeedbackBySystem?: string;

  // Below are only for when status is WITHDRAWN
  // @todo Fix the attributes structures as per this in Dyamoose Schema below
  withdrawnByUser?: {
    actionDate: Date;
    reason: string;
    userComment?: string;
  };

  // The userIds (and other contextual details) of the employees who have passed the referral request
  // @todo Fix the attributes structures as per this in Dyamoose Schema below
  passedByUserIds?: Array<{
    userId: string;
    actionDate: Date;
  }>; // Updated property to store both userId and actionDate

  // The userIds (and other contextual details) of the employees who have rejected the referral request
  // @todo Fix the attributes structures as per this in Dyamoose Schema below
  rejectedByUserIds?: Array<{
    userId: string;
    actionDate: Date;
    reason: string;
    userComment: string;
  }>; // Updated property to store userId, actionDate, reason, and userComment

  // The userId of the emp who has accepted the referral requests and time when it was accepted
  acceptedByUserId?: string;
  acceptedAtByUser?: Date;

  // The userId of the emp who has done the referral request and time when it was accepted
  doneByUserId?: string;
  doneByEmployee?: Date;

  // If the referal is marked as done by cand then this will be updated with the time when it was done
  doneByCandidate?: Date;

  cvExtract?: string;
  scoreFetchedDate?: string;
}

const UserReferralSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    id: {
      type: String,
      required: true,
    },
    jobId:{
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: true,
    },
    userSubscriptionId: {
      type: String,
      required: true,
    },
    companyId: {
      type: String,
      required: true,
    },
    jobUrl: {
      type: String,
      required: true,
    },
    jdExtracted: {
      type: String, // Use the Map data type
      required: false,
    },
    matchingScore: {
      type: Number,
      required: true,
    },
    jdMatchErrorCode: {
      type: Number,
      required: false,
    },
    jobPortal:{
      type : String,
      required : false
    },
    scoreDetails: {
      type: String,
      required: false,
    },
    jdMatchErrorDesc: {
      type: String,
      required: false,
    },
    rejectionFeedbackBySystem:{
      type: String,
      required: false
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
    acceptedAtByUser: {
      type: Date,
      required: false,
    },
    doneByUserId: {
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
    withdrawnByUser: {
      type: Object,
      schema: {
        actionDate: {
          type: Date,
          required: true
        },
        reason: {
          type: String,
          required: true
        },
        userComment: {
          type: String,
          required: false
        }
      },
      required: false
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

    cvExtract: {
      type: String,
      required: false,
    },
    scoreFetchedDate:{
      type: String,
      required: false,
    }
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
export { UserReferralModel, DbUserReferralDto };
