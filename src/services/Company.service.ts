// import dynamoose libraries
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Load the local daos
import companyDao from "../daos/Company.dao";
import companyDetailDao from "../daos/CompanyDetail.dao";
import companyRequestDao from "../daos/CompanyRequest.dao";

// Load the local dto
import {
  CompanyDTO,
  AddCompanyDTO,
  CompanyListingFilterOptions,
} from "../dtos/Company.dto";
import { RecordListingFilterOptions } from "../dtos/Common.dto";


//Load models
import { DbCompanyDetailDto } from "../db/models/CompanyDetail.model";

// @todo update the method return type, request payload types, etc for all methods.
// @todo Kindly remove the try-catch blocks from all methods, having just one try-catch blocks in the controller methods should be helpful.
// We should also think of somehow having global try catch, so that we dont have to write try-catch block anywhere, unless something is exceptional.

/**
 * CompanyService class responsible for managing company-related operations.
 */
class CompanyService {
  constructor() {}

  /**
   * getCompanyDetailById
   *
   * Retrieves the details of a company based on the provided company ID.
   *
   * @param {string} companyId - The ID of the company to retrieve details for.
   * @return {Promise<QueryResponse<DbCompanyDetailDto>>} A promise that resolves with the query response containing the company details.
   */
  async getCompanyDetailById(
    companyId: string
  ): Promise<QueryResponse<DbCompanyDetailDto>> {
    return companyDetailDao.getCompanyDetailById(companyId);
  }

  /**
   *
   * @param name
   */
  async getCompanyByName(name: string) {
    return companyDao.getCompanyByName(name);
  }

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
   * @param ids
   * Returns the list of companies having the InputKeys
   */
  async getCompanyDetailsByIds(ids: string[]) {
    return companyDetailDao.getCompanyDetailsByIds(ids);
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

  async getAllCompanyNames() {
    return companyDetailDao.getAllCompanyNames();
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
   * update company details
   * @param companyDto
   * @param id
   * @returns
   */
  async updateCompany(companyDto: CompanyDTO, id: string) {
    return companyDetailDao.update(companyDto, id);
  }

  async getRequestedCompanyByName(name: string) {
    return companyRequestDao.getRequestedCompanyByName(name);
  }
  /**
   *
   * Request for a new company with provided details.
   *
   * @param addCompanyDTO
   */
  async requestNewCompany(addCompanyDTO: AddCompanyDTO) {
    try {
      return companyRequestDao.request(addCompanyDTO);
    } catch (error) {
      throw error;
    }
  }
}

// Export an instance of the CompanyService class
export default new CompanyService();
