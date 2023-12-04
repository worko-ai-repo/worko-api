import * as dynamoose from "dynamoose";

//Local
import { DB_CONSTANTS } from "../DB.constants";
import { dbModel } from "./Base.model";

const CompanySchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

const CompanyModel = dynamoose.model("Company", CompanySchema);
dbModel.registerModel(CompanyModel);

export { CompanyModel };

// Load the npm packages
/* import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DBBaseSchema } from "./Base.model";
import { dbModel, BaseDbDto } from "./Base.model";
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

// Define the CompanyDetailModel using dynamoose.model
const CompanyModel = dynamoose.model<CompanyDetailsDbDto>(
  "CompanyDetail",
  CompanySchema
);

// Register the model using the model object
dbModel.registerModel(CompanyModel);

// Export the CompanyDetailModel
export { CompanyModel }; */
