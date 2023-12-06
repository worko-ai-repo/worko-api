//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import { CompanyRequestModel } from "../db/models/CompanyRequest.model";

//Load the local dtos
import { AddCompanyDTO, Status, UserType } from "../dtos/Company.dto";

//Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";

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
   * Creates a request for adding a new company based on provided DTO
   *
   * @param addCompanyDto - DTO containing details for adding a company
   * @returns Promise that resolves with the created company request
   */
  async request(addCompanyDto: AddCompanyDTO) {
    try {
      addCompanyDto.PK = this.partitianKey; // Set partition key in the DTO
      addCompanyDto.SK = this.sortKeys.REQUEST_SK.strtr(
        {
          "{requestId}": UlidService.getUlidId(),
        } // Generate a ULID-based request ID and set in the DTO
      );
      addCompanyDto.status = Status.NEW;
      return CompanyRequestModel.create(addCompanyDto); // Create a new company request based on DTO
    } catch (error) {
      throw error;
    }
  }
}

// Export only the CompanyRequestDao instance as the default export
const companyRequestDao = new CompanyRequestDao();

export default companyRequestDao;
