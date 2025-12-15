// Import Base Express Params and Types
import { Request, Response, NextFunction } from "express";

// Import ulidx
import { uuidToULID } from "ulidx";

// import constants
import APP_CONSTANTS from "../configs/constants.config";

// Import DTOs
import {
  CorporateBulkJdCreateApiDto,
  CorporateBulkJdFilterOptions,
  CorporateBulkJdFilterRequestDTO,
  CorporateBulkJdCreateDto,
} from "../dtos/CorporateBulkJd.dto";
import { PaginatedResultsWithMatchingConditionsInternalResponse, RecordListingResponseDTO } from "../dtos/Common.dto";

// import helpers
import { RequestHelper } from "../helpers/request.helper";
import { paginationResponseHelperObj } from "../helpers/pagination-response.helper";

// import models
import { DbCorporateBulkJdDto } from "../db/models/CorporateBulkJd.model";
import { DbCorporateUserDto } from "../db/models/CorporateUser.model";
import { DbUserDetailDto } from "../db/models/UserDetail.model";

// Import Services
import { corporateBulkJdServiceObj } from "../services/CorporateBulkJd.service";

// Import Schemas
import { corporateBulkJdDTOValidation, corporateBulkJdFilterDtoValidation } from "../schemas/CorporateBulkJd.schema";

