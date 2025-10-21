
import { Request, Response, NextFunction } from "express";

// Import dtos
import { UserGuidanceRequestCreateApiDTO, UserGuidanceRequestFilterOptions, UserGuidanceRequestFilterRequestDTO, UserGuidanceRequestUpdateByCandidateApiDto, UserGuidanceRequestUpdateByMentorApiDto, UserGuidanceRequestUpdateByWorkoAdminApiDto } from "../dtos/UserGuidanceRequest.dto";
import { PaginatedResultsWithMatchingConditionsInternalResponse, RecordListingResponseDTO } from "../dtos/Common.dto";

// Import enums
import { UserType } from "../enums/User.enum";
import { UserGuidanceRequestUpdateActionResourceKeyEnum } from "../enums/UserGuidanceRequest.enum";

// Import helpers
import { RequestHelper } from "../helpers/request.helper";
import { paginationResponseHelperObj } from "../helpers/pagination-response.helper";

// Import models
import { DbUserDetailDto } from "../db/models/UserDetail.model";
import { DbUserGuidanceRequestDto } from "../db/models/UserGuidanceRequest.model";

// Import services
import UserService from "../services/User.service";
import { userGuidanceRequestServiceObj } from "../services/UserGuidanceRequest.service";

// Import schemas
import { userGuidanceRequestCreateApiDTOValidation, userGuidanceRequestFilterDtoValidation, userGuidanceRequestUpdateByCandidateApiDtoValidation, userGuidanceRequestUpdateByMentorApiDtoValidation, userGuidanceRequestUpdateByWorkoAdminApiDtoValidation } from "../schemas/UserGuidanceRequest.schema";

// Import utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError, RequestValidationError } from "../utils/errors.util";

class UserGuidanceRequestController {
  /**
   * createUserGuidanceRequest
   *
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @param {NextFunction} next - Express next function for error handling.
   * @throws {RequestValidationError} If the input data fails validation.
   * @throws {BaseError} Any other errors that occur during the process.
   */
  createUserGuidanceRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // logger
      global.logger.info(`Create User Guidance Request [controller]`, {
        filePath: __filename,
        methodName: this.createUserGuidanceRequest.name,
      });

      // Extract the userId from the response locals
      const cognitoUserId: string = global.requestLocalContext.userId;

      // Parse the user details
      const userDetails: DbUserDetailDto = await UserService.getUserDetailsById(
        cognitoUserId
      );

      // If the user is not a candidate, throw an error
      if (!userDetails.userType.includes(UserType.CAND)) {
        throw new BaseError(
          "Only candidates are authorized to create guidance requests",
          HttpStatusCode.FORBIDDEN_403
        );
      }

