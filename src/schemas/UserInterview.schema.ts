import Joi from "joi";
import { InterviewActorEnum, InterviewStatusEnum } from "../enums/UserInterview.enum";
import { DbInterviewDto } from "../db/models/UserInterview.model";
import { InterviewCompletionApiDTO, InterviewUpdateApiDTO } from "../dtos/UserInterview.dto";

/**
 * interviewRequestCreateValidation
 *
 * Validates corporate interview request payload.
 */
export const userInterviewRequestCreateValidation = Joi.object({
  candidateEmail: Joi.string().email().required().messages({
    "string.email": "A valid candidate email is required",
    "any.required": "Candidate email is required",
  }),
  candidateFullName: Joi.string().required().messages({
    "any.required": "Candidate full name is required",
  }),
  companyName: Joi.string().required().messages({
    "any.required": "Company name is required",
  }),
  requesterUserName: Joi.string().required().messages({
    "any.required": "Requester user name is required",
  }),
  companyId: Joi.string().required().messages({
    "any.required": "Company Id is required",
  }),
  jobId: Joi.string().required().messages({
    "any.required": "Job URL is required",
  }),
  position: Joi.string().required().messages({
    "any.required": "Position is required",
  }),
  requestedByActor: Joi.string()
    .valid(
      InterviewActorEnum.ADMIN,
      InterviewActorEnum.CORPORATE_RECRUITER,
      InterviewActorEnum.CORPORATE_ADMIN,
      InterviewActorEnum.EVALUATOR
    )
    .required()
    .messages({
      "any.only": `Requested by actor must be one of: ${Object.values(InterviewActorEnum).join(
        ", "
      )}`,
      "any.required": "Requested by actor is required",
    }),
});

/**
 * interviewInitiateValidation
 *
 * Validates candidate interview initiation payload.
 */
export const userInterviewInitiateValidation = Joi.object({
  candidateEmail: Joi.string().email().required().messages({
    "string.email": "A valid candidate email is required",
    "any.required": "Candidate email is required",
  }),
});

/**
 * interviewQuestionFeedbacGenerationkValidation
 *
 * Validates feedback payload for interview question feedback generation.
 */
export const userInterviewQuestionFeedbackGenerationkValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "A valid email is required",
    "any.required": "Email is required",
  }),
  interviewHistory: Joi.object({
    questionId: Joi.string().required().messages({
      "any.required": "Question history ID is required",
    }),
    questionText: Joi.string().required().messages({
      "any.required": "Question text is required",
    }),
    userAnswer: Joi.string().required().messages({
      "any.required": "User answer is required",
    }),
    timeTaken: Joi.number().required().messages({
      "any.required": "Time taken is required",
      "number.base": "Time taken must be a number",
    }),
    chunkId: Joi.string().required().messages({
      "any.required": "Chunk ID is required",
    }),
    chunkUploadStatus: Joi.string().valid("UPLOADED", "FAILED", "PENDING").required().messages({
      "any.required": "Chunk upload status is required",
    }),
    chunkFileMimeType: Joi.string().required().messages({
      "any.required": "Chunk file MIME type is required",
    }),
  })
    .required()
    .messages({
      "any.required": "Interview history is required",
    }),
});

/**
 * interviewUpdateStatusValidation
 *
 * Validates status/connection update payload for interviews.
 */
