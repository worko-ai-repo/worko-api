// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// Declaring a class 'CompanyJobsDbDto' that extends 'BaseDbDto' with specific properties for company Jobs
class DbCompanyJobDto extends BaseDbDto {
  jobUrl!: string;
  jdExtracted?: object;
  GSI1PK!: string;
  GSI1SK!: string;
}

// Creating a DynamoDB schema for the 'CompanyJob' model with specified attributes and their types
const CompanyJobSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    jobUrl: {
      type: String,
      required: true,
    },
    jdExtracted: {
      type: Object, // Use the Map data type
      required: false,
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
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Creating a DynamoDB model 'CompanyJobModel' based on the 'CompanyJobSchema' and registering it with the database model
const CompanyJobModel = dynamoose.model<DbCompanyJobDto>(
  "CompanyJob",
  CompanyJobSchema
);

// Exporting the 'CompanyJobModel' for external usage
export { CompanyJobModel };
