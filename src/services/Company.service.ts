// import dynamoose libraries
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Load the local daos
import companyDetailDao from "../daos/CompanyDetail.dao";
import companyRequestDao from "../daos/CompanyRequest.dao";

// Load the local dto
import {
  CompanyDTO,
  AddCompanyDTO,
  CompanyListingFilterOptions,
  Status,
  CompanyUpdateDto,
  CompanyUpdateLogoApiDto,
  CompanyCommonUpdateDto,
} from "../dtos/Company.dto";
import { PaginatedResultsWithMatchingConditionsResponse } from "../dtos/Common.dto";
import { CompanyRequestListingFilterOptions, UpdateCompanyRequestDto } from "../dtos/CompanyRequest.dto";

//Load models
import { DbCompanyDetailDto } from "../db/models/CompanyDetail.model";
import { DbCompanyRequestDto } from "../db/models/CompanyRequest.model";

// Load services
import { companyRequestServiceObj } from "./companyRequest.service";

// import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

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
   * getCompanyByName
   *
   * Retrieves a list of existing companies that have names starting with the given string.
   *
   * @param {string} name - The prefix of the company name to search.
   * @returns {Promise<QueryResponse<DbCompanyDetailDto>>} A promise that resolves with the query response containing the company details that match the prefix.
   */
  async getCompanyByName(name: string) {
    return companyDetailDao.getByCompanyName(name);
  }

  /**
   * getCompanyList
   *
   * Retrieves a list of companies based on the provided filter options.
   *
   * @param {CompanyListingFilterOptions} filterOptions - The filter options to apply to the query.
   * @returns {Promise<PaginatedResultsWithMatchingConditionsResponse<DbCompanyDetailDto>>} A promise that resolves with the paginated results containing the company details that match the filter options.
   */
  async getCompanyList(
    filterOptions: CompanyListingFilterOptions
  ): Promise<
    PaginatedResultsWithMatchingConditionsResponse<DbCompanyDetailDto>
  > {
    return companyDetailDao.companyList(filterOptions);
  }

  /**
   * softDeleteCompanyById
   *
   * Soft deletes a company by updating the `isDeleted` field to true based on the provided company ID.
   *
   * @param {string} id - The ID of the company to be soft deleted.
   * @returns {Promise<DbCompanyDetailDto>} A promise that resolves with the updated company details.
   */
  async softDeleteCompanyById(id: string): Promise<DbCompanyDetailDto> {
    global.logger.info("Soft Delete company by id [service]", {
      filePath: __filename,
      methodName: this.softDeleteCompanyById.name,
      id: id,
    });

    // get company details by `id` and throw an error if it doesn't exist
    const companyDetailsResponse: QueryResponse<DbCompanyDetailDto> =
      await companyDetailDao.getCompanyDetailById(id);
    if (!companyDetailsResponse.count) {
      throw new BaseError(
        "The Company is Not Found.",
        HttpStatusCode.NOT_FOUND_404
      );
    }

    // Retrieve company details
    const companyDetails: DbCompanyDetailDto = companyDetailsResponse[0];

    // Get company request details by `companyId`
    const companyRequestDetails: QueryResponse<DbCompanyRequestDto> =
      await companyRequestServiceObj.getCompanyRequestByCompanyId(
        companyDetails.id
      );

    // delete the company request if it exists
    if (companyRequestDetails.count) {
      const updateCompanyRequestDetails: Partial<UpdateCompanyRequestDto> = {
        isDeleted: true,
      };

      await companyRequestServiceObj.softDeleteCompanyRequestByPkAndSk(
        companyRequestDetails[0].PK,
        companyRequestDetails[0].SK,
        updateCompanyRequestDetails
      );
    }

    // delete company details
    return companyDetailDao.softDeleteCompanyByPkAndSk(
      companyDetails.PK,
      companyDetails.SK
    );
  }

  /**
   * softDeleteCompanyRequestByCompanyId
   *
   * Soft deletes a company request by updating the `isDeleted` field to true based on the provided company ID.
   *
   * @param {string} companyId - The ID of the company for which the request is to be soft deleted.
   * @returns {Promise<DbCompanyRequestDto>} A promise that resolves with the updated company request details.
   */
  async softDeleteCompanyRequestByCompanyId(companyId: string): Promise<DbCompanyRequestDto> {
    global.logger.info("Soft Delete company request by company id [service]", {
      filePath: __filename,
      methodName: this.softDeleteCompanyRequestByCompanyId.name,
      companyId: companyId,
    });

    // Check if the company request exists for the provided company ID and throw an error if it doesn't
    const companyRequestDetailsQueryResponse: QueryResponse<DbCompanyRequestDto> =
      await companyRequestServiceObj.getCompanyRequestByCompanyId(companyId);
    if (!companyRequestDetailsQueryResponse.count) {
      throw new BaseError(
        "The Company Request is Not Found.",
        HttpStatusCode.NOT_FOUND_404
      );
    }

    // get company request details
    const companyRequestDetails: DbCompanyRequestDto =
      companyRequestDetailsQueryResponse[0];

    // get company details by id
    const companyDetails: QueryResponse<DbCompanyDetailDto> =
      await companyDetailDao.getCompanyDetailById(
        companyRequestDetails.companyId
      );

    // delete the company details if it exists
    if (companyDetails.count) {
      await companyDetailDao.softDeleteCompanyByPkAndSk(companyDetails[0].PK, companyDetails[0].SK);
    }

    // Prepare the data required to soft delete a company request
    const updateCompanyRequestDto: Partial<UpdateCompanyRequestDto> = {
      isDeleted: true,
    };

    // delete company details
    return companyRequestServiceObj.softDeleteCompanyRequestByPkAndSk(
      companyRequestDetails.PK,
      companyRequestDetails.SK,
      updateCompanyRequestDto
    );
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

  /**
   * getRequestedCompanyList
   *
   * Retrieves a list of requested companies based on the provided filter options.
   *
   * @param {CompanyRequestListingFilterOptions} filterOptions - The filter options to apply to the query.
   * @returns {Promise<PaginatedResultsWithMatchingConditionsResponse<DbCompanyRequestDto>>} A promise that resolves with the paginated results containing the requested companies that match the filter options.
   */
  async getRequestedCompanyList(
    filterOptions: CompanyRequestListingFilterOptions
  ): Promise<
    PaginatedResultsWithMatchingConditionsResponse<DbCompanyRequestDto>
  > {
    global.logger.info("Get requested company list [service]", {
      filePath: __filename,
      methodName: this.getRequestedCompanyList.name,
    });

    return companyRequestDao.getRequestedCompanyList(filterOptions);
  }

  async getAllCompanyNames() {
    return companyDetailDao.getAllCompanyNames();
  }

  /**
   * addNewCompany
   *
   * Adds a new company to the database using the provided company DTO.
   *
   * @param {CompanyDTO} companyDto - The data transfer object containing the details of the company to be added.
   * @returns {Promise<DbCompanyDetailDto>} A promise that resolves with the details of the added company.
   */
  async addNewCompany(companyDto: CompanyDTO): Promise<DbCompanyDetailDto> {
    return companyDetailDao.add(companyDto);
  }

  /**
   * updateCompany
   *
   * Updates a company in the database using the provided company DTO.
   *
   * @param {string} companyId - The ID of the company to be updated.
   * @param {CompanyUpdateDto} companyDto - The data transfer object containing the details of the company to be updated.
   * @param {boolean} isCompanyRequestPageFlag - A flag indicating whether the update is coming from the company request page.
   * @returns {Promise<DbCompanyDetailDto>} A promise that resolves with the updated company details.
   */
  async updateCompany(
    companyId: string,  
    companyDto: CompanyUpdateDto,
    isCompanyRequestPageFlag: boolean
  ): Promise<DbCompanyDetailDto> {
    // Log the details
    global.logger.info("Update company [service]", {
      filePath: __filename,
      methodName: this.updateCompany.name,
      companyId: companyId,
      isVerified: companyDto.isVerified,
      isCompanyRequestPageFlag: isCompanyRequestPageFlag,
    });

    // Update the company details
    const companyDetails: DbCompanyDetailDto = await companyDetailDao.update(
      companyId,
      companyDto
    );
    global.logger.debug(`Debugging Company Details after updating [service]`, {
      isVerified: companyDto.isVerified,
    });

    // If company request page flag is true, update the company request
    if (isCompanyRequestPageFlag && companyDetails.isVerified) {
      global.logger.info(
        `Update Company Request Details, if company details are verified. [service]`
      );

      // Prepare update company request dto
      const updateCompanyRequestDto: Partial<UpdateCompanyRequestDto> = {
        // @todo: discuss with team lead that when we should update the status of the company request to `denied`.
        status: Status.APPROVED,
      };

      // Update the company request by company id
      await companyRequestServiceObj.updateCompanyRequestByCompanyId(
        companyId,
        updateCompanyRequestDto
      );
    }

    // Return the updated company details
    return companyDetails;
  }

  /**
   * updateCompanyLogo
   *
   * Updates the logo for a company using the provided company id and update logo dto.
   *
   * @param {string} companyId - The ID of the company to be updated.
   * @param {CompanyUpdateLogoApiDto} updateLogoDto - The DTO containing the company logo cloud file name to be updated.
   *
   * @returns {Promise<DbCompanyDetailDto>} A promise that resolves with the updated company details.
   */
  async updateCompanyLogo(companyId: string, updateLogoDto: CompanyUpdateLogoApiDto): Promise<DbCompanyDetailDto> {
    global.logger.info(`Update company logo [service]`, {
      filePath: __filename,
      methodName: this.updateCompanyLogo.name,
      companyId: companyId,
    });

    // Check whether the company exists or not
    const companyDetail: QueryResponse<DbCompanyDetailDto> = await companyDetailDao.getCompanyDetailById(companyId);
    if (!companyDetail.count) {
      throw new BaseError("The Company Details not found.", HttpStatusCode.NOT_FOUND_404);
    }

    // Prepare update company dto
    const updateData: Partial<CompanyCommonUpdateDto> = {
      logo: updateLogoDto.companyLogoCloudFileName,
    };

    return companyDetailDao.updateCompanyDetailsById(companyId, updateData);
  }

  async getRequestedCompanyByName(name: string) {
    return companyRequestDao.getRequestedCompanyByName(name);
  }

  /**
   * requestNewCompany
   *
   * Requests the creation of a new company in the database using the provided company DTO.
   *
   * @param {AddCompanyDTO} addCompanyDTO - The data transfer object containing the details of the company to be requested.
   * @param {string} companyId - The ID of the company for which the request is made.
   * @returns {Promise<DbCompanyRequestDto>} A promise that resolves with the details of the newly requested company.
   */
  async requestNewCompany(
    addCompanyDTO: AddCompanyDTO,
    companyId: string
  ): Promise<DbCompanyRequestDto> {
    // log the request
    global.logger.info(`Request new Company [service]`, {
      filePath: __filename,
      methodName: this.requestNewCompany.name,
      companyId: companyId,
    });

    // return the requested company
    return companyRequestDao.request(addCompanyDTO, companyId);
  }
}

// Export an instance of the CompanyService class
export default new CompanyService();
