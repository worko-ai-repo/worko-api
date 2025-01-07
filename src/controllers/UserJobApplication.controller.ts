// Load the npm packages
import { Request, Response, NextFunction } from "express";

// import daos
import { userJobApplicationDao } from "../daos/UserJobApplication.dao";

// import dtos
import { UserJobApplicationCreateApiDTO, UserJobApplicationListingFilterOptions, UserJobApplicationListingFilterRequestDTO, UserJobApplicationRequestFeedbackApiDTO, UserJobApplicationUpdateApiDTO } from "../dtos/UserJobApplication.dto";
import { PaginatedResultsWithMatchingConditionsInternalResponse, PaginatedResultsWithMatchingConditionsResponse, RecordListingResponseDTO } from "../dtos/Common.dto";

// import enums
import { UserType } from "../enums/User.enum";
import { MatchingScoreEntityEnum } from "../enums/Common.enum";

// import helpers
import { RequestHelper } from "../helpers/request.helper";
import { paginationResponseHelperObj } from "../helpers/pagination-response.helper";

// import models
import { DbUserJobApplicationDto } from "../db/models/UserJobApplication.model";
import { DbUserDetailDto } from "../db/models/UserDetail.model";

// import services
import { userJobApplicationServiceObj } from "../services/UserJobApplication.service";
import userDetailServiceObj from "../services/UserDetail.service"
import InvokeLambdaService from "../services/InvokeLambda.service";

// import schemas
import { UserCreateJobApplicationDTOValidation, userJobApplicationFilterDtoValidation, userJobApplicationRequestFeedbackValidation, userJobApplicationUpdateValidation } from "../schemas/UserJobApplication.schema";

// import types
import { JobApplicationWithUserDetailsType } from "../types/UserJobApplication.type";

// import utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

/**
 * UserJobApplicationController
 * 
 * Controller for handling user job application-related operations
 */
class UserJobApplicationController {
  /**
   * createJobApplication
   * 
   * Controller for creating a new job application
   *
   * @param {Request} req - Express request object:
   * @param {Response} res - Express response object used to send back the API response.
   * @param {NextFunction} next - Express next function for error handling.
   */
  createJobApplication = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info(`Create Job Application [Controller]`, {
        filePath: __filename,
        methodName: this.createJobApplication.name,
        requestBody: req.body,
        responseLocals: global.requestLocalContext,
      });

      // Extract the userId from the response locals
      const cognitoUserId: string = global.requestLocalContext.userId;

      // Parse the user details
      const userDetails: DbUserDetailDto = await userDetailServiceObj.getUserByIdOne(cognitoUserId);

