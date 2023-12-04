// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { dbModel, BaseDbDto } from "./Base.model";

// Define the structure for Company Request Database Data Transfer Object (DTO)
class DbCompanyRequestDto extends BaseDbDto {
  UserType!: string;
  companyDetail!: Record<string, any>; // Utilizing Record<string, any> for a map-like structure
  status!: string;
}

// Define the Company Schema including additional attributes
const CompanySchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    UserType: {
      type: String,
      required: true,
    },
    companyDetail: {
      type: Object,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
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
// Register the Company Request Model
dbModel.registerModel(CompanyRequestModel);

// Export the Company Request Model for external use
export { CompanyRequestModel };
