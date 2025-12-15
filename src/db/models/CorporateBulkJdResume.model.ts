// Load the npm packages
import * as dynamoose from "dynamoose";
import { ModelType } from "dynamoose/dist/General";
import { Schema } from "dynamoose/dist/Schema";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// import dtos
import { CorporateBulkJdResumeDbCvExtractedParsedDto } from "../../dtos/CorporateBulkJdResume.dto";

// import Enums
import { CorporateBulkJdResumeProcessingStatusEnum } from "../../enums/CorporateBulkJdResume.enum";

// Define the structure for Corporate Bulk JD Resume Database Data Transfer Object (DTO)
class DbCorporateBulkJdResumeDto extends BaseDbDto {
  // Id
  id!: string;
  GSI1PK!: string;
  GSI1SK!: string;
  GSI2PK!: string;
  GSI2SK!: string;

  // Referances
  companyId!: string;
  corporateBulkJdId!: string; // refer `CorporateBulkJd` model
  createdByUserId?: string; // worko admin user id (`UserDetail` model)
  updatedByUserId?: string; // worko admin user id (`UserDetail` model)
  createdByCorporateUserId?: string; // corporate admin/recruiter user id (`CorporateUser` model)
  updatedByCorporateUserId?: string; // corporate admin/recruiter user id (`CorporateUser` model)

  // Status
  processingStatus!: CorporateBulkJdResumeProcessingStatusEnum;

  // File Attributes
  userFileName!: string;
  cloudFileName!: string;

  /**
   * Attributes Being set after cv extraction and comparing `Job description` and `CV`
   * from `Python script` on aws lambda
   *
   * Possible Details for `cvExtractedParsed` are as follows:
   * Candidate Name, Candidate Experience, Candidate Current company, Candidate Current Designation, Candidate Email ID,
   * Candidate Phone Number
   * 
   * @example 
    {
      "candidateName": "Rohith Appala",
      "candidateEmail": "rohithappala777@gmail.com",
      "candidatePhoneNumber": "+919666308100",
      "candidateNumber": 9666308100,
      "candidatePhoneCountryCode": 91,
      "candidateCurrentCompany": "Worko.ai-India"
      "candidateCurrentDesignation": "NodeJs Backend Developer",
      "candidateExperience": 3,
      "candidateTotalYOE": 3,
      "candidateRelevantYOE": 4,
      "candidateCurrentCTC": 10,
      "candidateExpectedCTC": 9,
      "candidateNoticePeriod": 60,
      "candidateLocation": "Hyderabad, Telangana",
      "candidateReadyToRelocate": false,
      "isNoticePeriodNegotiable": false,
    }
   */
  cvExtractedParsed?: CorporateBulkJdResumeDbCvExtractedParsedDto;
  cvExtract?: string;
  matchingScore!: number;
  jdMatchErrorCode?: number;
  jdMatchErrorDesc?: string;
  scoreDetails?: string;
  scoreFetchedDate?: string;
  rejectionFeedbackBySystem?: string;
}

// Define the schema for the Corporate Bulk JD Resume model
const CorporateBulkJdResumeSchema: Schema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    id: {
      type: String,
      required: true,
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
    GSI2PK: {
      type: String,
      index: {
        name: "GSI2",
        type: "global",
        rangeKey: "GSI2SK",
      },
    },
    GSI2SK: {
      type: String,
      index: {
        name: "GSI2",
        type: "global",
      },
    },
    companyId: {
      type: String,
      required: true,
    },
    corporateBulkJdId: {
      type: String,
      required: true,
    },
    createdByUserId: {
      type: String,
      required: false,
    },
    updatedByUserId: {
      type: String,
      required: false,
    },
    createdByCorporateUserId: {
      type: String,
      required: false,
    },
    updatedByCorporateUserId: {
      type: String,
      required: false,
    },
    processingStatus: {
      type: String,
      required: true,
    },
    userFileName: {
      type: String,
      required: true,
    },
    cloudFileName: {
      type: String,
      required: true,
    },
    cvExtractedParsed: {
      type: Object,
      required: false,
    },
    cvExtract: {
      type: String,
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
    jdMatchErrorDesc: {
      type: String,
      required: false,
    },
    scoreDetails: {
      type: String,
      required: false,
    },
    scoreFetchedDate: {
      type: String,
      required: false,
    },
    rejectionFeedbackBySystem: {
      type: String,
      required: false,
    },
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Create the CorporateBulkJdResumeModel using the defined schema
const CorporateBulkJdResumeModel: ModelType<DbCorporateBulkJdResumeDto> =
  dynamoose.model<DbCorporateBulkJdResumeDto>(
    "CorporateBulkJdResume",
    CorporateBulkJdResumeSchema
  );

// Export the CorporateBulkJdResumeModel
export { CorporateBulkJdResumeModel, DbCorporateBulkJdResumeDto };
