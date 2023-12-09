import * as dynamoose from "dynamoose";

// Import configurations
import { DB_CONSTANTS } from "../DB.constants";

const CompanySchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

const CompanyModel = dynamoose.model("Company", CompanySchema);

export { CompanyModel };