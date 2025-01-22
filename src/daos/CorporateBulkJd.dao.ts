// import dynamoose types
import { Query, QueryResponse } from "dynamoose/dist/ItemRetriever";

// import daos
import BaseDao from "./Base.dao";

// import dtos
import {
  CorporateBulkJdFilterOptions,
  CorporateBulkJdCreateDto,
  CorporateBulkJdUpdateDto,
} from "../dtos/CorporateBulkJd.dto";
import { PaginatedResultsWithMatchingConditionsResponse } from "../dtos/Common.dto";

// import enums
import { SortOrderTypeEnum } from "../enums/Common.enum";

// import helpers
import { getPaginatedResultsWithMatchingConditions } from "../helpers/dynamoose.helper";

// import models
import {
  CorporateBulkJdModel,
  DbCorporateBulkJdDto,
} from "../db/models/CorporateBulkJd.model";

// import services
import UlidService from "../services/Ulid.service";

/**
 * CorporateBulkJdDao
 *
 * Dao for handling corporate bulk jd related operations
 */
class CorporateBulkJdDao implements BaseDao {
  modelName = "CorporateBulkJd";
  partitianKey = "COMP#ID#{companyId}"; // Partition key format
  sortKeys = { SK_CORP_BULK_JD_ID: "BJDRM#JD#ID#{id}" }; // `BJDRM` is the short code for `Bulk Job Description Resume Matching`
  GSI1PK = "BJDRM#JD#";
  GSI1SK = "ID#{id}";

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
    // unique id of the entry
    let ulidId: string = UlidService.getUlidId();

    // logger
    global.logger.info("Creating Corporate Bulk Job Description. [DAO]", {
      filePath: __filename,
      methodName: this.createCorporateBulkJd.name,
      companyId: corporateBulkJdDto.companyId,
      ulidId: ulidId,
    });

    // construct the data to be saved in the database
    const corporateBulkJdDbDetails = {
      ...corporateBulkJdDto,
      PK: this.partitianKey.strtr({
        "{companyId}": corporateBulkJdDto.companyId,
      }),
      SK: this.sortKeys.SK_CORP_BULK_JD_ID.strtr({
        "{id}": ulidId,
      }),
      id: ulidId,
      GSI1PK: this.GSI1PK,
      GSI1SK: this.GSI1SK.strtr({
        "{id}": ulidId,
      }),
    };

    // save the data in the database
    return CorporateBulkJdModel.create(corporateBulkJdDbDetails);
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
   * @returns {Promise<PaginatedResultsWithMatchingConditionsResponse<DbCorporateBulkJdDto>>} -
   * A promise that resolves to a paginated response containing an array of corporate bulk JD
   * entries matching the filter criteria.
   */
  async getAllCorporateBulkJdByFilterOptions(
    filterOptions: CorporateBulkJdFilterOptions
  ): Promise<
    PaginatedResultsWithMatchingConditionsResponse<DbCorporateBulkJdDto>
  > {
    global.logger.info(`Get corporate bulk jd by filter options [DAO]`, {
      filePath: __filename,
      methodName: this.getAllCorporateBulkJdByFilterOptions.name,
    });

    // Initialize the query
    let query: Query<DbCorporateBulkJdDto>;

    // If the company Id is given, then use `PK` and `SK`, else use `GSIs`
    if (filterOptions.companyId) {
      query = CorporateBulkJdModel.query("PK")
        .eq(
          this.partitianKey.strtr({
            "{companyId}": filterOptions.companyId,
          })
        )
        .where("SK")
        .beginsWith(
          this.sortKeys.SK_CORP_BULK_JD_ID.strtr({
            "{id}": "",
          })
        );
    } else {
      query = CorporateBulkJdModel.query("GSI1PK")
        .eq(this.GSI1PK)
        .where("GSI1SK")
        .beginsWith(
          this.GSI1SK.strtr({
            "{id}": "",
          })
        );
    }

    // Sort the results based on the provided sort order
    query = query.sort(filterOptions.sortOrder as SortOrderTypeEnum);

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
          .where("jobTitle")
          .contains(searchTextValue.toLowerCase())
          .or()
          .where("jobDescription")
          .contains(searchTextValue)
          .or()
          .where("mustHaveSkills")
          .contains(searchTextValue)
          .or()
          .where("goodToHaveSkills")
          .contains(searchTextValue);

        // Return the built condition
        return condition;
      });
    }

    // Execute the query by applying the pagination helper and return the results
    return getPaginatedResultsWithMatchingConditions<
      DbCorporateBulkJdDto,
      CorporateBulkJdFilterOptions
    >(query, filterOptions);
  }

  /**
   * getCorporateBulkJdById
   *
   * Retrieves a corporate bulk job description by its unique identifier.
   *
   * @param {string} corporateBulkJdId - The unique identifier of the corporate bulk job description.
   * @returns {Promise<QueryResponse<DbCorporateBulkJdDto>>} - A promise that resolves to the job description details.
   */
  async getCorporateBulkJdById(
    corporateBulkJdId: string
  ): Promise<QueryResponse<DbCorporateBulkJdDto>> {
    // logger
    global.logger.info("Get Corporate Bulk Job Description by id [DAO]", {
      filePath: __filename,
      methodName: this.getCorporateBulkJdById.name,
      corporateBulkJdId: corporateBulkJdId,
    });

    // get corporate bulk jd by id and return the result
    return CorporateBulkJdModel.query("GSI1PK")
      .eq(this.GSI1PK)
      .where("GSI1SK")
      .eq(this.GSI1SK.strtr({ "{id}": corporateBulkJdId }))
      .exec();
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
    global.logger.info("Update Corporate Bulk Jd Details By PK and SK [DAO]", {
      filePath: __filename,
      methodName: this.updateCorporateBulkJdByPkAndSk.name,
    });

    // Update Corporate Bulk Jd Details and return
    return CorporateBulkJdModel.update(
      {
        PK: PK,
        SK: SK,
      },
      bulkJdUpdatedDetails
    );
  }
}

// create an instance of CorporateBulkJdDao and export instance object & class
const corporateBulkJdDaoObj = new CorporateBulkJdDao();
export { corporateBulkJdDaoObj, CorporateBulkJdDao };
