import { Request, Response, NextFunction } from "express";

// dtos
import {
  PaginatedResultsWithMatchingConditionsResponse,
  RecordListingResponseDTO,
} from "../dtos/Common.dto";
import {
  InterviewFeedbackGenerationApiDTO,
  InterviewFilterRequestDTO,
  InterviewInitiateApiDTO,
  InterviewRequestCreateApiDTO,
  InterviewUpdateApiDTO,
} from "../dtos/UserInterview.dto";

// models
import { DbInterviewDto } from "../db/models/UserInterview.model";

// helpers
import { paginationResponseHelperObj } from "../helpers/pagination-response.helper";
import { RequestHelper } from "../helpers/request.helper";

// schemas
import {
  userInterviewCompletionValidation,
  userInterviewFilterValidation,
  userInterviewInitiateValidation,
  userInterviewQuestionFeedbackGenerationkValidation,
  userInterviewRequestCreateValidation,
  userInterviewUpdateStatusValidation,
} from "../schemas/UserInterview.schema";

// services
import { interviewServiceObj } from "../services/UserInterview.service";

// utils
import { BaseError, RequestValidationError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 * InterviewController
 *
 * Handles all Interview-related HTTP requests.
 * - Validates inputs using Joi schemas
 * - Delegates business logic to services
 * - Returns standardized pagination responses for listings
 */
class InterviewController {
  /**
   * requestUserInterview
   *
   * Corporate user requests an interview for a candidate.
   * Returns created interview with status PENDING.
   */
  requestUserInterview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the info details
      global.logger.info(
        "Processing request for generating interview request against user. [controller]",
        {
          filePath: __filename,
          methodName: this.requestUserInterview.name,
          requestBody: req.body,
        }
      );

      // Get the validation result
      const { error, value } = userInterviewRequestCreateValidation.validate(req.body, {
        abortEarly: false,
      });
      if (error) {
        throw new RequestValidationError(error);
      }

      const userId: string = global.requestLocalContext.userId;
      const body: InterviewRequestCreateApiDTO = value;
      const response = await interviewServiceObj.requestUserInterview(userId, body);
      return res.status(HttpStatusCode.CREATED_201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * initiateUserInterview
   *
   * Candidate starts an interview session; sets status to IN_PROGRESS.
   */
  initiateUserInterview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      global.logger.info("Initiating interview session for candidate. [controller]", {
        filePath: __filename,
        methodName: this.initiateUserInterview.name,
        requestBody: req.body,
      });

      const { error, value } = userInterviewInitiateValidation.validate(req.body, {
        abortEarly: false,
      });
      if (error) {
        throw new RequestValidationError(error);
      }
      const candidateUserId: string = global.requestLocalContext.userId;

      // Construct seeding data
      const seed: { candidateEmail: string } & Pick<
        DbInterviewDto,
        | "initiatedAt"
        | "createdBy"
        | "status"
        | "createdByUserId"
        | "totalQuestions"
        | "currentQuestion"
      > = {
        ...(value as InterviewInitiateApiDTO),
        candidateEmail: (value as InterviewInitiateApiDTO).candidateEmail,
        initiatedAt: new Date().toISOString(),
        createdByUserId: candidateUserId,
        createdBy: candidateUserId,
        status: "IN_PROGRESS",
        totalQuestions: 0,
        currentQuestion: "0",
      };

      const response = await interviewServiceObj.initiateUserInterview(seed);
      return res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * provideFeedbackUserInterview (Lambda)
   *
   * Returns the current/next question state for an in-progress session.
   */
  provideFeedbackUserInterview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the info details
      global.logger.info("Generating feedback for the answered question. [controller]", {
        filePath: __filename,
        methodName: this.provideFeedbackUserInterview.name,
        requestBody: req.body,
      });

      // Retrieve the interview id from the path parameters
      const interviewId: string = req.params["interviewId"];

      // if Interview id is not ulid then throw error
      if (!interviewId || interviewId.length !== 26) {
        throw new BaseError("Invalid Interview ID provided.", HttpStatusCode.BAD_REQUEST_400);
      }

      // Get the validation result
      const { error, value }: { error: any; value: InterviewFeedbackGenerationApiDTO } =
        userInterviewQuestionFeedbackGenerationkValidation.validate(
          req.body as InterviewFeedbackGenerationApiDTO,
          {
            abortEarly: false,
          }
        );
      if (error) {
        throw new RequestValidationError(error);
      }
      // Extract the userId from the request context
      const userId: string = global.requestLocalContext.userId;

      const response = await interviewServiceObj.provideFeedbackUserInterview(
        userId,
        interviewId,
        value
      );
      return res.status(HttpStatusCode.CREATED_201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * completeUserInterview
   *
   * Marks interview as COMPLETED and triggers scoring pipeline downstream.
   */
  completeUserInterview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      global.logger.info("Completing interview session. [controller]", {
        filePath: __filename,
        methodName: this.completeUserInterview.name,
        requestBody: req.body,
      });

      // Retrieve the interview id from the path parameters
      const interviewId: string = req.params["interviewId"];

      // if Interview id is not ulid then throw error
      if (!interviewId || interviewId.length !== 26) {
        throw new BaseError("Invalid Interview ID provided.", HttpStatusCode.BAD_REQUEST_400);
      }

      const { error, value } = userInterviewCompletionValidation.validate(req.body, {
        abortEarly: false,
      });
      if (error) {
        throw new RequestValidationError(error);
      }
      const userId: string = global.requestLocalContext.userId;
      const body = value;
      const response = await interviewServiceObj.completeUserInterview(userId, interviewId, body);
      return res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * updateUserInterview
   *
   * Updates interview status or other attributes.
   */
  updateUserInterview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the info details
      global.logger.info("Updating interview metadata. [controller]", {
        filePath: __filename,
        methodName: this.updateUserInterview.name,
        requestBody: req.body,
      });

      // Retrieve the interview id from the path parameters
      const interviewId: string = req.params["interviewId"];

      // if Interview id is not ulid then throw error
      if (!interviewId || interviewId.length !== 26) {
        throw new BaseError("Invalid Interview ID provided.", HttpStatusCode.BAD_REQUEST_400);
      }

      const {
        error,
        value,
      }: {
        error: any;
        value: InterviewUpdateApiDTO;
      } = userInterviewUpdateStatusValidation.validate(req.body, {
        abortEarly: false,
      });
      if (error) {
        throw new RequestValidationError(error);
      }
      const userId: string = global.requestLocalContext.userId;
      const body = value;
      const response = await interviewServiceObj.updateUserInterview(userId, interviewId, body);
      return res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * listUserInterviewByEmail
   *
   * Lists interviews for a candidate email with pagination response.
   */
  listUserInterviewByEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      global.logger.info("Listing interviews for candidate email. [controller]", {
        filePath: __filename,
        methodName: this.listUserInterviewByEmail.name,
        queryParams: req.query,
      });

      const email: string = req.params["email"];
      const query: InterviewFilterRequestDTO = req.query as any;
      const parsed = RequestHelper.parseFilterOptions<InterviewFilterRequestDTO, any>(query);
      const { error, value } = userInterviewFilterValidation.validate(
        { ...parsed, email },
        { abortEarly: false }
      );
      if (error) {
        throw new RequestValidationError(error);
      }
      const response: PaginatedResultsWithMatchingConditionsResponse<DbInterviewDto> =
        await interviewServiceObj.listUserInterviewByEmail(value);
      const { lastKey, count, timesQueried, queriedCount, ...data } = response;
      const recordResponse: RecordListingResponseDTO<DbInterviewDto[]> =
        paginationResponseHelperObj.customizedPaginationRecordListingResponse<
          DbInterviewDto[],
          any
        >(Object.values(data), value, count, timesQueried, lastKey, queriedCount);
      return res.status(HttpStatusCode.OK_200).json(recordResponse);
    } catch (error) {
      next(error);
    }
  };

  /**
   * listUserInterviewDetailsById
   *
   * Fetch detailed interview session information.
   */
  listUserInterviewDetailsById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      global.logger.info("Fetching interview session details. [controller]", {
        filePath: __filename,
        methodName: this.listUserInterviewDetailsById.name,
        pathParams: req.params,
      });
      const id: string = req.params["interviewId"];
      if (!id || id.length !== 26) {
        throw new BaseError("Invalid Interview ID provided.", HttpStatusCode.BAD_REQUEST_400);
      }
      const response = await interviewServiceObj.listUserInterviewDetailsById(id);
      return res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * listAllUserInterview
   *
   * Lists corporate-requested interviews (filterable by status/company).
   */
  listAllUserInterview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      global.logger.info("Listing corporate requested interviews. [controller]", {
        filePath: __filename,
        methodName: this.listAllUserInterview.name,
        queryParams: req.query,
      });

      const parsed = RequestHelper.parseFilterOptions<InterviewFilterRequestDTO, any>(
        req.query as any
      );
      const { error, value } = userInterviewFilterValidation.validate(parsed, {
        abortEarly: false,
      });
      if (error) {
        throw new RequestValidationError(error);
      }
      const response: PaginatedResultsWithMatchingConditionsResponse<DbInterviewDto> =
        await interviewServiceObj.listUserInterviewByEmail(value);
      const { lastKey, count, timesQueried, queriedCount, ...data } = response;
      const recordResponse: RecordListingResponseDTO<DbInterviewDto[]> =
        paginationResponseHelperObj.customizedPaginationRecordListingResponse<
          DbInterviewDto[],
          any
        >(Object.values(data), value, count, timesQueried, lastKey, queriedCount);
      return res.status(HttpStatusCode.OK_200).json(recordResponse);
    } catch (error) {
      next(error);
    }
  };

  /**
   * getUserInterviewVideos
   *
   * Fetches all interview recording chunks for a specific interview.
   * Returns ordered list of video URLs mapped to questions.
   */
  getUserInterviewVideos = async (req: Request, res: Response, next: NextFunction) => {
    try {
      global.logger.info("Fetching interview video chunks. [controller]", {
        filePath: __filename,
        methodName: this.getUserInterviewVideos.name,
        pathParams: req.params,
      });

      const interviewId: string = req.params["interviewId"];

      // Validate interview ID format (ULID is 26 characters)
      if (!interviewId || interviewId.length !== 26) {
        throw new BaseError("Invalid Interview ID provided.", HttpStatusCode.BAD_REQUEST_400);
      }

      const response = await interviewServiceObj.getUserInterviewVideos(interviewId);
      return res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      next(error);
    }
  };
}

export default InterviewController;
