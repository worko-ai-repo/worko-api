// import { DB_CONSTANTS } from "../db/DB.constants";
import {
  CompanyModel,
  COMPANY_CONSTANTS,
  AddCompanyModel,
} from "../daos/Company.dao";
import UlidService from "../services/Ulid.service";
import { CompanyDTO, AddCompanyDTO } from "../dtos/Company.dto";

class CompanyService {
  constructor() {}

  async createNewCompany(companyDto: CompanyDTO) {
    try {
      companyDto.PK = COMPANY_CONSTANTS.PK;
      companyDto.SK = COMPANY_CONSTANTS.SK_INIT + UlidService.getUlidId();
      const result = await CompanyModel.create(companyDto);
      console.log(result);
    } catch (error) {
      throw error;
    }
  }

  async getCompanyList() {
    try {
      return CompanyModel.query("PK").eq(COMPANY_CONSTANTS.PK).exec();
    } catch (error) {
      throw error;
    }
  }

  async AddCompany(addCompanyDTO: AddCompanyDTO) {
    try {
      addCompanyDTO.PK = COMPANY_CONSTANTS.REQUEST_PK;
      addCompanyDTO.SK = COMPANY_CONSTANTS.SK_INIT + UlidService.getUlidId();
      const result = await AddCompanyModel.create(addCompanyDTO);
      console.log(result);
    } catch (error) {
      throw error;
    }
  }

  async getRequestedCompanies() {
    try {
      return AddCompanyModel.query("PK")
        .eq(COMPANY_CONSTANTS.REQUEST_PK)
        .exec();
    } catch (error) {
      throw error;
    }
  }
}

export default new CompanyService();
