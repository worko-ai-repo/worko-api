// Import Base Express Params and Types
import { Request, Response, NextFunction } from "express";

// import ulidx types
import { uuidToULID } from "ulidx";

// import constants
import APP_CONSTANTS from "../configs/constants.config";

// Import DTOs
import {
  CorporateBulkJdResumeCreateApiDto,
  CorporateBulkJdResumeFilterOptions,
  CorporateBulkJdResumeFilterRequestDTO,
  CorporateBulkJdResumeCreateResponseDto,
} from "../dtos/CorporateBulkJdResume.dto";
import { PaginatedResultsWithMatchingConditionsResponse, RecordListingResponseDTO } from "../dtos/Common.dto";

// Import Helpers
import { RequestHelper } from "../helpers/request.helper";
import { paginationResponseHelperObj } from "../helpers/pagination-response.helper";

// import models
import { DbCorporateBulkJdResumeDto } from "../db/models/CorporateBulkJdResume.model";

// Import Services
import { corporateBulkJdResumeServiceObj } from "../services/CorporateBulkJdResume.service";

// Import Schemas
import {
  corporateBulkJdResumeCreateApiDTOValidation,
  corporateBulkJdResumeFilterDtoValidation,
} from "../schemas/CorporateBulkJdResume.schema";

// Import Utils
import { RequestValidationError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 * CorporateBulkJdResumeController
 *
 * Controller for handling Corporate Bulk Job Description Resume related operations
 */
class CorporateBulkJdResumeController {
  /**
   * getCorporateBulkJdResumesByFilterOptions
   *
   * This function is used to get Corporate Bulk Job Description Resumes by filter options
   *
   * @param {Request} req - The Request Object
   * @param {Response} res - The Response Object
   * @param {NextFunction} next - The Next Function
   */
  getCorporateBulkJdResumesByFilterOptions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Logger
      global.logger.info(
        "Processing request for Corporate Bulk Job Description Resume. [CONTROLLER]",
        {
          filePath: __filename,
          methodName: this.getCorporateBulkJdResumesByFilterOptions.name,
        }
      );

      // Parse filter options from the request query parameters
      const corporateBulkJdResumeRecordListingFilterRequest: CorporateBulkJdResumeFilterOptions =
        RequestHelper.parseFilterOptions<
          CorporateBulkJdResumeFilterRequestDTO,
          CorporateBulkJdResumeFilterOptions
        >(req.query as unknown as CorporateBulkJdResumeFilterRequestDTO);

      // Validate the request body using the Joi schema and throw a validation error if not valid
      const { error: reqBodyError, value: filterOptions } =
        corporateBulkJdResumeFilterDtoValidation.validate(
          corporateBulkJdResumeRecordListingFilterRequest,
          {
            abortEarly: false,
          }
        );
      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }

      // Fetch the corporate bulk job description resumes from the service
      const corporateBulkJdResumes: PaginatedResultsWithMatchingConditionsResponse<DbCorporateBulkJdResumeDto> =
        await corporateBulkJdResumeServiceObj.getCorporateBulkJdResumesByFilterOptions(
          filterOptions
        );

      // Extract the count, timesQueried,lastKey and other details from the response
      const {
        lastKey,
        count,
        timesQueried,
        queriedCount,
        ...corporateBulkJdResumeDetails
      } = corporateBulkJdResumes;

      // Generate the pagination response
      const corporateBulkJdResumeResponse: RecordListingResponseDTO<
        DbCorporateBulkJdResumeDto[]
      > = paginationResponseHelperObj.customizedPaginationRecordListingResponse<
        DbCorporateBulkJdResumeDto[],
        CorporateBulkJdResumeFilterOptions
      >(
        Object.values(corporateBulkJdResumeDetails) ?? [],
        corporateBulkJdResumeRecordListingFilterRequest,
        count,
        timesQueried,
        lastKey,
        queriedCount
      );

      // Send the fetched result as JSON response
      return res
        .status(HttpStatusCode.OK_200)
        .json(corporateBulkJdResumeResponse);
    } catch (error) {
      next(error);
    }
  };

  /**
   * getCorporateBulkJdResumeById
   *
   * This function is used to get Corporate Bulk Job Description by id
   *
   * @param {Request} req - The Request Object
   * @param {Response} res - The Response Object
   * @param {NextFunction} next - The Next Function
   */
  getCorporateBulkJdResumeById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info(`Get Corporate Bulk Jd By Id`, {
        filePath: __filename,
        methodName: this.getCorporateBulkJdResumeById.name,
      });

      // Extract the id from the request parameters
      const corporateBulkJdResumeId: string = req.params.id;

      // Fetch the corporate bulk job description from the service
      const corporateBulkJdResumeByIdDetails: DbCorporateBulkJdResumeDto =
        await corporateBulkJdResumeServiceObj.getCorporateBulkJdResumeById(
          corporateBulkJdResumeId
        );

      // Send the fetched result as JSON response
      return res
        .status(HttpStatusCode.OK_200)
        .json(corporateBulkJdResumeByIdDetails);
    } catch (error) {
      next(error);
    }
  };

  /**
   * createCorporateBulkJdResumes
   *
   * This function is used to create Corporate Bulk Job Description Resumes by `corporate bulk jd id` and generate pre-signed urls to upload bulk cvs on S3
   *
   * @param {Request} req - The Request Object
   * @param {Response} res - The Response Object
   * @param {NextFunction} next - The Next Function
   */
  createCorporateBulkJdResumes = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info(
        "Processing request for Corporate Bulk Job Description Resumes by Corporate Bulk JD ID And Generate Pre-signed URLs To Upload Bulk CVs On S3. [CONTROLLER]",
        {
          filePath: __filename,
          methodName: this.createCorporateBulkJdResumes.name,
          requestParams: req.params,
        }
      );

      // Get the Corporate Bulk JD ID
      const corporateBulkJdId: string = req.params.id;

      // Retrieve the Request Body and validate the corporate bulk jd data from request body and throw error if not valid
      const requestBody: CorporateBulkJdResumeCreateApiDto = req.body;
      const { error: reqBodyError } =
        corporateBulkJdResumeCreateApiDTOValidation.validate(requestBody, {
          abortEarly: false,
        });
      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }

      // Extract the cognito User Id and cognito User Groups from the request context
      const cognitoUserId: string = global.requestLocalContext.userId;
      const cognitoUserGroups: string[] =
        global.requestLocalContext.cognitoUserGroups;

      let createdByUserId: string | undefined;
      let createdByCorporateUserId: string | undefined;

      // If the user is a corporate user then set the `createdByCorporateUserId` else set the `createdByUserId`
      if (
        cognitoUserGroups.includes(
          APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.CORPORATE_ADMIN
        ) ||
        cognitoUserGroups.includes(
          APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.CORPORATE_RECRUITER
        )
      ) {
        createdByCorporateUserId = uuidToULID(cognitoUserId);
        global.logger.info(`User is a corporate recruiter/admin [controller]`, {
          filePath: __filename,
          methodName: this.createCorporateBulkJdResumes.name,
          createdByCorporateUserId,
        });
      } else {
        createdByUserId = cognitoUserId;
        global.logger.info(`User is a worko admin [controller]`, {
          filePath: __filename,
          methodName: this.createCorporateBulkJdResumes.name,
          createdByUserId,
        });
      }

      // Create Resumes in database
      const corporateBulkJdResumesDetails: CorporateBulkJdResumeCreateResponseDto =
        await corporateBulkJdResumeServiceObj.createCorporateBulkJdResumes(
          corporateBulkJdId,
          requestBody,
          createdByUserId,
          createdByCorporateUserId
        );

      // return the response
      return res
        .status(HttpStatusCode.CREATED_201)
        .json(corporateBulkJdResumesDetails);
    } catch (error) {
      next(error);
    }
  };
}

// Export Default Controller
export default CorporateBulkJdResumeController;
