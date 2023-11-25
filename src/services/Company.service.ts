import CompanyDao from "../daos/Company.dao";
import { CompanyDTO, AddCompanyDTO } from "../dtos/Company.dto";

class CompanyService {
  constructor() {}

  async getCompanyList() {
    try {
      return CompanyDao.companyList();
    } catch (error) {
      throw error;
    }
  }

  async getRequestedCompanies() {
    try {
      return CompanyDao.requestedCompany();
    } catch (error) {
      throw error;
    }
  }

  async addNewCompany(companyDto: CompanyDTO) {
    try {
      const result = await CompanyDao.add(companyDto);
      console.log(result);
    } catch (error) {
      throw error;
    }
  }

  async AddCompany(addCompanyDTO: AddCompanyDTO) {
    try {
      const result = await CompanyDao.request(addCompanyDTO);
      console.log(result);
    } catch (error) {
      throw error;
    }
  }
}

export default new CompanyService();
