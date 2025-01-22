// import dynamoose packages
import { Query, QueryResponse } from "dynamoose/dist/ItemRetriever";
import { ObjectType } from "dynamoose/dist/General";

// import daos
import BaseDao from "./Base.dao";

// import dtos
import {
  CorporateBulkJdResumesCreateDto,
  CorporateBulkJdResumeFilterOptions,
} from "../dtos/CorporateBulkJdResume.dto";
import { PaginatedResultsWithMatchingConditionsResponse } from "../dtos/Common.dto";

// import enums
import { SortOrderTypeEnum } from "../enums/Common.enum";

// import helpers
import { getPaginatedResultsWithMatchingConditions } from "../helpers/dynamoose.helper";

// import models
import { CorporateBulkJdResumeModel, DbCorporateBulkJdResumeDto } from "../db/models/CorporateBulkJdResume.model";

/**
 * CorporateBulkJdResumeDao
 *
 * Dao for handling corporate bulk jd resume related operations
 */
class CorporateBulkJdResumeDao implements BaseDao {
  modelName = "CorporateBulkJdResume";
  partitianKey = "BJDRM#JD#ID#{id}"; // `id` is the `corporateBulkJdId` in `CorporateBulkJd` model
  sortKeys = { SK_CORP_BULK_JD_RESUME_ID: "RSM#ID#{id}" }; // `id` is the `ulid id` and `RSM` is short code for `Resume`
  GSI1PK = "BJDRM#JD#RSM#";
  GSI1SK = "ID#{id}"; // `id` is the `ulid id`
  GSI2PK = "BJDRM#JD#RSM#COMP#ID#{companyId}";
  GSI2SK = "ID#{id}"; // `id` is the `ulid id`

  /**
   * createCorporateBulkJdResumesByBatchPut
   *
   * Creates multiple corporate bulk job description resumes by using
   * the `batchPut` method of the dynamoose model.
   *
   * This `batchPut` saves items to DynamoDB.
   * This method uses the `batchWriteItem` DynamoDB API call to store your objects
   * in the given table associated with the model.
   *
   * A single call to BatchWriteItem can transmit up to 16MB of data over the network, 
   * consisting of up to 25 item put or delete operations. 
   * While individual items can be up to 400 KB once stored.
   *
   * @see https://dynamoosejs.com/guide/Model#modelbatchputitems-settings-callback
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html#:~:text=The%20BatchWriteItem%20operation%20puts%20or,item%20put%20or%20delete%20operations.
   *
   * @param {CorporateBulkJdResumesCreateDto[]} corporateBulkJdResumesDto - An array of
   * CorporateBulkJdResumesCreateDto objects to be created in the database.
   *
   * @returns {Promise<{unprocessedItems: ObjectType[]}>} - A promise that resolves to an object
   * containing an array of unprocessed items that failed to be created in the database.
   */
  async createCorporateBulkJdResumesByBatchPut(
    corporateBulkJdResumesDto: CorporateBulkJdResumesCreateDto[]
  ): Promise<{
    unprocessedItems: ObjectType[];
  }> {
    // logger
    global.logger.info(`Create corporate bulk jd resume by batch put [DAO]`, {
      filePath: __filename,
      methodName: this.createCorporateBulkJdResumesByBatchPut.name,
    });

    // return the response
    return CorporateBulkJdResumeModel.batchPut(corporateBulkJdResumesDto);
  }

  /**
   * getCorporateBulkJdResumesByFilterOptions
   *
   * Retrieves corporate bulk job description resumes based on the provided filter options.
   *
   * @param {CorporateBulkJdResumeFilterOptions} filterOptions - The filtering criteria used to
   * query the corporate bulk JD resumes. This includes options such as status, corporate bulk JD ID,
   * sort order, date range, and search text.
   *
   * @returns {Promise<PaginatedResultsWithMatchingConditionsResponse<DbCorporateBulkJdResumeDto>>} -
   * A promise that resolves to a paginated response containing an array of corporate bulk JD resume
   * entries matching the filter criteria.
   */
  async getCorporateBulkJdResumesByFilterOptions(
    filterOptions: CorporateBulkJdResumeFilterOptions
  ): Promise<
    PaginatedResultsWithMatchingConditionsResponse<DbCorporateBulkJdResumeDto>
  > {
    global.logger.info(`Get corporate bulk jd resume by filter options [DAO]`, {
      filePath: __filename,
      methodName: this.getCorporateBulkJdResumesByFilterOptions.name,
    });

    // Initialize the query
    let query: Query<DbCorporateBulkJdResumeDto>;

    // If corporate bulk jd id is given
    if (filterOptions.corporateBulkJdId) {
      query = CorporateBulkJdResumeModel.query("PK")
        .eq(
          this.partitianKey.strtr({ "{id}": filterOptions.corporateBulkJdId })
        )
        .where("SK")
        .beginsWith(
          this.sortKeys.SK_CORP_BULK_JD_RESUME_ID.strtr({ "{id}": "" })
        );
    } else if (filterOptions.companyId) {
      // If company id is given
      query = CorporateBulkJdResumeModel.query("GSI2PK")
        .eq(
          this.GSI2PK.strtr({
            "{companyId}": filterOptions.companyId,
          })
        )
        .where("GSI2SK")
        .beginsWith(
          this.GSI1SK.strtr({
            "{id}": "",
          })
        );
    } else {
      query = CorporateBulkJdResumeModel.query("GSI1PK")
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

    // Apply status filter if provided
    if (filterOptions.status) {
      query = query.where("processingStatus").eq(filterOptions.status);
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
          .where("processingStatus")
          .contains(searchTextValue.toUpperCase())
          .or()
          .where("userFileName")
          .contains(searchTextValue);

        // Return the built condition
        return condition;
      });
    }

    // Execute the query by applying the pagination helper and return the results
    return getPaginatedResultsWithMatchingConditions<
      DbCorporateBulkJdResumeDto,
      CorporateBulkJdResumeFilterOptions
    >(query, filterOptions);
  }

  /**
   * getCorporateBulkJdResumeById
   *
   * Retrieves a corporate bulk job description resume by its unique identifier.
   *
   * @param {string} corporateBulkJdResumeById - The unique identifier of the corporate bulk job description resume.
   * @returns {Promise<QueryResponse<DbCorporateBulkJdResumeDto>>} - A promise that resolves to the job description resume details.
   */
  async getCorporateBulkJdResumeById(
    corporateBulkJdResumeById: string
  ): Promise<QueryResponse<DbCorporateBulkJdResumeDto>> {
    // logger
    global.logger.info(`Get Corporate Bulk Jd Resume By Id`, {
      filePath: __filename,
      methodName: this.getCorporateBulkJdResumeById.name,
    });

    return CorporateBulkJdResumeModel.query("GSI1PK")
      .eq(this.GSI1PK)
      .where("GSI1SK")
      .eq(
        this.GSI1SK.strtr({
          "{id}": corporateBulkJdResumeById,
        })
      )
      .exec();
  }
}

// create an instance of CorporateBulkJdResumeDao and export instance object & class
const corporateBulkJdResumeDaoObj = new CorporateBulkJdResumeDao();
export { corporateBulkJdResumeDaoObj, CorporateBulkJdResumeDao };
