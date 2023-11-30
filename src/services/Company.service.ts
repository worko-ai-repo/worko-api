// Load the local daos
import CompanyDao from "../daos/Company.dao";
import CompanyDetailDao from "../daos/CompanyDetail.dao";
import CompanyRequestDao from "../daos/CompanyRequest.dao";

// Load the local dto
import { CompanyDTO, AddCompanyDTO } from "../dtos/Company.dto";

/**
 * CompanyService class responsible for managing company-related operations.
 */
class CompanyService {
  constructor() {}

  /**
   *
   * Retrieves a list of existing companies.
   *
   * @returns
   */
  async getCompanyList() {
    try {
      return CompanyDao.companyList();
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * Retrieves a list of requested companies.
   *
   * @returns
   */
  async getRequestedCompanies() {
    try {
      return CompanyRequestDao.requestedCompany();
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * Adds a new company with provided details.
   *
   * @param companyDto
   */
  async addNewCompany(companyDto: CompanyDTO) {
    try {
      const result = CompanyDetailDao.add(companyDto);
      console.log(result);
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * Request for a new company with provided details.
   *
   * @param addCompanyDTO
   */
  async requestNewCompany(addCompanyDTO: AddCompanyDTO) {
    try {
      const result = await CompanyRequestDao.request(addCompanyDTO);
      console.log(result);
    } catch (error) {
      throw error;
    }
  }
}

// Export an instance of the CompanyService class
export default new CompanyService();
