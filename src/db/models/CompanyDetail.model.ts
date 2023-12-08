// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// Declaring a class 'CompanyDetailsDbDto' that extends 'BaseDbDto' with specific properties for company details
class DbCompanyDetailDto extends BaseDbDto {
  name!: string;
  industry!: string;
  teamSize!: number;
  carrierPage!: string;
  linkedIn!: string;
  logoUrl!: string;
}

// Creating a DynamoDB schema for the 'Company' model with specified attributes and their types
const CompanySchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    name: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    teamSize: {
      type: Number,
      required: true,
    },
    carrierPage: {
      type: String,
      required: true,
    },
    linkedIn: {
      type: String,
      required: true,
    },
    logoUrl: {
      type: String,
      required: true,
    },
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Creating a DynamoDB model 'CompanyDetailModel' based on the 'CompanySchema' and registering it with the database model
const CompanyDetailModel = dynamoose.model<DbCompanyDetailDto>(
  "CompanyDetail",
  CompanySchema
);

// Exporting the 'CompanyDetailModel' for external usage
export { CompanyDetailModel };
