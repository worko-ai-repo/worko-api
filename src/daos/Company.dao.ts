import BaseDao from "./Base.dao";
import { CompanyModel } from "../db/models/Company.model";

// Strongly typed model
class CompanyDao implements BaseDao {
  modelName = "Company";
  partitianKey = "COMP#";
  sortKeys = {};

  "name": String;
  "industry": String;
  "teamSize": Number;
  "carrierPage": String;
  "linkedIn": String;
  "logoUrl": String;

  /* CompanyModel = dynamoose.model(COMPANY_CONSTANTS.MODEL, [DBBaseSchema]);
  CompanyTable = new dynamoose.Table(DB_CONSTANTS.WORKO_TABLE_NAME, [
    CompanyDao.CompanyModel,
  ]);

  AddCompanyModel = dynamoose.model(COMPANY_CONSTANTS.REQUEST_MODEL, [
    DBBaseSchema,
  ]);
  AddCompanyTable = new dynamoose.Table(DB_CONSTANTS.WORKO_TABLE_NAME, [
    CompanyDao.AddCompanyModel,
  ]); */

  async companyList() {
    try {
      return CompanyModel.query("PK").eq(this.partitianKey).exec();
    } catch (error) {
      throw error;
    }
  }
}

// Export only the CompanyDao class
export default new CompanyDao();