      // Extract and validate the data from request body and throw error if not valid
      const reqBody: UserGuidanceRequestCreateApiDTO = req.body;
      const { error: reqBodyError, value: validatedRequestBody } =
        userGuidanceRequestCreateApiDTOValidation.validate(reqBody, {
          abortEarly: false,
        });
      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }

      // Create user guidance request
      const userGuidanceRequestDetails: DbUserGuidanceRequestDto =
        await userGuidanceRequestServiceObj.createUserGuidanceRequest(
          cognitoUserId,
          userDetails.PK.split("#")[2],
          userDetails.name,
          userDetails.number,
          validatedRequestBody
        );

      return res
        .status(HttpStatusCode.CREATED_201)
        .json(userGuidanceRequestDetails);
    } catch (error) {
      next(error);
    }
  };

  getAllUserGuidanceRequestByFilterOptions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info("Get user guidance request [controller]", {
        filePath: __filename,
        methodName: this.getAllUserGuidanceRequestByFilterOptions.name,
      });

      // Parse filter options from the request query parameters
      const userGuidanceRequest: UserGuidanceRequestFilterOptions =
        RequestHelper.parseFilterOptions<
          UserGuidanceRequestFilterRequestDTO,
          UserGuidanceRequestFilterOptions
        >(req.query as unknown as UserGuidanceRequestFilterRequestDTO);

      // Validate the request using the Joi schema
      const { error, value: userGuidanceRequestBody } =
        userGuidanceRequestFilterDtoValidation.validate(userGuidanceRequest, {
          abortEarly: false,
        });

      if (error) {
        throw new RequestValidationError(error);
      }

      // Get guidance requests using the service
      const guidanceRequestDetails: PaginatedResultsWithMatchingConditionsInternalResponse<
        (DbUserGuidanceRequestDto & {
          userDetails?: DbUserDetailDto;
          employeeDetails?: DbUserDetailDto;
        })[]
      > =
        await userGuidanceRequestServiceObj.getAllUserGuidanceRequestByFilterOptions(
          userGuidanceRequestBody
        );

      // Extract the response data
      const { lastKey, count, timesQueried, queriedCount, data } =
        guidanceRequestDetails;

      // Generate the pagination response
      const guidanceRequestResponse: RecordListingResponseDTO<
        (DbUserGuidanceRequestDto & {
          userDetails?: DbUserDetailDto;
          employeeDetails?: DbUserDetailDto;
        })[]
      > = paginationResponseHelperObj.customizedPaginationRecordListingResponse<
        (DbUserGuidanceRequestDto & {
          userDetails?: DbUserDetailDto;
          employeeDetails?: DbUserDetailDto;
        })[],
        UserGuidanceRequestFilterOptions
      >(data, userGuidanceRequest, count, timesQueried, lastKey, queriedCount);

      res.status(HttpStatusCode.OK_200).json(guidanceRequestResponse);
    } catch (error) {
      // Pass the error to the next error handler
      next(error);
    }
  };

  updateUserGuidanceRequestByWorkoAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userGuidanceRequestId: string = req.params["id"];
      global.logger.info(
        "Update user guidance request by worko admin [controller]",
        {
          userGuidanceRequestId,
          methodName: this.updateUserGuidanceRequestByWorkoAdmin.name,
        }
      );

      const cognitoUserId: string = global.requestLocalContext.userId;

      let requestBodyObject: UserGuidanceRequestUpdateByWorkoAdminApiDto =
        req.body;

      if (cognitoUserId !== requestBodyObject.actionByUserId) {
        global.logger.error(
          "You are not authorized to update this guidance request",
          {
            methodName: this.updateUserGuidanceRequestByWorkoAdmin.name,
            expectedCognitoUserId: cognitoUserId,
            receivedCognitoUserId: requestBodyObject.actionByUserId,
          }
        );
        throw new BaseError(
          "You are not authorized to update this guidance request",
          HttpStatusCode.FORBIDDEN_403
        );
      }

      const { error, value: validatedRequestBody } =
        userGuidanceRequestUpdateByWorkoAdminApiDtoValidation.validate(
          requestBodyObject,
          {
            abortEarly: false,
          }
        );
      if (error) {
        throw new RequestValidationError(error);
      }

      const response: DbUserGuidanceRequestDto =
        await userGuidanceRequestServiceObj.updateUserGuidanceRequestByWorkoAdmin(
          userGuidanceRequestId,
          validatedRequestBody
        );

      return res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(
        `Error at catch block in while updating user guidance request by worko admin [controller]`,
        {
          error,
          methodName: this.updateUserGuidanceRequestByWorkoAdmin.name,
        }
      );
      next(error);
    }
  };

  updateUserGuidanceRequestByCandidate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userGuidanceRequestId: string = req.params["id"];
      global.logger.info(
        "Update user guidance request by candidate [controller]",
        {
          userGuidanceRequestId,
          methodName: this.updateUserGuidanceRequestByCandidate.name,
        }
      );

      const cognitoUserId: string = global.requestLocalContext.userId;

      let requestBodyObject: UserGuidanceRequestUpdateByCandidateApiDto =
        req.body;

      if (cognitoUserId !== requestBodyObject.actionByUserId) {
        global.logger.error(
          "You are not authorized to update this guidance request",
          {
            methodName: this.updateUserGuidanceRequestByCandidate.name,
            expectedCognitoUserId: cognitoUserId,
            receivedCognitoUserId: requestBodyObject.actionByUserId,
          }
        );
        throw new BaseError(
          "You are not authorized to update this guidance request",
          HttpStatusCode.FORBIDDEN_403
        );
      }

      const { error, value: validatedRequestBody } =
        userGuidanceRequestUpdateByCandidateApiDtoValidation.validate(
          requestBodyObject,
          {
            abortEarly: false,
          }
        );
      if (error) {
        throw new RequestValidationError(error);
      }

      const response: DbUserGuidanceRequestDto =
        await userGuidanceRequestServiceObj.updateUserGuidanceRequestByCandidate(
          userGuidanceRequestId,
          validatedRequestBody
        );

      return res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(
        `Error at catch block in while updating user guidance request by candidate [controller]`,
        {
          error,
          methodName: this.updateUserGuidanceRequestByCandidate.name,
        }
      );
      next(error);
    }
  };

  updateUserGuidanceRequestByMentor = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userGuidanceRequestId: string = req.params["id"];
      global.logger.info(
        "Update user guidance request by employee(mentor) [controller]",
        {
          userGuidanceRequestId,
          methodName: this.updateUserGuidanceRequestByMentor.name,
        }
      );

      const cognitoUserId: string = global.requestLocalContext.userId;

      let requestBodyObject: UserGuidanceRequestUpdateByMentorApiDto =
        req.body;

      if (cognitoUserId !== requestBodyObject.actionByUserId) {
        global.logger.error(
          "You are not authorized to update this guidance request",
          {
            methodName: this.updateUserGuidanceRequestByMentor.name,
            expectedCognitoUserId: cognitoUserId,
            receivedCognitoUserId: requestBodyObject.actionByUserId,
          }
        );
        throw new BaseError(
          "You are not authorized to update this guidance request",
          HttpStatusCode.FORBIDDEN_403
        );
      }

      const { error, value: validatedRequestBody } =
        userGuidanceRequestUpdateByMentorApiDtoValidation.validate(
          requestBodyObject,
          {
            abortEarly: false,
          }
        );
      if (error) {
        throw new RequestValidationError(error);
      }

      const response: DbUserGuidanceRequestDto =
        await userGuidanceRequestServiceObj.updateUserGuidanceRequestByMentor(
          userGuidanceRequestId,
          validatedRequestBody
        );

      return res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(
        `Error at catch block in while updating user guidance request by employee(mentor) [controller]`,
        {
          error,
          methodName: this.updateUserGuidanceRequestByMentor.name,
        }
      );
      next(error);
    }
  };

  updateUserGuidanceRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const resourceKey: string = req.params["resourceKey"];

      global.logger.info("Update user guidance request [controller]", {
        methodName: this.updateUserGuidanceRequest.name,
        resourceKey: resourceKey,
      });

      switch (resourceKey) {
        case UserGuidanceRequestUpdateActionResourceKeyEnum.WORKO_ADMIN_ACTION:
          await this.updateUserGuidanceRequestByWorkoAdmin(req, res, next);
          break;

        case UserGuidanceRequestUpdateActionResourceKeyEnum.CANDIDATE_ACTION:
          await this.updateUserGuidanceRequestByCandidate(req, res, next);
          break;

        case UserGuidanceRequestUpdateActionResourceKeyEnum.MENTOR_ACTION:
          await this.updateUserGuidanceRequestByMentor(req, res, next);
          break;

        default:
          throw new BaseError(
            "The provided 'resourceKey' is invalid. Please provide a valid 'resourceKey'.",
            HttpStatusCode.BAD_REQUEST_400
          );
      }
    } catch (error) {
      global.logger.error(
        "Error in update user guidance request [controller]",
        {
          methodName: this.updateUserGuidanceRequest.name,
          error: error,
        }
      );
      next(error);
    }
  };
}

export default UserGuidanceRequestController;