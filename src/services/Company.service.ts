import {
  instanceToInstance,
  plainToClass,
  plainToInstance,
} from "class-transformer";
import DB_CONSTANTS from "../db/DB.constants";
import CompanyDao, { Company } from "../daos/Company.dao";
import UlidService from "../services/Ulid.service";
import { CompanyDTO } from "../dtos/Company.dto";
import * as dynamoose from "dynamoose";
import { AnyItem } from "dynamoose/dist/Item";

class CompanyService {
  constructor() {}

  companySchema = new dynamoose.Schema(
    DB_CONSTANTS.WORKO_PK_SK,
    DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS
  );
  CompanyModel = dynamoose.model(
    DB_CONSTANTS.COMPANY_MODEL,
    this.companySchema
  );
  table = new dynamoose.Table("worko", [this.CompanyModel]);

  async createNewCompany(companyDto: CompanyDTO) {
    try {
      companyDto.PK = DB_CONSTANTS.COMPANY_PK;
      companyDto.SK = DB_CONSTANTS.COMPANY_SK_INIT + UlidService.getUlidId();

      // let company = plainToClass(Company, companyDto);
      // console.log(company)

      // let logger;
      // try {
      //     logger = await dynamoose.logger();
      // } catch (e) {
      //     console.log(e)
      //     console.error("The `dynamoose-logger` package has not been installed.");
      // }

      // (await dynamoose.logger()).providers.set(console);
      console.log("43");
      const companySchema = new dynamoose.Schema(
        DB_CONSTANTS.WORKO_PK_SK,
        DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS
      );
      console.log("model");
      const CompanyModel = dynamoose.model(
        DB_CONSTANTS.COMPANY_MODEL,
        companySchema
      );
      console.log("52");
      const table = new dynamoose.Table("worko", [CompanyModel]);
      console.log("54");
      const result = await CompanyModel.create(companyDto);
      console.log(result);
    } catch (error) {
      throw error;
    }
  }

  async getCompanyList() {
    try {
      return this.CompanyModel.query("PK").eq(DB_CONSTANTS.COMPANY_PK).exec();
    } catch (error) {
      throw error;
    }
  }
}

export default new CompanyService();
