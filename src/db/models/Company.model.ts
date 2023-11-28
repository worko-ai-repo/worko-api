/* import * as dynamoose from "dynamoose";

//Local
import { DB_CONSTANTS } from "../DB.constants";
import { DBBaseSchema } from "./Base.model";
import { model } from "./Base.model";

const CompanySchema = new dynamoose.Schema(
  {
    ...DBBaseSchema.attributes,
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

const CompanyModel = dynamoose.model("Company", CompanySchema);
model.registerModel(CompanyModel);

export { CompanyModel }; */

// Import necessary modules
import * as dynamoose from "dynamoose";
import { DBBaseSchema } from "./Base.model";
import { model, BaseDbDto } from "./Base.model";
import { DB_CONSTANTS } from "../DB.constants";

// Define the CompanyDetailsDbDto class
class CompanyDetailsDbDto extends BaseDbDto {
  name!: string;
  industry!: string;
  teamSize!: number;
  carrierPage!: string;
  linkedIn!: string;
  logoUrl!: string;
}

// Define the CompanySchema with the correct attributes
const CompanySchema = new dynamoose.Schema(
  {
    ...DBBaseSchema.attributes,
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

// Define the CompanyDetailModel using dynamoose.model
const CompanyModel = dynamoose.model<CompanyDetailsDbDto>(
  "CompanyDetail",
  CompanySchema
);

// Register the model using the model object
model.registerModel(CompanyModel);

// Export the CompanyDetailModel
export { CompanyModel };
