// Load dynamoose
import { Query, QueryResponse } from "dynamoose/dist/ItemRetriever";

//Load the base dao
import BaseDao from "./Base.dao";

// Load DTOs
import { CompanyRequestListingFilterOptions, UpdateCompanyRequestDto } from "../dtos/CompanyRequest.dto";
import { PaginatedResultsWithMatchingConditionsResponse } from "../dtos/Common.dto";

// Load enums
import { SortOrderTypeEnum } from "../enums/Common.enum";

//Load the local model
import { CompanyRequestModel, DbCompanyRequestDto } from "../db/models/CompanyRequest.model";

//Load the local dtos
import { AddCompanyDTO, Status } from "../dtos/Company.dto";

//Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";
import { getPaginatedResultsWithMatchingConditions } from "../helpers/dynamoose.helper";

class CompanyRequestDao implements BaseDao {
  modelName = "RequestCompany"; // Define the model name for the company request
  partitianKey = "RQST#COMP#"; // Define the partition key for company request data
  sortKeys = { REQUEST_SK: "ID#{requestId}" }; // Define the sort keys for sorting request IDs

  /**
   * Retrieves requested company data based on the partition key
   *
   * @returns Promise that resolves with requested company data
   */
  async requestedCompany() {
    try {
      return CompanyRequestModel.query("PK").eq(this.partitianKey).exec();
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
    global.logger.info(`Get Requested Company By filter options [DAO]`, {
      filePath: __filename,
      methodName: this.getRequestedCompanyList.name,
    });

    // Initialize the query
    let query: Query<DbCompanyRequestDto> = CompanyRequestModel.query("PK")
      .eq(this.partitianKey)
      .where("SK")
      .beginsWith(this.sortKeys.REQUEST_SK.strtr({ "{requestId}": "" }));

    // Sort the results based on the provided sort order
    query = query.sort(filterOptions.sortOrder as SortOrderTypeEnum);

    // Apply status filter if provided
    if (filterOptions.status) {
      query = query.where("status").eq(filterOptions.status);
    }

    // Apply date range filter if provided
    if (filterOptions.fromDate || filterOptions.toDate) {
      query = query.and().parenthesis((condition) => {
        if (filterOptions.fromDate) {
          condition.where("createdAt").ge(filterOptions.fromDate);
        }
        if (filterOptions.toDate) {
          condition.where("createdAt").le(filterOptions.toDate);
        }
        return condition;
      });
    }

    // search by searchText if provided
    if (filterOptions.searchText) {
      // remove trailing and leading spaces from the search text
      let searchTextValue = filterOptions.searchText;

      /* 
      The and() method initiates a condition block where all conditions within it must be satisfied.
      The parenthesis() method allows grouping of conditions for complex queries.
      */
      query = query.and().parenthesis((condition) => {
        condition
          .where("status")
          .contains(searchTextValue.toLowerCase())
          .or()
          .where("userEmail")
          .contains(searchTextValue.toLowerCase()) // `userEmail` was stored in random case in the database
          .or()
          .where("userType")
          .contains(searchTextValue.toUpperCase())
          .or()
          .where("userContactNumber") // `userContactNumber` was stored in string data type in the database
          .contains(searchTextValue);

        // Return the built condition
        return condition;
      });
    }

    // Execute the query by applying the pagination helper and return the results
    return getPaginatedResultsWithMatchingConditions<
      DbCompanyRequestDto,
      CompanyRequestListingFilterOptions
    >(query, filterOptions);
  }

  async getRequestedCompanyByName(name: string) {
    return CompanyRequestModel.query("PK")
      .eq(this.partitianKey)
      .filter("companyDetail.name")
      .eq(name)
      .exec();
  }

  /**
   * request
   *
   * Requests a new company to be added in the database using the provided company DTO.
   *
   * @param {AddCompanyDTO} addCompanyDto - The data transfer object containing the details of the company to be added.
   * @param {string} companyId - The ID of the company for which the request is raised.
   * @returns {Promise<DbCompanyRequestDto>} A promise that resolves with the details of the newly requested company.
   */
  async request(addCompanyDto: AddCompanyDTO, companyId: string): Promise<DbCompanyRequestDto> {
    // Log the request
    global.logger.info("Request new Company [DAO]",{
      filePath: __filename,
      methodName: this.request.name,
      companyId: companyId
    });

    addCompanyDto.status = Status.NEW;
    const newAddCompanyDto = {
      PK: this.partitianKey,
      SK: this.sortKeys.REQUEST_SK.strtr(
        {
          "{requestId}": UlidService.getUlidId(),
        } // Generate a ULID-based request ID and set in the DTO
      ),
      ...addCompanyDto,
      companyId: companyId,
    };

    return CompanyRequestModel.create(newAddCompanyDto); // Create a new company request based on DTO
  }

  
  /**
   * getCompanyRequestByCompanyId
   *
   * Retrieves the details of a company request based on the provided company ID.
   *
   * @param {string} companyId - The ID of the company to retrieve the request details for.
   * @returns {Promise<QueryResponse<DbCompanyRequestDto>>} A promise that resolves with the query response containing the company request details.
   */
  async getCompanyRequestByCompanyId(companyId: string): Promise<QueryResponse<DbCompanyRequestDto>> {
    // Log the request
    global.logger.info("Get Company Request By Company Id [DAO]",{
      filePath: __filename,
      methodName: this.getCompanyRequestByCompanyId.name,
      companyId: companyId
    });

    return CompanyRequestModel.query("PK")
      .eq(this.partitianKey)
      .where("SK")
      .beginsWith(this.sortKeys.REQUEST_SK.strtr({ "{requestId}": "" }))
      .where("companyId")
      .eq(companyId)
      .exec();
  }

  /**
   * updateCompanyRequestByPkAndSk
   *
   * Updates a company request by its primary key and sort key.
   *
   * @param {string} PK - The primary key of the company request to be updated.
   * @param {string} SK - The sort key of the company request to be updated.
   * @param {Partial<UpdateCompanyRequestDto>} updateCompanyRequestDto - The partial DTO containing the updated details for the company request.
   * @returns {Promise<DbCompanyRequestDto>} - A promise that resolves with the updated company request details from database.
   */
  async updateCompanyRequestByPkAndSk( PK: string, SK: string, updateCompanyRequestDto: Partial<UpdateCompanyRequestDto> ): Promise<DbCompanyRequestDto> {
    // Log the request
    global.logger.info("Update Company Request By Company Id [DAO]", {
      filePath: __filename,
      methodName: this.updateCompanyRequestByPkAndSk.name,
      PK: PK,
      SK: SK,
    });

    return CompanyRequestModel.update({ PK: PK, SK: SK }, updateCompanyRequestDto);
  }

  /**
   * deleteCompanyRequest
   *
   * Deletes a company request from the database.
   *
   * @param {DbCompanyRequestDto} companyRequestDetails - The company request details to be deleted.
   * @returns {Promise<void>} A promise that resolves when the company request is deleted.
   */
  async deleteCompanyRequest(companyRequestDetails: DbCompanyRequestDto): Promise<void> {
    // Log the request
    global.logger.info("Delete Company Request [DAO]", {
      filePath: __filename,
      methodName: this.deleteCompanyRequest.name,
      PK: companyRequestDetails.PK,
      SK: companyRequestDetails.SK,
    });

    // Delete the company request
    return companyRequestDetails.delete();
  }
}

// Export only the CompanyRequestDao instance as the default export
const companyRequestDao = new CompanyRequestDao();

export default companyRequestDao;
