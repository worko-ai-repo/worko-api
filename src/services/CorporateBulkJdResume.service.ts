// import dynamoose types
import { QueryResponse } from "dynamoose/dist/ItemRetriever";
import { ObjectType } from "dynamoose/dist/General";

// import daos
import { corporateBulkJdResumeDaoObj } from "../daos/CorporateBulkJdResume.dao";

// import dtos
import {
  CorporateBulkJdResumeFilterOptions,
  CorporateBulkJdResumeCreateResponseDto,
  CorporateBulkJdResumeCreateApiDto,
  CorporateBulkJdResumesCreateDto,
} from "../dtos/CorporateBulkJdResume.dto";
import { PaginatedResultsWithMatchingConditionsResponse } from "../dtos/Common.dto";
import { BulkCvsPreSignedUrlToUploadFileDto, PreSignedUrlToUploadFileResponseDto } from "../dtos/File.dto";

// import enums
import { CorporateBulkJdResumeProcessingStatusEnum } from "../enums/CorporateBulkJdResume.enum";

// import models
import { DbCorporateBulkJdResumeDto } from "../db/models/CorporateBulkJdResume.model";
import { DbCorporateBulkJdDto } from "../db/models/CorporateBulkJd.model";

// import services
import { corporateBulkJdServiceObj } from "./CorporateBulkJd.service";
import { fileServiceObj } from "./File.service";

// import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 * CorporateBulkJdResumeService
 *
 * Service for handling Corporate Bulk Job Description Resume related operations
 */
class CorporateBulkJdResumeService {
  /**
   * createCorporateBulkJdResumes
   *
   * This service is used to create a new Corporate Bulk Job Description Resumes and generate pre-signed urls to upload on AWS S3.
   *
   * @param {string} corporateBulkJdId - The id of the corporate bulk job description
   * @param {CorporateBulkJdResumeCreateApiDto} corporateBulkJdResumeDto - The Corporate Bulk Job Description Resume details
   * @param {string | undefined} [createdByUserId] - The id of the user who created the corporate bulk job description resume
   * @param {string | undefined} [createdByCorporateUserId] - The id of the corporate user who created the corporate bulk job description resume
   * @returns {Promise<CorporateBulkJdResumeCreateResponseDto>}
   */
  async createCorporateBulkJdResumes(
    corporateBulkJdId: string,
    corporateBulkJdResumeDto: CorporateBulkJdResumeCreateApiDto,
    createdByUserId?: string,
    createdByCorporateUserId?: string
  ): Promise<CorporateBulkJdResumeCreateResponseDto> {
    // logger
    global.logger.info(
      "Create Corporate Bulk Job Description Resumes And Generate Pre-signed Urls to upload on AWS S3. [Service]",
      {
        filePath: __filename,
        methodName: this.createCorporateBulkJdResumes.name,
        corporateBulkJdId: corporateBulkJdId,
      }
    );

    // Check whether the corporate bulk jd details exists or not
    const corporateBulkJdDetails: DbCorporateBulkJdDto =
      await corporateBulkJdServiceObj.getCorporateBulkJdById(corporateBulkJdId);

    // Update resume count in corporate bulk jd model
    await corporateBulkJdServiceObj.updateCorporateBulkJdByPkAndSk(
      corporateBulkJdDetails.PK,
      corporateBulkJdDetails.SK,
      {
        resumesCount:
          (corporateBulkJdDetails.resumesCount ?? 0) +
          corporateBulkJdResumeDto.bulkCvs.length,
      }
    );

    // Prepare Argument for Generating Bulk Cvs Pre-signed urls
    const psuToUploadBulkCvsParams: BulkCvsPreSignedUrlToUploadFileDto = {
      companyId: corporateBulkJdDetails.companyId,
      corporateBulkJdId: corporateBulkJdDetails.id,
      bulkCvs: corporateBulkJdResumeDto.bulkCvs,
    };

    // Generate Pre-Signed urls
    const psuToUploadBulkCvsDetails: PreSignedUrlToUploadFileResponseDto[] =
      await fileServiceObj.generatePsuToUploadBulkCvs(psuToUploadBulkCvsParams);

    // Prepare Argument For Storing the Cvs in Database
    const corporateBulkJdResumesArgument: CorporateBulkJdResumesCreateDto[] =
      psuToUploadBulkCvsDetails.map(
        // Iterate On each Psu To Upload BulkCv Detail and prepare the item to be stored in the database
        (
          eachPsuToUploadBulkCvDetail: PreSignedUrlToUploadFileResponseDto
        ): CorporateBulkJdResumesCreateDto => {
          /**
           * Extract the `id` from the cloud File Name which will be used in the keys of model
           * 
           * @todo: Extracting the `id` from the cloud File Name is not a appropriate way, 
           * we should have a better way to get the `id`
           */
          const resumeId: string = eachPsuToUploadBulkCvDetail.cloudFileName.split(".")[0];

          /**
           * Prepare Argument For Storing the Cvs in Database
           * 
           * NOTE: Preparing the dynamodb keys for the model in service folder should be done in dao folder only
           */
          const corporateBulkJdResumeArgument: CorporateBulkJdResumesCreateDto =
            {
              PK: corporateBulkJdResumeDaoObj.partitianKey.strtr({
                "{id}": corporateBulkJdDetails.id,
              }),
              SK: corporateBulkJdResumeDaoObj.sortKeys.SK_CORP_BULK_JD_RESUME_ID.strtr(
                {
                  "{id}": resumeId,
                }
              ),
              GSI1PK: corporateBulkJdResumeDaoObj.GSI1PK,
              GSI1SK: corporateBulkJdResumeDaoObj.GSI1SK.strtr({
                "{id}": resumeId,
              }),
              GSI2PK: corporateBulkJdResumeDaoObj.GSI2PK.strtr({
                "{companyId}": corporateBulkJdDetails.companyId,
              }),
              GSI2SK: corporateBulkJdResumeDaoObj.GSI2SK.strtr({
                "{id}": resumeId,
              }),
              id: resumeId,
              companyId: corporateBulkJdDetails.companyId,
              corporateBulkJdId: corporateBulkJdDetails.id,
              processingStatus:
                CorporateBulkJdResumeProcessingStatusEnum.PENDING,
              matchingScore: 0,
              userFileName: eachPsuToUploadBulkCvDetail.userFileName ?? "",
              cloudFileName: eachPsuToUploadBulkCvDetail.cloudFileName,
              createdByUserId: createdByUserId,
              createdByCorporateUserId: createdByCorporateUserId,
            };

          return corporateBulkJdResumeArgument;
        }
      );

    /**
     * Initialize chunk size
     *
     * The chunk size is initialized to 20, which is the maximum number of items that can be stored in a single call to batchPut.
     * In a single call to batchPut, up to 25 items can be put or deleted operations.
     */
    const corporateBulkJdResumeChunkSize: number = 20;

    // Chunk the data into groups of 20
    const corporateBulkJdResumeChunks: CorporateBulkJdResumesCreateDto[][] = [];

    // Iterate and create chunks using chunk size of 20
    for (
      let i = 0;
      i < corporateBulkJdResumesArgument.length;
      i += corporateBulkJdResumeChunkSize
    ) {
      /**
       * The slice() method returns selected elements in an array, as a new array.
       * The slice() method selects from a given start, up to a (not inclusive) given end.
       * The slice() method does not change the original array.
       */
      corporateBulkJdResumeChunks.push(
        corporateBulkJdResumesArgument.slice(
          i,
          i + corporateBulkJdResumeChunkSize
        )
      );
    }

    // Process each chunk
    const unprocessedItems: ObjectType[] = [];
    corporateBulkJdResumeChunks.forEach(
      async (
        eachCorporateBulkJdResumeChunk: CorporateBulkJdResumesCreateDto[]
      ) => {
        // Create Each Corporate Bulk Jd Resumes Chunk in Database
        const corporateBulkJdResumesCreateResponse: {
          unprocessedItems: ObjectType[];
        } =
          await corporateBulkJdResumeDaoObj.createCorporateBulkJdResumesByBatchPut(
            eachCorporateBulkJdResumeChunk
          );

        /**
         * If there are any unprocessed items, add them to the unprocessedItems array,
         * `unprocessedItems` means that the item that are failed to be stored in the database using batch put operation of dynamoose
         */
        if (corporateBulkJdResumesCreateResponse.unprocessedItems?.length) {
          unprocessedItems.push(
            ...corporateBulkJdResumesCreateResponse.unprocessedItems
          );
        }
      }
    );

    // prepare response
    const corporateBulkJdCvsResponseDto: CorporateBulkJdResumeCreateResponseDto =
      {
        corporateBulkJdId: corporateBulkJdDetails.id,
        bulkCvs: psuToUploadBulkCvsDetails,
        bulkCvsStorageFailed: unprocessedItems,
      };

    // return the response
    return corporateBulkJdCvsResponseDto;
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
    // logger
    global.logger.info(
      "Getting Corporate Bulk JD Resumes By Filter Options. [Service]",
      {
        filePath: __filename,
        methodName: this.getCorporateBulkJdResumesByFilterOptions.name,
      }
    );

    return corporateBulkJdResumeDaoObj.getCorporateBulkJdResumesByFilterOptions(
      filterOptions
    );
  }

