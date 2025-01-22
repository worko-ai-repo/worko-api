// Import dynamoose packages
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// import daos
import { corporateBulkJdDaoObj } from "../daos/CorporateBulkJd.dao";

// import dtos
import {
  CorporateBulkJdFilterOptions,
  CorporateBulkJdCreateDto,
  CorporateBulkJdUpdateDto,
} from "../dtos/CorporateBulkJd.dto";
import { PaginatedResultsWithMatchingConditionsInternalResponse, PaginatedResultsWithMatchingConditionsResponse } from "../dtos/Common.dto";

// import helpers
import { injectUserDetails } from "../helpers/userDetailsInjector.helper";

// import models
import { DbCorporateBulkJdDto } from "../db/models/CorporateBulkJd.model";
import { DbCorporateUserDto } from "../db/models/CorporateUser.model";
import { DbUserDetailDto } from "../db/models/UserDetail.model";

// import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 * CorporateBulkJdService
 *
 * Service for handling user Corporate Bulk Job Description related operations
 */
class CorporateBulkJdService {
  /**
   * createCorporateBulkJd
   *
   * Creates a new corporate bulk job description in the database.
   *
   * @param {CorporateBulkJdCreateDto} corporateBulkJdDto - The data transfer object containing the details
   * for creating a corporate bulk job description.
   * @returns {Promise<DbCorporateBulkJdDto>} - A promise that resolves to the created corporate bulk job
   * description database data transfer object.
   */
  async createCorporateBulkJd(
    corporateBulkJdDto: CorporateBulkJdCreateDto
  ): Promise<DbCorporateBulkJdDto> {
    // logger
    global.logger.info("Create Corporate Bulk Job Description [Service]", {
      filePath: __filename,
      methodName: this.createCorporateBulkJd.name,
      companyId: corporateBulkJdDto.companyId,
    });

    // corporate bulk jd details
    return corporateBulkJdDaoObj.createCorporateBulkJd(corporateBulkJdDto);
  }

  /**
   * getAllCorporateBulkJdByFilterOptions
   *
   * Retrieves corporate bulk job descriptions based on the provided filter options.
   *
   * @param {CorporateBulkJdFilterOptions} filterOptions - The filtering criteria used to
   * query the corporate bulk JD. This includes options such as status, corporate bulk JD ID,
   * sort order, date range, and search text.
   *
   * @returns {Promise<PaginatedResultsWithMatchingConditionsInternalResponse<DbCorporateBulkJdDto & { corporateUserDetails: DbCorporateUserDto | undefined; userDetails: DbUserDetailDto | undefined; }[]>>} -
   * A promise that resolves to a paginated response containing an array of corporate bulk JD
   * entries matching the filter criteria. The entries each include the corporate bulk JD details
   * plus the corporate user and user details if available.
   */
  async getAllCorporateBulkJdByFilterOptions(
    filterOptions: CorporateBulkJdFilterOptions
  ): Promise<
    PaginatedResultsWithMatchingConditionsInternalResponse<
      (DbCorporateBulkJdDto & {
        corporateUserDetails: DbCorporateUserDto | undefined;
        userDetails: DbUserDetailDto | undefined;
      })[]
    >
  > {
    // logger
    global.logger.info("Get all Corporate Bulk Job Description [Service]", {
      filePath: __filename,
      methodName: this.createCorporateBulkJd.name,
    });

    // Get all the bulk jd details with pagination
    const corporateBulkJdDetails: PaginatedResultsWithMatchingConditionsResponse<DbCorporateBulkJdDto> =
      await corporateBulkJdDaoObj.getAllCorporateBulkJdByFilterOptions(
        filterOptions
      );

    // destructure the bulk jd details
    const {
      lastKey,
      count,
      timesQueried,
      queriedCount,
      ...restCorporateBulkJdDetails
    } = corporateBulkJdDetails;

    // if the count is 0 then return empty array
    if (!count) {
      // return empty array with pagination details
      return {
        data: [],
        lastKey,
        queriedCount,
        timesQueried,
        count,
      };
    }

    // attach the userDetails with bulk jd details
    const corporateBulkJdWithUserDetails: (DbCorporateBulkJdDto & {
      corporateUserDetails: DbCorporateUserDto | undefined;
      userDetails: DbUserDetailDto | undefined;
    })[] = await injectUserDetails<DbCorporateBulkJdDto>(
      Object.values(restCorporateBulkJdDetails)
    );

    // prepare paginated response for bulk jd details with attached user details
    const paginatedCorporateBulkJdWithUserDetails: PaginatedResultsWithMatchingConditionsInternalResponse<
      (DbCorporateBulkJdDto & {
        corporateUserDetails: DbCorporateUserDto | undefined;
        userDetails: DbUserDetailDto | undefined;
      })[]
    > = {
      data: corporateBulkJdWithUserDetails,
      lastKey,
      queriedCount,
      timesQueried,
      count,
    };

    // return the paginated bulk jd with user details
    return paginatedCorporateBulkJdWithUserDetails;
  }

  /**
   * getCorporateBulkJdById
   *
   * Retrieves a corporate bulk job description by its unique identifier.
   *
   * @param {string} corporateBulkJdId - The unique identifier of the corporate bulk job description.
   * @returns {Promise<DbCorporateBulkJdDto>} - A promise that resolves to the job description details.
   * @throws {BaseError} If the corporate bulk job description details are not found.
   */
  async getCorporateBulkJdById(
    corporateBulkJdId: string
  ): Promise<DbCorporateBulkJdDto> {
    // logger
    global.logger.info("Get Corporate Bulk Job Description by id [Service]", {
      filePath: __filename,
      methodName: this.getCorporateBulkJdById.name,
      corporateBulkJdId: corporateBulkJdId,
    });

    // get corporate bulk jd and Throw error if the data not found
    const corporateBulkJdDetails: QueryResponse<DbCorporateBulkJdDto> =
      await corporateBulkJdDaoObj.getCorporateBulkJdById(corporateBulkJdId);
    if (!corporateBulkJdDetails.count) {
      throw new BaseError(
        `Corporate Bulk Job Description Details Not found.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    return corporateBulkJdDetails[0];
  }

  /**
   * updateCorporateBulkJdByPkAndSk
   *
   * Updates a corporate bulk job description by its primary key and sort key.
   *
   * @param {string} PK - The primary key of the corporate bulk job description.
   * @param {string} SK - The sort key of the corporate bulk job description.
   * @param {Partial<CorporateBulkJdUpdateDto>} bulkJdUpdatedDetails - The partial dto containing the updated details for the corporate bulk job description.
   * @returns {Promise<DbCorporateBulkJdDto>} - A promise that resolves to the updated corporate bulk job description from database.
   */
  async updateCorporateBulkJdByPkAndSk(
    PK: string,
    SK: string,
    bulkJdUpdatedDetails: Partial<CorporateBulkJdUpdateDto>
  ): Promise<DbCorporateBulkJdDto> {
    // logger
    global.logger.info(
      "Update Corporate Bulk JD Details by PK and SK [Service]",
      {
        filePath: __filename,
        methodName: this.updateCorporateBulkJdByPkAndSk.name,
      }
    );

    // Update Corporate Bulk Jd Details and return
    return corporateBulkJdDaoObj.updateCorporateBulkJdByPkAndSk(
      PK,
      SK,
      bulkJdUpdatedDetails
    );
  }
}

// Create an instance of the CorporateBulkJdService class and export it
const corporateBulkJdServiceObj = new CorporateBulkJdService();
export { corporateBulkJdServiceObj, CorporateBulkJdService };
