// Import necessary modules
import * as dynamoose from "dynamoose";

// Local
import { DB_CONSTANTS } from "../DB.constants";
import { DBBaseSchema } from "./Base.model";
import { model, BaseDbDto } from "./Base.model";

class CompanyRequestDbDto extends BaseDbDto {
  UserType!: string;
  companyDetail!: Record<string, any>; // Use Record<string, any> for map-like structure
  status!: string;
}

// Define the Company Schema with additional attributes
const CompanySchema = new dynamoose.Schema(
  {
    ...DBBaseSchema.attributes,
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

// Create the Company Model
const CompanyRequestModel = dynamoose.model("CompanyRequest", CompanySchema);
model.registerModel(CompanyRequestModel);

export { CompanyRequestModel };