export const userInterviewUpdateStatusValidation: Joi.ObjectSchema<InterviewUpdateApiDTO> =
  Joi.object({
    candidateEmail: Joi.string().email().required().messages({
      "string.email": "A valid candidate email is required",
    }),
    status: Joi.string()
      .valid(
        InterviewStatusEnum.PENDING,
        InterviewStatusEnum.IN_PROGRESS,
        InterviewStatusEnum.COMPLETED,
        InterviewStatusEnum.CLOSED
      )
      .optional()
      .messages({
        "any.only": "Status must be one of: PENDING, IN_PROGRESS, COMPLETED, CLOSED",
      }),
    currentQuestion: Joi.number().integer().min(0).optional().messages({
      "number.base": "Current question must be a number",
      "number.integer": "Current question must be an integer",
      "number.min": "Current question must be 0 or greater",
    }),
    duration: Joi.number().min(0).optional().messages({
      "number.base": "Duration must be a number",
      "number.min": "Duration must be 0 or greater",
    }),
    avgResponseTime: Joi.number().min(0).optional().messages({
      "number.base": "Average response time must be a number",
      "number.min": "Average response time must be 0 or greater",
    }),
    storagePath: Joi.string().optional().messages({
      "string.base": "Storage path must be a string",
    }),
    lastChunkUploaded: Joi.string().optional().messages({
      "string.base": "Last chunk uploaded must be a string",
    }),
    userFeedback: Joi.string().optional().messages({
      "string.base": "User feedback must be a string",
    }),
    retryCount: Joi.number().integer().min(0).optional().messages({
      "number.base": "Retry count must be a number",
      "number.integer": "Retry count must be an integer",
      "number.min": "Retry count must be 0 or greater",
    }),
  });

/**
 * interviewFilterValidation
 *
 * Validates filter/query params for interview listings.
 */
export const userInterviewFilterValidation = Joi.object({
  email: Joi.string().email().optional().messages({
    "string.email": "A valid email is required",
  }),
  status: Joi.string()
    .valid(
      InterviewStatusEnum.PENDING,
      InterviewStatusEnum.IN_PROGRESS,
      InterviewStatusEnum.COMPLETED,
      InterviewStatusEnum.CLOSED
    )
    .optional()
    .messages({
      "any.only": "Status must be one of: PENDING, IN_PROGRESS, COMPLETED, CLOSED",
    }),
  companyId: Joi.string().optional().messages({
    "string.base": "Company ID must be a string",
  }),
  limit: Joi.number().integer().min(1).max(100).optional().messages({
    "number.base": "Limit must be a number",
    "number.integer": "Limit must be an integer",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),
  lastKey: Joi.string().optional().messages({
    "string.base": "Last key must be a string",
  }),
  sortOrder: Joi.string().optional().messages({
    "string.base": "Sort order must be a string",
  }),
  // Common pagination and filter fields
  pageSize: Joi.number().integer().min(1).max(100).optional().messages({
    "number.base": "Page size must be a number",
    "number.integer": "Page size must be an integer",
    "number.min": "Page size must be at least 1",
    "number.max": "Page size cannot exceed 100",
  }),
  fromDate: Joi.string().isoDate().optional().messages({
    "string.isoDate": "From date must be a valid ISO date",
  }),
  toDate: Joi.string().isoDate().optional().messages({
    "string.isoDate": "To date must be a valid ISO date",
  }),
  searchText: Joi.string().optional().messages({
    "string.base": "Search text must be a string",
  }),
});

/**
 * InterviewCompletionApiDTO
 *
 * DTO for completing an interview session. Used to track the payload for interviewController.completeInterview function.
 */
export const userInterviewCompletionValidation: Joi.ObjectSchema<InterviewCompletionApiDTO> =
  Joi.object({
    candidateEmail: Joi.string().email().required().messages({
      "string.email": "A valid candidate email is required",
      "any.required": "Candidate email is required",
    }),
    status: Joi.string()
      .valid(InterviewStatusEnum.COMPLETED, InterviewStatusEnum.CLOSED)
      .required()
      .messages({
        "any.only": "Status must be one of: COMPLETED, CLOSED",
        "any.required": "Status is required",
      }),
    userFeedback: Joi.object({
      rating: Joi.number().min(1).max(5).required().messages({
        "number.base": "Rating must be a number",
        "number.min": "Rating must be at least 1",
        "number.max": "Rating cannot exceed 5",
        "any.required": "Rating is required",
      }),
      comments: Joi.string().optional().messages({
        "string.base": "Comments must be a string",
      }),
    })
      .required()
      .messages({
        "any.required": "User feedback is required",
      }),
    lastChunkUploaded: Joi.string().optional().messages({
      "string.base": "Last chunk uploaded must be a string",
    }),
  });
