// import aws lambda related types
import { APIGatewayProxyResult } from "aws-lambda";

// import constants
import { awsClientLambdaLibrary } from "../configs/aws-sdk.config";
import APP_CONSTANTS from "../configs/constants.config";

// import daos
import userDetailDao from "../daos/UserDetail.dao";

// Import dtos
import { InvokeLambdMatchingScoreCalcualtionDto } from "../dtos/InvokeLambda.dto";
import { UserParseCvRequestApiDto } from "../dtos/User.dto";

// import enums
import { MatchingScoreEntityEnum } from "../enums/Common.enum";

// import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";
import {
  InterviewCompletionPayload,
  InterviewCompletionResponse,
  InterviewFeedbackPayload,
  InterviewFeedbackResponse,
  InterviewInitialPayload,
  InterviewInitialResponse,
  InterviewLambdaFnMode,
} from "../dtos/UserInterview.dto";
import { InvocationTypeEnum } from "../enums/InvokeLambda.enum";

/**
 * API Invoke Error Codes:
 * @see https://docs.aws.amazon.com/lambda/latest/api/API_Invoke.html#API_Invoke_Errors
 */
class InvokeLambdaService {
  async triggerMatchingScoreCalculation(
    email: string,
    entity: MatchingScoreEntityEnum,
    entitySK: string
  ): Promise<APIGatewayProxyResult> {
    global.logger.info("Trigger Matching Score Calculation [service]", {
      filePath: __filename,
      methodName: this.triggerMatchingScoreCalculation.name,
      email,
      entity,
      entitySK,
    });

    // Prepare user Detail PK
    const userDetailPK: string = userDetailDao.partitianKey.strtr({
      "{primaryEmail}": email,
    });

    // Prepare Payload
    const payload = {
      USER_PK: userDetailPK,
      USER_DETAIL_SK: "ID#",
      MATCHING_ENTITY: entity,
      ENTITY_SK: entitySK,
    };

    // Trigger Lambda
    return awsClientLambdaLibrary.triggerLambdaEventInvocationType<InvokeLambdMatchingScoreCalcualtionDto>(
      APP_CONSTANTS.LAMBDA_FUNCTION_NAMES.MATCHING_SCORE_LAMBDA_NAME,
      payload
    );
  }

  async triggerResumeExtraction(email: string) {
    global.logger.info("[service] Trigger Resume Extraction ");
    const payload = {
      USER_PK: "USR#EML#" + email,
      USER_DETAIL_SK: "ID#",
    };

    // Trigger Lambda
    return awsClientLambdaLibrary.triggerLambdaEventInvocationType<{
      USER_PK: string;
      USER_DETAIL_SK: string;
    }>(APP_CONSTANTS.LAMBDA_FUNCTION_NAMES.RESUME_EXTRACTION_LAMBDA_NAME, payload);
  }

  async triggerResumePartialExtraction(
    s3ResumeId: string,
    userId: string
  ): Promise<APIGatewayProxyResult> {
    // log the info
    global.logger.info("Trigger OpenSearch Operation Lambda [service]", {
      methodName: this.triggerResumePartialExtraction.name,
    });

    const lambdaName: string | undefined =
      APP_CONSTANTS.LAMBDA_FUNCTION_NAMES.WORKO_RESUME_SIGNUP_SKILLS_PARSER_LAMBDA_NAME;
    if (!lambdaName) {
      global.logger.error("Lambda name not found in constants");
      throw new BaseError(
        "Lambda name not found in constants",
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    return awsClientLambdaLibrary.triggerLambdaRequestResponseInvocationType<{
      s3ResumeId: string;
      userId: string;
    }>(lambdaName, {
      s3ResumeId,
      userId,
    });
  }

  /**
   * triggerInterviewService
   *
   * @description Triggers the interview initiation lambda function with different services
   */
  // --- Overloads ---
  async triggerInterviewService(
    payload: InterviewInitialPayload,
    mode: "initial",
    invocationType: InvocationTypeEnum
  ): Promise<InterviewInitialResponse>;

  async triggerInterviewService(
    payload: InterviewFeedbackPayload,
    mode: "feedback",
    invocationType: InvocationTypeEnum
  ): Promise<InterviewFeedbackResponse>;

  async triggerInterviewService(
    payload: InterviewCompletionPayload,
    mode: "completion",
    invocationType: InvocationTypeEnum
  ): Promise<InterviewCompletionResponse>;

  // --- Implementation ---
  async triggerInterviewService(
    payload: InterviewInitialPayload | InterviewFeedbackPayload | InterviewCompletionPayload,
    mode: InterviewLambdaFnMode,
    invocationType: InvocationTypeEnum
  ): Promise<InterviewInitialResponse | InterviewFeedbackResponse | InterviewCompletionResponse> {
    global.logger.info("Trigger Interview Service Lambda [service]", {
      filePath: __filename,
      methodName: "triggerInterviewService",
      mode,
      invocationType,
    });

    const lambdaName =
      APP_CONSTANTS.LAMBDA_FUNCTION_NAMES.INTERVIEW_SERVICE_LAMBDA_NAME ||
      "worko-video-interview-workflow";
    // update payload with mode
    (payload as any)["mode"] = mode;
    console.log("Interview Service Lambda Payload:", payload);
    
    const response = invocationType === InvocationTypeEnum.EventType 
      ? await awsClientLambdaLibrary.triggerLambdaEventInvocationType(lambdaName, payload)
      : await awsClientLambdaLibrary.triggerLambdaRequestResponseInvocationType(lambdaName, payload);
    
    console.warn("Interview Service Lambda Response:", response);
    const parsedResponse =
      typeof response.body === "string" ? JSON.parse(response.body) : response.body;

    return parsedResponse;
  }
}

// Export an instance of the InvokeLambda class
export default new InvokeLambdaService();