  /**
   * getCorporateBulkJdResumeById
   *
   * Retrieves a corporate bulk job description resume by its unique identifier.
   *
   * @param {string} corporateBulkJdResumeId - The unique identifier of the corporate bulk job description resume.
   * @returns {Promise<DbCorporateBulkJdResumeDto>} - A promise that resolves to the corporate bulk job description resume details.
   * @throws {BaseError} If the corporate bulk job description resume is not found.
   */
  async getCorporateBulkJdResumeById(
    corporateBulkJdResumeId: string
  ): Promise<DbCorporateBulkJdResumeDto> {
    // logger
    global.logger.info(
      "Get Corporate Bulk Job Description Resume by id [Service]",
      {
        filePath: __filename,
        methodName: this.getCorporateBulkJdResumeById.name,
      }
    );

    // get corporate bulk jd
    const corporateBulkJdResumeDetails: QueryResponse<DbCorporateBulkJdResumeDto> =
      await corporateBulkJdResumeDaoObj.getCorporateBulkJdResumeById(
        corporateBulkJdResumeId
      );
    if (!corporateBulkJdResumeDetails.count) {
      throw new BaseError(
        `Corporate Bulk Job Description Resume Details Not found`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    return corporateBulkJdResumeDetails[0];
  }
}

// Create an instance of the CorporateBulkJdResumeService class and export it
const corporateBulkJdResumeServiceObj = new CorporateBulkJdResumeService();
export { corporateBulkJdResumeServiceObj, CorporateBulkJdResumeService };
