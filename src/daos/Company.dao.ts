import * as dynamoose from "dynamoose";
import Worko from "../db/Dynamoose.config";

import DB_CONSTANTS from "../db/DB.constants";

// Strongly typed model
export class Company extends Worko {
  "name": String;
  "industry": String;
  "teamSize": Number;
  "carrierPage": String;
  "linkedIn": String;
  "logoUrl": String;
}

const companySchema = new dynamoose.Schema(
  DB_CONSTANTS.WORKO_PK_SK,
  DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS
);
const CompanyModel = dynamoose.model(DB_CONSTANTS.COMPANY_MODEL, [
  companySchema,
]);
const Table = new dynamoose.Table("worko", [CompanyModel]);

export default CompanyModel;
