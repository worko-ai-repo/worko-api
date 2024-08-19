// import dynamoose libraries
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Load the local daos
import companyDetailDao from "../../daos/CompanyDetail.dao";

// Load the local dto
import { DbCompanyDetailDto } from "../../db/models/CompanyDetail.model";

/**
 * CompanyService
 *
 * Service class for handling company-related operations by admin.
 */
class CompanyService {
  /**
   * getCompanyDetailById
   * 
   * Retrieves the details of a company based on the provided company ID by admin.
   *
   * @param {string} companyId - The ID of the company to retrieve company details.
   * @return {Promise<QueryResponse<DbCompanyDetailDto>>} A promise that resolves with the query response containing the company details.
   */
  async getCompanyDetailById(
    companyId: string
  ): Promise<QueryResponse<DbCompanyDetailDto>> {
    // Log the action of fetching company details by ID in the service
    global.logger.info("company details by company id [admin company service]");

    // Call the DAO method to retrieve company details by ID
    return companyDetailDao.getCompanyDetailById(companyId);
  }
}

// Create an instance of CompanyService
const companyServiceObj = new CompanyService();

// Export the CompanyService class and the companyServiceObj
export { CompanyService, companyServiceObj };
