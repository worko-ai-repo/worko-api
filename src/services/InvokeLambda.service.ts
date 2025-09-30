
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
    }>(
      APP_CONSTANTS.LAMBDA_FUNCTION_NAMES.RESUME_EXTRACTION_LAMBDA_NAME,
      payload
    );
  }

  async triggerResumePartialExtraction(
    s3ResumeId: string,
    userId: string,
  ): Promise<APIGatewayProxyResult> {
    // log the info
    global.logger.info("Trigger OpenSearch Operation Lambda [service]", {
      methodName: this.triggerResumePartialExtraction.name,
    });

    const lambdaName: string | undefined = APP_CONSTANTS.LAMBDA_FUNCTION_NAMES.WORKO_RESUME_SIGNUP_SKILLS_PARSER_LAMBDA_NAME;
    if(!lambdaName ) {
      global.logger.error("Lambda name not found in constants");
      throw new BaseError("Lambda name not found in constants", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    return awsClientLambdaLibrary.triggerLambdaRequestResponseInvocationType<{
      s3ResumeId: string;
      userId: string;
    }>(
      lambdaName,
      {
        s3ResumeId,
        userId
      }
    );
  }
}

// Export an instance of the InvokeLambda class
export default new InvokeLambdaService();
