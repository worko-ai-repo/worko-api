// Import Base Express Params and Types
import { Request, Response, NextFunction } from "express";

// Import dynamoose
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import ulidx
import { uuidToULID } from "ulidx";

// import constants
import APP_CONSTANTS from "../configs/constants.config";

// Import DTOs
import {
  CorporateUserCreateApiDto,
  CorporateUserCreateDto,
  CorporateUserLisitngFilterOptions,
  CorporateUserLisitngFilterOptionsDTO,
  CorporateUserUpdateApiDto,
} from "../dtos/CorporateUser.dto";
import { PaginatedResultsWithMatchingConditionsInternalResponse, RecordListingResponseDTO } from "../dtos/Common.dto";

// Import Helpers
import { RequestHelper } from "../helpers/request.helper";
import { paginationResponseHelperObj } from "../helpers/pagination-response.helper";

// import models
import { DbCorporateUserDto } from "../db/models/CorporateUser.model";
import { DbCompanyDetailDto } from "../db/models/CompanyDetail.model";

// Import Services
import { corporateUserServiceObj } from "../services/CorporateUser.service";

// Import Schemas
import {
  CorporateUserCreateApiDtoValidation,
  CorporateUserListingFilterOptionValidation,
  CorporateUserUpdateApiDtoValidation,
} from "../schemas/CorporateUser.schema";

