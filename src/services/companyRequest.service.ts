// import dynamoose packages
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// import daos
import companyRequestDao from "../daos/CompanyRequest.dao";

// import dtos
import { UpdateCompanyRequestDto } from "../dtos/CompanyRequest.dto";

// import models
import { DbCompanyRequestDto } from "../db/models/CompanyRequest.model";

// import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 * CompanyRequestService
 */
class CompanyRequestService {
  /**
   * getCompanyRequestByCompanyId
   *
   * Retrieves the details of a company request for the specified company ID.
   *
   * @param {string} companyId - The ID of the company for which the request details are to be retrieved.
   * @returns {Promise<QueryResponse<DbCompanyRequestDto>>} A promise that resolves with the company request details.
   */
  async getCompanyRequestByCompanyId(
    companyId: string
  ): Promise<QueryResponse<DbCompanyRequestDto>> {
    // Log the request
    global.logger.info("Get Company Request By Company Id [Service]", {
      filePath: __filename,
      methodName: this.getCompanyRequestByCompanyId.name,
      companyId: companyId,
    });

    // Get the company request details for the provided company ID
    return companyRequestDao.getCompanyRequestByCompanyId(companyId);
  }

  /**
   * updateCompanyRequestByCompanyId
   *
   * Updates the company request details for the specified company ID using the provided update DTO.
   *
   * @param {string} companyId - The ID of the company for which the request is to be updated.
   * @param {Partial<UpdateCompanyRequestDto>} updateCompanyRequestDto - The DTO containing the updated details for the company request.
   * @returns {Promise<DbCompanyRequestDto>} A promise that resolves with the updated company request details.
   */
  async updateCompanyRequestByCompanyId(
    companyId: string,
    updateCompanyRequestDto: Partial<UpdateCompanyRequestDto>
  ): Promise<DbCompanyRequestDto> {
    global.logger.info("Update Company Request By Company Id [Service]", {
      filePath: __filename,
      methodName: this.updateCompanyRequestByCompanyId.name,
      companyId: companyId,
    });

    // Get the company request details for the provided company ID and throw an error if it doesn't exist
    const companyRequestDetailResponse: QueryResponse<DbCompanyRequestDto> =
      await companyRequestDao.getCompanyRequestByCompanyId(companyId);
    if (!companyRequestDetailResponse.count) {
      throw new BaseError(
        "The Company Request is Not Found.",
        HttpStatusCode.NOT_FOUND_404
      );
    }

    // Retrieve the company request details
    const companyRequestDetails: DbCompanyRequestDto =
      companyRequestDetailResponse[0];

    // Update the company request
    return companyRequestDao.updateCompanyRequestByPkAndSk(
      companyRequestDetails.PK,
      companyRequestDetails.SK,
      updateCompanyRequestDto
    );
  }

  /**
   * deleteCompanyRequest
   *
   * Deletes a company request from the database
   *
   * @param {DbCompanyRequestDto} companyRequestDetails - The company request details to be deleted.
   * @returns {Promise<void>} A promise that resolves when the company request is deleted.
   */
  async deleteCompanyRequest(
    companyRequestDetails: DbCompanyRequestDto
  ): Promise<void> {
    // Log the request
    global.logger.info("Delete Company Request [Service]", {
      filePath: __filename,
      methodName: this.deleteCompanyRequest.name,
      PK: companyRequestDetails.PK,
      SK: companyRequestDetails.SK,
    });

    // Delete the company request
    return companyRequestDao.deleteCompanyRequest(companyRequestDetails);
  }

  /**
   * softDeleteCompanyRequestByPkAndSk
   *
   * Soft deletes a company request by updating the `isDeleted` field to true based on 
   * the provided primary key and sort key.
   *
   * @param {string} PK - The primary key of the company request to be soft deleted.
   * @param {string} SK - The sort key of the company request to be soft deleted.
   * @param {Partial<UpdateCompanyRequestDto>} updateCompanyRequestDetails - The partial DTO containing the updated details for the company request.
   * @returns {Promise<DbCompanyRequestDto>} A promise that resolves with the updated company request details.
   */
  async softDeleteCompanyRequestByPkAndSk(
    PK: string,
    SK: string,
    updateCompanyRequestDetails: Partial<UpdateCompanyRequestDto>
  ): Promise<DbCompanyRequestDto> {
    global.logger.info("Soft Delete Company Request [Service]", {
      filePath: __filename,
      methodName: this.softDeleteCompanyRequestByPkAndSk.name,
      PK: PK,
      SK: SK,
    });

    return companyRequestDao.updateCompanyRequestByPkAndSk(
      PK,
      SK,
      updateCompanyRequestDetails
    );
  }
}

// Create an instance of the CompanyRequestService
const companyRequestServiceObj = new CompanyRequestService();

// Export the CompanyRequestService instance and class
export {
   companyRequestServiceObj,
   CompanyRequestService
};