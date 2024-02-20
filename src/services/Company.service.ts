// Load the local daos
import companyDao from "../daos/Company.dao";
import companyDetailDao from "../daos/CompanyDetail.dao";
import companyRequestDao from "../daos/CompanyRequest.dao";

// Load the local dto
import { CompanyDTO, AddCompanyDTO, CompanyListingFilterOptions } from "../dtos/Company.dto";
import { RecordListingFilterOptions } from "../dtos/Common.dto";

// @todo update the method return type, request payload types, etc for all methods.
// @todo Kindly remove the try-catch blocks from all methods, having just one try-catch blocks in the controller methods should be helpful.
// We should also think of somehow having global try catch, so that we dont have to write try-catch block anywhere, unless something is exceptional.

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
  async getCompanyList(filterOptions: CompanyListingFilterOptions) {
    return companyDetailDao.companyList(filterOptions);
  }

  /**
   *
   * Retrieves a list of existing companies.
   *
   * @returns
   */
  async getByBeginsWith(beginsWith: string) {
    return companyDetailDao.getByBeginsith(beginsWith);
  }

  /**
   *
   * Retrieves a list of requested companies.
   *
   * @returns
   */
  async getRequestedCompanies() {
    try {
      return companyRequestDao.requestedCompany();
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
    return companyDetailDao.add(companyDto);
  }

  /**
   *
   * Request for a new company with provided details.
   *
   * @param addCompanyDTO
   */
  async requestNewCompany(addCompanyDTO: AddCompanyDTO) {
    try {
      const result = await companyRequestDao.request(addCompanyDTO);
      console.log(result);
    } catch (error) {
      throw error;
    }
  }
}

// Export an instance of the CompanyService class
export default new CompanyService();
