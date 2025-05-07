// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// Define the structure for Company Request Database Data Transfer Object (DTO)
class DbCompanyRequestDto extends BaseDbDto {
  // Ids
  companyId!: string; // Refer `id` attribute in `CompanyDetail.model.ts`
  userName!: string; // Refer `userName` attribute in `User.model.ts`
  userType!: string;
  companyDetail!: Record<string, any>; // Utilizing Record<string, any> for a map-like structure
  status!: string;
  userEmail!: string;
  userContactNumber?: string;
  referralRequestUrl?: string; // Referral request that user want to apply for in this company
  isDeleted?: boolean;
}

// Define the Company Schema including additional attributes
const CompanySchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    companyId: {
      type: String,
      required: true,
    },
    userName:{
      type: String,
      required: true,
    },
    userType: {
      type: String,
      required: true,
    },
    companyDetail: {
      type: Object,
      required: false,
    },
    status: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userContactNumber: {
      type: String,
      required: false,
    },
    referralRequestUrl: {
      type: String,
      required: false,
    },
    isDeleted: {
      type: Boolean,
      required: false,
      default: false,
    }
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Create the Company Model using the defined Schema
const CompanyRequestModel = dynamoose.model<DbCompanyRequestDto>(
  "CompanyRequest",
  CompanySchema
);

// Export the Company Request Model for external use
export { CompanyRequestModel, DbCompanyRequestDto };