// Import Utils
import { BaseError, RequestValidationError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 * CorporateBulkJdController
 *
 * Controller for handling Corporate Bulk Job Description related operations
 */
class CorporateBulkJdController {
  /**
   * createCorporateBulkJd
   *
   * This function is used to create a new Corporate Bulk Job Description
   * and generate pre-signed urls for bulk cvs 
   *
   * @param {Request} req - The Request Object
   * @param {Response} res - The Response Object
   * @param {NextFunction} next - The Next Function
   */
  createCorporateBulkJd = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Logger
      global.logger.info(
        "Processing request for Creating Corporate Bulk Job Description. [CONTROLLER]",
        {
          filePath: __filename,
          methodName: this.createCorporateBulkJd.name,
          companyId: req.body.companyId
        }
      );

      // Retrieve the Request Body and validate the corporate bulk jd data from request body and throw error if not valid
      const requestBody: CorporateBulkJdCreateApiDto = req.body;
      const { error: reqBodyError, value: validatedRequestBody } = corporateBulkJdDTOValidation.validate(
        requestBody,
        {
          abortEarly: false,
        }
      );
      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }

      // Extract the cognito User Id and cognito User Groups from the request context
      const cognitoUserId: string = global.requestLocalContext.userId;
      const cognitoUserGroups: string[] = global.requestLocalContext.cognitoUserGroups;

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
          methodName: this.createCorporateBulkJd.name,
          createdByCorporateUserId,
        });
      } else {
        if(cognitoUserGroups.includes(APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.ADMIN)){
          createdByUserId = cognitoUserId;
          global.logger.info(`User is a worko admin [controller]`, {
            filePath: __filename,
            methodName: this.createCorporateBulkJd.name,
            createdByUserId,
          });
        } else {
          global.logger.error(`User is not a corporate recruiter/admin or worko-admin [controller]`, {
            cognitoUserGroups,
            actionBy: cognitoUserId
          })
          throw new BaseError(
            "You are not allowed to perform this action.",
            HttpStatusCode.FORBIDDEN_403
          )
        }
      }

      // Create the Corporate Bulk Job Description Internal Dto
      const corporateBulkJdCreateDto: CorporateBulkJdCreateDto = {
        ...validatedRequestBody,
        createdByUserId: createdByUserId,
        createdByCorporateUserId: createdByCorporateUserId,
      };

      // Send to the Service
      const corporateBulkJdDetails: DbCorporateBulkJdDto =
        await corporateBulkJdServiceObj.createCorporateBulkJd(
          corporateBulkJdCreateDto
        );

      // return the Response
      return res
        .status(HttpStatusCode.CREATED_201)
        .json(corporateBulkJdDetails);
    } catch (error) {
      next(error);
    }
  };

  /**
   * getAllCorporateBulkJdByFilterOptions
   *
   * This function is used to get all Corporate Bulk Job Description
   *
   * @param {Request} req - The Request Object
   * @param {Response} res - The Response Object
   * @param {NextFunction} next - The Next Function
   */
  getAllCorporateBulkJdByFilterOptions = async (req:Request, res:Response, next:NextFunction) => {
    try {
      global.logger.info(`Get all Corporate Bulk Jd By Filter Options`, {
        filePath: __filename,
        methodName: this.getAllCorporateBulkJdByFilterOptions.name,
      });

      // Parse filter options from the request query parameters
      const corporateBulkJdRecordListingFilterRequest: CorporateBulkJdFilterOptions =
        RequestHelper.parseFilterOptions<
          CorporateBulkJdFilterRequestDTO,
          CorporateBulkJdFilterOptions
        >(req.query as unknown as CorporateBulkJdFilterRequestDTO);

      // Validate the request body using the Joi schema and throw a validation error if not valid
      const { error: reqBodyError, value: filterOptions } =
        corporateBulkJdFilterDtoValidation.validate(
          corporateBulkJdRecordListingFilterRequest,
          {
            abortEarly: false,
          }
        );
      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }

      // Fetch the corporate bulk job description s from the service
      const corporateBulkJds: PaginatedResultsWithMatchingConditionsInternalResponse<
        (DbCorporateBulkJdDto & {
          corporateUserDetails: DbCorporateUserDto | undefined;
          userDetails: DbUserDetailDto | undefined;
        })[]
      > = await corporateBulkJdServiceObj.getAllCorporateBulkJdByFilterOptions(
        filterOptions
      );

      // Extract the count, timesQueried,lastKey and other details from the response
      const {
        lastKey,
        count,
        timesQueried,
        queriedCount,
        data
      } = corporateBulkJds;

      // Generate the pagination response
      const corporateBulkJdResponse: RecordListingResponseDTO<
        (DbCorporateBulkJdDto & {
          corporateUserDetails: DbCorporateUserDto | undefined;
          userDetails: DbUserDetailDto | undefined;
        })[]
      > = paginationResponseHelperObj.customizedPaginationRecordListingResponse<
        (DbCorporateBulkJdDto & {
          corporateUserDetails: DbCorporateUserDto | undefined;
          userDetails: DbUserDetailDto | undefined;
        })[],
        CorporateBulkJdFilterOptions
      >(
        data,
        corporateBulkJdRecordListingFilterRequest,
        count,
        timesQueried,
        lastKey,
        queriedCount
      );

      // Send the fetched result as JSON response
      return res
        .status(HttpStatusCode.OK_200)
        .json(corporateBulkJdResponse);
    } catch (error) {
      next(error)
    }
  }

  /**
   * getCorporateBulkJdById
   *
   * This function is used to get Corporate Bulk Job Description by id
   *
   * @param {Request} req - The Request Object
   * @param {Response} res - The Response Object
   * @param {NextFunction} next - The Next Function
   */
  getCorporateBulkJdById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      global.logger.info(`Get Corporate Bulk Jd By Id`, {
        filePath: __filename,
        methodName: this.getCorporateBulkJdById.name,
      });

      // Extract the id from the request parameters
      const corporateBulkJdId: string = req.params.id;

      // Fetch the corporate bulk job description from the service
      const corporateBulkJdByIdDetails: DbCorporateBulkJdDto = await corporateBulkJdServiceObj.getCorporateBulkJdById(
        corporateBulkJdId
      )

      // Send the fetched result as JSON response
      return res.status(HttpStatusCode.OK_200).json(corporateBulkJdByIdDetails)
    } catch (error) {
      next(error)
    }
  }
}

// Export Default Controller
export default CorporateBulkJdController;
