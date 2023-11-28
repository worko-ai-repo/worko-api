import * as dynamoose from "dynamoose";
import Worko from "../db/Dynamoose.config";
import { DB_CONSTANTS } from "../db/DB.constants";
import { DBBaseSchema } from "../db/models/Base.model";
import { CompanyDTO, AddCompanyDTO } from "../dtos/Company.dto";
import UlidService from "../services/Ulid.service";

// Company related constants here
const COMPANY_CONSTANTS = {
  MODEL: "Company",
  PK: "COMPANY#",
  SK_INIT: "ID#{companyId}",
  REQUEST_PK: "RQST#COMP#",
  REQUEST_SK: "ID#{requestId}",
  REQUEST_MODEL: "RequestCompany",
};

// Strongly typed model
class CompanyDao extends Worko {
  "name": String;
  "industry": String;
  "teamSize": Number;
  "carrierPage": String;
  "linkedIn": String;
  "logoUrl": String;

  static CompanyModel = dynamoose.model(COMPANY_CONSTANTS.MODEL, [
    DBBaseSchema,
  ]);
  static CompanyTable = new dynamoose.Table(DB_CONSTANTS.WORKO_TABLE_NAME, [
    CompanyDao.CompanyModel,
  ]);

  static AddCompanyModel = dynamoose.model(COMPANY_CONSTANTS.REQUEST_MODEL, [
    DBBaseSchema,
  ]);
  static AddCompanyTable = new dynamoose.Table(DB_CONSTANTS.WORKO_TABLE_NAME, [
    CompanyDao.AddCompanyModel,
  ]);

  static async companyList() {
    try {
      return CompanyDao.CompanyModel.query("PK")
        .eq(COMPANY_CONSTANTS.PK)
        .exec();
    } catch (error) {
      throw error;
    }
  }

  static async requestedCompany() {
    try {
      return CompanyDao.AddCompanyModel.query("PK")
        .eq(COMPANY_CONSTANTS.REQUEST_PK)
        .exec();
    } catch (error) {
      throw error;
    }
  }

  static async add(companyDto: CompanyDTO) {
    try {
      companyDto.PK = COMPANY_CONSTANTS.PK;
      companyDto.SK = COMPANY_CONSTANTS.SK_INIT + UlidService.getUlidId();
      return CompanyDao.CompanyModel.create(companyDto);
    } catch (error) {
      throw error;
    }
  }

  static async request(addCompanyDto: AddCompanyDTO) {
    try {
      addCompanyDto.PK = COMPANY_CONSTANTS.REQUEST_PK;
      addCompanyDto.SK = COMPANY_CONSTANTS.SK_INIT + UlidService.getUlidId();
      return CompanyDao.AddCompanyModel.create(addCompanyDto);
    } catch (error) {
      throw error;
    }
  }
}

// Export only the CompanyDao class
export default CompanyDao;
