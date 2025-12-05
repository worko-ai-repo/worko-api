// Import dtos
import { RecordListingFilterOptions, RecordListingFilterRequestDTO } from "./Common.dto";

// Import enums
import {
  InterviewStatusEnum,
  InterviewActorEnum,
  InterviewChunkUploadStatusType,
} from "../enums/UserInterview.enum";
import { DbInterviewDto } from "../db/models/UserInterview.model";

/**
 * InterviewRequestCreateApiDTO
 *
 * DTO for creating an interview request. Used to track the payload for interviewController.requestInterview function.
 */
export interface InterviewRequestCreateApiDTO {
  candidateEmail: string;
  candidateFullName?: string;
  companyName: string;
  requesterUserName: string;
  companyId: string;
  jobId: string;
  position: string;
  requestedByActor: InterviewActorEnum;
}

/**
 * InterviewInitiateApiDTO
 *
 * DTO for initiating an interview session. Used to track the payload for interviewController.initiateInterview function.
 */
export interface InterviewInitiateApiDTO {
  candidateEmail: string;
}

/**
 * InterviewRequestedByDto
 * 
 * DTO representing the details of the requester for an interview.
 */
export interface InterviewRequestedByDto {
  corporateUserId: string;
  requesterUserName: string;
  companyName: string;
  companyId: string;
  position: string;
  jobId: string;
  requestedByActor: InterviewActorEnum;
  requestedAt: string;
}

/**
 * InterviewHistoryEntryDto
 *
 * DTO representing a single entry in the interview history from DbInterview modal schema.
 */
export interface InterviewHistoryEntryDto {
  questionId: string;
  questionText: string;
  userAnswer: string;
  feedback: string;
  detailedFeedback?: string;
  isCorrect: boolean;
  timeTaken: number;
  chunkId: string;
  chunkUploadStatus: InterviewChunkUploadStatusType;
  chunkFileMimeType: string;
}

/**
 * InterviewScoreBreakdownDto
 *
 * DTO representing a record of detailed score breakdown for an interview.
 */
export interface InterviewScoreBreakdownDto {
  confidence?: number;
  attitude?: number;
  domainExpertise?: number;
  communication_skills?: number;
  [key: string]: any;
}

/**
 * InterviewFeedbackGenerationApiDTO
 *
 * DTO for generating feedback for an interview question. Used to track the payload for interviewController.provideFeedback fnction.
 */
export interface InterviewFeedbackGenerationApiDTO {
  email: string;
  interviewHistory: InterviewHistoryEntryDto;
}

/**
 * InterviewCompletionApiDTO
 *
 * DTO for completing an interview session. Used to track the payload for interviewController.completeInterview function.
 */
export interface InterviewFilterOptions extends RecordListingFilterOptions {
  email?: string;
  status?: InterviewStatusEnum;
  companyId?: string;
}

/**
 * InterviewFilterRequestDTO
 *
 * DTO for filtering interview records in listing requests.
 */
export interface InterviewFilterRequestDTO extends RecordListingFilterRequestDTO {
  email?: string;
  status?: InterviewStatusEnum;
  companyId?: string;
}

/**
 * InterviewUpdateApiDTO
 *
 * DTO for updating interview status or connection metadata. Used to track the payload for interviewController.updateStatus function.
 */
export interface InterviewUpdateApiDTO
  extends Pick<
    DbInterviewDto,
    | "candidateEmail"
    | "status"
    | "currentQuestion"
    | "duration"
    | "avgResponseTime"
    | "storagePath"
    | "lastChunkUploaded"
    | "userFeedback"
    | "retryCount"
  > {}

/**
 * InterviewCompletionApiDTO
 *
 * DTO for completing an interview session. Used to save the user feedback and change other metadata.
 */
export interface InterviewCompletionApiDTO
  extends Pick<
    DbInterviewDto,
    "interviewHistory" | "status" | "userFeedback" | "lastChunkUploaded"
  > {
  candidateEmail: string;
  status: InterviewStatusEnum;
  userFeedback: { rating: number; comments?: string };
  lastChunkUploaded?: string;
}

// ================================= LAMBDA DTO =================================

/**
 * InterviewLambdaFnMode
 *
 * Modes for the interview lambda function invocations to overload the triggerInterviewService method.
 */
export type InterviewLambdaFnMode = "initial" | "feedback" | "completion";


/**
 * InterviewInitialPayload
 *
 * Payload for initiating an interview session via lambda.
 */
export interface InterviewInitialPayload {
  email: string;
  totalQuestions: number;
}

/**
 * InterviewFeedbackPayload
 *
 * Payload for providing feedback on a specific interview question via lambda.
 */
export interface InterviewFeedbackPayload {
  email: string;
  questionId: string;
  questionText: string;
  userAnswer: string;
}

/**
 * InterviewCompletionPayload
 *
 * Payload for completing an interview session via lambda and generating detailed scores and summary.
 */
export interface InterviewCompletionPayload {
  email: string;
  interviewHistory: InterviewHistoryEntryDto;
}

/**
 * InterviewInitialResponse
 *
 * Response from the interview initiation lambda function containing generated initial questions.
 */
export interface InterviewInitialResponse {
  initialInterviewQuestionsGeneratedByLambda: [number, string][];
  typeOfcandidate:object;
}

/**
 * InterviewFeedbackResponse
 *
 * Response from the interview feedback lambda function indicating save status.
 */
export interface InterviewFeedbackResponse {
  questionId: string;
  isAnswerCorrect: boolean;
  feedback: string;
  correctedTranscription?: string;
  needsFollowUp: boolean;
}

/**
 * InterviewCompletionResponse
 *
 * Response from the interview completion lambda function containing summary details.
 */
export interface InterviewCompletionResponse {
  status: "COMPLETED";
}
