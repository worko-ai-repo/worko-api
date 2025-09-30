// Load the npm packages
import * as dynamoose from "dynamoose";
import { ModelType } from "dynamoose/dist/General";
import { Schema } from "dynamoose/dist/Schema";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// import dtos
import { MinMaxRange } from "../../dtos/Common.dto";

// Define the structure for Corporate Bulk JD Database Data Transfer Object (DTO)
class DbCorporateBulkJdDto extends BaseDbDto {
  // Id
  id!: string;
  GSI1PK!: string;
  GSI1SK!: string;

  // References
  companyId!: string;
  createdByUserId?: string; // worko admin user id (`UserDetail` model)
  updatedByUserId?: string; // worko admin user id (`UserDetail` model)
  createdByCorporateUserId?: string; // corporate admin/recruiter user id (`CorporateUser` model)
  updatedByCorporateUserId?: string; // corporate admin/recruiter user id (`CorporateUser` model)

  jobDescription!: string;
  jobTitle!: string;
  jobLocation?: string;
  mustHaveSkills?: string[];
  mustNotHaveSkills?: string[];
  goodToHaveSkills?: string[];
  coreSkills?: string[];
  softSkills?: string[];
  technicalSkills?: string[];
  industryPreferences?: string[];
  experienceRange?: MinMaxRange;
  resumesCount?: number;
}

// Define the schema for the Corporate Bulk JD
const CorporateBulkJdSchema: Schema = new dynamoose.Schema(
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
    companyId: {
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
    jobDescription: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    jobLocation: {
      type: String,
      required: false,
    },
    mustHaveSkills: {
      type: Array,
      schema: String,
      required: false,
    },
    mustNotHaveSkills: {
      type: Array,
      schema: String,
      required: false,
    },
    goodToHaveSkills: {
      type: Array,
      schema: String,
      required: false,
    },
    coreSkills: {
      type: Array,
      schema: String,
      required: false,
    },
    softSkills: {
      type: Array,
      schema: String,
      required: false,
    },
    technicalSkills: {
      type: Array,
      schema: String,
      required: false,
    },
    industryPreferences: {
      type: Array,
      schema: String,
      required: false,
    },
    experienceRange: {
      type: Object,
      required: false,
      schema: {
        min: {
          type: Number,
          required: false,
        },
        max: {
          type: Number,
          required: false,
        },
      },
    },
    resumesCount: {
      type: Number,
      required: false,
      default: 0,
    }
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Create the CorporateBulkJdModel using the defined schema
const CorporateBulkJdModel: ModelType<DbCorporateBulkJdDto> =
  dynamoose.model<DbCorporateBulkJdDto>(
    "CorporateBulkJd",
    CorporateBulkJdSchema
  );

// Export the CorporateBulkJdModel
export { CorporateBulkJdModel, DbCorporateBulkJdDto };