      // Extract and validate the job application data from request body and throw error if not valid
      const reqBody: UserJobApplicationCreateApiDTO = req.body;
      const { error: reqBodyError, value: jobApplicationRequestBody } =
        UserCreateJobApplicationDTOValidation.validate(reqBody, {
          abortEarly: false,
        });
      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }

      // Extract the email from the user details
      const email: string = userDetails.PK.split("#")[2];

      // Create the job application using the service
      const newJobApplicationDetails: DbUserJobApplicationDto =
        await userJobApplicationServiceObj.createJobApplication(
          jobApplicationRequestBody,
          email,
          cognitoUserId
        );

      // Prepare the job application SK for the job application to Pass to calculate matching score Lambda
      const jobApplicationSK: string =
        userJobApplicationDao.sortKeys.SK_JOB_APP_ID.strtr({
          "{id}": newJobApplicationDetails.id,
        });

      // Invoke a lambda function to calculate matching scores for this job application
      await InvokeLambdaService.triggerMatchingScoreCalculation(
        email,
        MatchingScoreEntityEnum.JOB_APP,
        jobApplicationSK
      );

      // return the response
      return res
        .status(HttpStatusCode.CREATED_201)
        .json({ jobApplicationRequestId: newJobApplicationDetails.id });
    } catch (error) {
      next(error);
    }
  };

  /**
   * getJobApplicationScore
   * 
   * Controller for getting job application score
   *
   * @param {Request} req - Express request object:
   * @param {Response} res - Express response object used to send back the API response.
   * @param {NextFunction} next - Express next function for error handling.
   */
  getJobApplicationScore = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info(`Get Job Application Score [Controller]`, {
        filePath: __filename,
        methodName: this.getJobApplicationScore.name,
        requestParams: req.params,
      });

      // Get job applications score using the service
      const userJobApplicationScoreDetails: DbUserJobApplicationDto =
        await userJobApplicationServiceObj.getJobApplicationScore(
          req.params.id
        );

      // return the response
      return res
        .status(HttpStatusCode.OK_200)
        .json(userJobApplicationScoreDetails);
    } catch (error) {
      next(error);
    }
  };

  /**
   * getJobApplicationById
   * 
   * Controller for getting job application by id
   *
   * @param {Request} req - Express request object:
   * @param {Response} res - Express response object used to send back the API response.
   * @param {NextFunction} next - Express next function for error handling.
   */
  getJobApplicationById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info(`Get Job Application By Id [Controller]`, {
        filePath: __filename,
        methodName: this.getJobApplicationById.name,
        requestParams: req.params,
      });

      // Extract and validate the job application id from request parameters and throw error if not valid
      const jobApplicationId: string = req.params.id;

      // Get job applications for the candidate using the service
      const jobApplicationDetails: DbUserJobApplicationDto =
        await userJobApplicationServiceObj.getJobApplicationById(
          jobApplicationId
        );

      // return the response
      return res.status(HttpStatusCode.OK_200).json(jobApplicationDetails);
    } catch (error) {
      next(error);
    }
  };

  /**
   * getJobApplicationsByFilterOptions
   * 
   * Controller for getting job applications by filter options
   *
   * @param {Request} req - Express request object:
   * @param {Response} res - Express response object used to send back the API response.
   * @param {NextFunction} next - Express next function for error handling.
   */
  getJobApplicationsByFilterOptions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info(
        `Get Job Applications By filter options [Controller]`,
        {
          filePath: __filename,
          methodName: this.getJobApplicationsByFilterOptions.name,
        }
      );

      // Parse filter options from the request query parameters
      const userJobApplicationRecordListingFilterRequest: UserJobApplicationListingFilterOptions =
        RequestHelper.parseFilterOptions<
          UserJobApplicationListingFilterRequestDTO,
          UserJobApplicationListingFilterOptions
        >(req.query as unknown as UserJobApplicationListingFilterRequestDTO);

      // Validate the request body using the Joi schema and throw a validation error if not valid
      const { error: reqBodyError, value: jobApplicationRequestBody } =
        userJobApplicationFilterDtoValidation.validate(
          userJobApplicationRecordListingFilterRequest,
          {
            abortEarly: false,
          }
        );
      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }

      // Get job applications for the corporate user using the service
      const userJobApplicationDetails: PaginatedResultsWithMatchingConditionsResponse<DbUserJobApplicationDto> | PaginatedResultsWithMatchingConditionsInternalResponse<JobApplicationWithUserDetailsType[]> =
        await userJobApplicationServiceObj.getJobApplicationsByFilterOptions(
          jobApplicationRequestBody
        );

      if(jobApplicationRequestBody.userType === UserType.CAND) {
        // Extract the count, timesQueried,lastKey and other details from the response
        const {
          lastKey,
          count,
          timesQueried,
          queriedCount,
          ...jobApplicationData
        } = userJobApplicationDetails;

        // Generate the pagination response
        const jobApplicationsResponse: RecordListingResponseDTO<
          DbUserJobApplicationDto[]
        > =
          paginationResponseHelperObj.customizedPaginationRecordListingResponse<
            DbUserJobApplicationDto[],
            UserJobApplicationListingFilterOptions
          >(
            Object.values(jobApplicationData),
            userJobApplicationRecordListingFilterRequest,
            count,
            timesQueried,
            lastKey,
            queriedCount
          );

        // return the response
        return res.status(HttpStatusCode.OK_200).json(jobApplicationsResponse);
      } else {
        const {
          lastKey,
          count,
          timesQueried,
          queriedCount,
          ...jobApplicationData
        } = userJobApplicationDetails;

        // Generate the pagination response
        const jobApplicationsResponse: RecordListingResponseDTO<
          JobApplicationWithUserDetailsType[]
        > =
          paginationResponseHelperObj.customizedPaginationRecordListingResponse<
            JobApplicationWithUserDetailsType[],
            UserJobApplicationListingFilterOptions
          >(
            Object.values(jobApplicationData)[0] ?? [],
            userJobApplicationRecordListingFilterRequest,
            count,
            timesQueried,
            lastKey,
            queriedCount
          );

        // return the response
        return res.status(HttpStatusCode.OK_200).json(jobApplicationsResponse);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * updateJobApplicationByCorpUser
   * 
   * Controller for updating job application by corp user
   *
   * @param {Request} req - Express request object:
   * @param {Response} res - Express response object used to send back the API response.
   * @param {NextFunction} next - Express next function for error handling.
   */
  updateJobApplicationByCorpUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info(`Update Job Application By Corp User [Controller]`, {
        filePath: __filename,
        methodName: this.updateJobApplicationByCorpUser.name,
        reqBody: req.body,
        reqParams: req.params,
      });

      // Get job application id from the request Parameters
      const jobApplicationId: string = req.params.id;

      // Get job application details from the request body and validate it, if not valid throw error
      const reqBody: UserJobApplicationUpdateApiDTO = req.body;
      const { error: reqBodyError, value: jobApplicationRequestBody } =
        userJobApplicationUpdateValidation.validate(reqBody, {
          abortEarly: false,
        });
      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }

      // Update job application details using the service
      const userJobApplicationDetails: DbUserJobApplicationDto =
        await userJobApplicationServiceObj.updateJobApplicationByCorpUser(
          jobApplicationId,
          jobApplicationRequestBody
        );

      // return the response
      return res.status(HttpStatusCode.OK_200).json(userJobApplicationDetails);
    } catch (error) {
      next(error);
    }
  };

  /**
   * updateJobApplicationRequestFeedback
   * 
   * Controller for when user requests for feedback
   *
   * @param {Request} req - Express request object:
   * @param {Response} res - Express response object used to send back the API response.
   * @param {NextFunction} next - Express next function for error handling.
   */
  updateJobApplicationRequestFeedback = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info(
        `Create Job Application Request Feedback [Controller]`,
        {
          filePath: __filename,
          methodName: this.updateJobApplicationRequestFeedback.name,
          reqParams: req.params,
        }
      );

      // Get job application details from the request body and validate it, if not valid throw error
      const reqBody: UserJobApplicationRequestFeedbackApiDTO = req.body;
      const { error: reqBodyError, value: jobApplicationRequestBody } =
        userJobApplicationRequestFeedbackValidation.validate(reqBody, {
          abortEarly: false,
        });
      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }

      // Get job application id from the request Parameters
      const jobApplicationId: string = req.params.id;

      const jobApplicationFeedbackRequestDetails: boolean =
        await userJobApplicationServiceObj.updateJobApplicationRequestFeedback(
          jobApplicationRequestBody,
          jobApplicationId
        );

      return res.status(HttpStatusCode.OK_200).json({
        isNotficationSent: jobApplicationFeedbackRequestDetails,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default UserJobApplicationController;