import DB_CONSTANTS from "../db/DB.constants";
import CompanyModel from "../daos/Company.dao";
import UlidService from "../services/Ulid.service";
import { CompanyDTO } from "../dtos/Company.dto";

class CompanyService {
  constructor() {}

  async createNewCompany(companyDto: CompanyDTO) {
    try {
      companyDto.PK = DB_CONSTANTS.COMPANY_PK;
      companyDto.SK = DB_CONSTANTS.COMPANY_SK_INIT + UlidService.getUlidId();
      console.log("Before");
      const result = await CompanyModel.create(companyDto);
      console.log("After");
      console.log(result);
    } catch (error) {
      throw error;
    }
  }

  async getCompanyList() {
    try {
      return CompanyModel.query("PK").eq(DB_CONSTANTS.COMPANY_PK).exec();
    } catch (error) {
      throw error;
    }
  }
}

export default new CompanyService();