// Import Utils
import { BaseError, RequestValidationError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 * CorporateUserController
 *
 * Controller for handling Corporate User related operations
 */
class CorporateUserController {
  /**
   * createCorpUser
   *
   * Register a new Corporate User
   *
   * A corporate recruiter/admin will register
   *
   * @param {Request} req - The Request Object
   * @param {Response} res - The Response Object
   * @param {NextFunction} next - The Next Function
   */
  createCorpUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Logger
      global.logger.info(
        "Processing request to create Corporate User. [CONTROLLER]",
        {
          filePath: __filename,
          methodName: this.createCorpUser.name,
        }
      );

      // Get the Request Body
      const requestBody: CorporateUserCreateApiDto = req.body;

      // Validate the Request and Throw an Error if Invalid
      const { error, value: createCorpUserApiDto } =
        CorporateUserCreateApiDtoValidation.validate(requestBody, {
          abortEarly: false,
        });
      if (error) {
        throw new RequestValidationError(error);
      }

      // Prepare the Resposnse Body / Backend Dto
      const createCorpUserDto: CorporateUserCreateDto = {
        ...createCorpUserApiDto,
        isDeleted: false,
      };

      // Send to the Service
      const corporateUserDetails: DbCorporateUserDto =
        await corporateUserServiceObj.createCorpUser(createCorpUserDto);

      // Prepare the Response
      return res.status(HttpStatusCode.CREATED_201).json(corporateUserDetails);
    } catch (error) {
      next(error);
    }
  };

  /**
   * updateCorpUserById
   *
   * Update a Corporate User using the ID of the User
   *
   * @param {Request} req - The Request Object
   * @param {Response} res - The Response Object
   * @param {NextFunction} next - The Next Function
   */
  updateCorpUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Logger
      global.logger.info(
        "Processing request to update Corporate User. [CONTROLLER]",
        {
          filePath: __filename,
          methodName: this.updateCorpUserById.name,
        }
      );

      // Get the User Id of DDB from the Request Params
      const { id } = req.params;

      // Get the Request Body
      const requestBody: CorporateUserUpdateApiDto = req.body;

      // Validate the Request and Throw an Error if Invalid
      const { error, value: corporateUserUpdateApiDto } =
        CorporateUserUpdateApiDtoValidation.validate(requestBody, {
          abortEarly: false,
        });
      if (error) {
        throw new RequestValidationError(error);
      }

      // Send to the Service
      const corporateUserDetails: DbCorporateUserDto =
        await corporateUserServiceObj.updateCorpUserById(
          corporateUserUpdateApiDto,
          id
        );

      // Prepare the Response
      return res.status(HttpStatusCode.OK_200).json(corporateUserDetails);
    } catch (error) {
      next(error);
    }
  };

  /**
   * deleteCorpUserById
   *
   * Delete a Corporate User using the Id of the User
   *
   * @param {Request} req - The Request Object
   * @param {Response} res - The Response Object
   * @param {NextFunction} next - The Next Function
   */
  deleteCorpUserById = async (req: Request, res: Response, next: NextFunction) => {
    // Logger
    global.logger.info(
      "Processing request to update Corporate User. [CONTROLLER]",
      {
        filePath: __filename,
        methodName: this.deleteCorpUserById.name,
      }
    );
    try {
      // Get the User Id of DDB from the Request Params for the user whose details are to be deleted
      const { id } = req.params;

      // Extract the cognitoUserId and cognitoUserGroups
      const cognitoUserId: string = global.requestLocalContext.userId;
      const cognitoUserGroups: string[] = global.requestLocalContext.cognitoUserGroups;

      let deletedByUserId: string | undefined;
      let deletedByCorporateUserId: string | undefined;

      // If the user is a corporate user then set the `updatedByCorporateUserId` else set the `updatedByUserId`
      if (
        cognitoUserGroups.includes(
          APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.CORPORATE_ADMIN
        ) ||
        cognitoUserGroups.includes(
          APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.CORPORATE_RECRUITER
        )
      ) {
        deletedByCorporateUserId = uuidToULID(cognitoUserId);
        global.logger.info(
          `User is a corporate recruiter/admin with ID: ${deletedByCorporateUserId}. [controller]`
        );
      } else {
        deletedByUserId = cognitoUserId;
        global.logger.info(
          `User is a worko admin with ID: ${deletedByUserId}. [controller]`
        );
      }

      // Send to the Service
      await corporateUserServiceObj.deleteCorpUserById(id, deletedByUserId, deletedByCorporateUserId);

      // Prepare the Response
      return res.status(HttpStatusCode.NO_CONTENT_204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * getAllCorpUsers
   *
   * Get all Corporate Users
   *
   * @param {Request} req - The Request Object
   * @param {Response} res - The Response Object
   * @param {NextFunction} next - The Next Function
   */
  getAllCorpUsers = async (req: Request, res: Response, next: NextFunction) => {
    // Logger
    global.logger.info(
      "Processing request to get all Corporate Users. [CONTROLLER]",
      {
        filePath: __filename,
        methodName: this.getAllCorpUsers.name,
      }
    );
    try {
      // Parse the query params using the RequestHelper
      const corpUserListingFilterRequest: CorporateUserLisitngFilterOptions =
        RequestHelper.parseFilterOptions<
          CorporateUserLisitngFilterOptionsDTO,
          CorporateUserLisitngFilterOptions
        >(req.query as unknown as CorporateUserLisitngFilterOptionsDTO);

      // Validate the request and throw an error if invalid
      let { error, value: filterOptions } =
        CorporateUserListingFilterOptionValidation.validate(
          corpUserListingFilterRequest,
          { abortEarly: false }
        );
      if (error) {
        throw new RequestValidationError(error);
      }

      // Call the service to fetch all jobs [Service Call]
      const corporateUserList: PaginatedResultsWithMatchingConditionsInternalResponse<
        (DbCorporateUserDto & {
          companyDetails: DbCompanyDetailDto | undefined;
        })[]
      > = await corporateUserServiceObj.getAllCorpUsersWithCompanyDetails(
        filterOptions
      );

      // Extract the count, timesQueried,lastKey and other details from the response
      const { lastKey, count, timesQueried, queriedCount, data:corporateUsersData } =
        corporateUserList;

      // Generate the pagination response
      const companyJobResponse: RecordListingResponseDTO<
        (DbCorporateUserDto & {
          companyDetails: DbCompanyDetailDto | undefined;
        })[]
      > = paginationResponseHelperObj.customizedPaginationRecordListingResponse<
        (DbCorporateUserDto & {
          companyDetails: DbCompanyDetailDto | undefined;
        })[],
        CorporateUserLisitngFilterOptions
      >(
        corporateUsersData,
        corpUserListingFilterRequest,
        count,
        timesQueried,
        lastKey,
        queriedCount
      );

      // Prepare the Response
      return res.status(HttpStatusCode.OK_200).json(companyJobResponse);
    } catch (error) {
      next(error);
    }
  };

  /**
   * getCorpUserById
   *
   * Get a Corporate User by the ID of the User
   *
   * @param {Request} req - The Request Object
   * @param {Response} res - The Response Object
   * @param {NextFunction} next - The Next Function
   */
  getCorpUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Logger
      global.logger.info(
        "Processing request to get Corporate User by ID. [CONTROLLER]",
        {
          filePath: __filename,
          methodName: this.getCorpUserById.name,
        }
      );
      
      // Get the User Id of DDB from the Request Params
      const { id } = req.params;

      // Send to the Service
      const corporateUserDetails: QueryResponse<DbCorporateUserDto> = await corporateUserServiceObj.getCorpUserById(id);

      // Prepare the Response
      return res.status(HttpStatusCode.OK_200).json(corporateUserDetails);
    } catch (error) {
      next(error);
    }
  };

  /**
   * getCorpUserByCognitoId
   *
   * Get a Corporate User by the ID of the User
   *
   * @param {Request} req - The Request Object
   * @param {Response} res - The Response Object
   * @param {NextFunction} next - The Next Function
   */
  getCorpUserByCognitoId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Logger
      global.logger.info(
        "Processing request to get Corporate User by ID. [CONTROLLER]",
        {
          filePath: __filename,
          methodName: this.getCorpUserById.name,
        }
      );

      // Get the User Id of DDB from the Request Params
      const { id } = req.params;

      // Convert the CognitoId into ULID
      const userId = uuidToULID(id);

      // Send to the Service
      const corporateUserDetails: QueryResponse<DbCorporateUserDto> =
        await corporateUserServiceObj.getCorpUserById(userId);

      // Prepare the Response
      return res.status(HttpStatusCode.OK_200).json(corporateUserDetails);
    } catch (error) {
      next(error);
    }
  };
}

// Export Default Controller
export default CorporateUserController;
