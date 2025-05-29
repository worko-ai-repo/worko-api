// import lambda related libraries
import {
  InvokeCommand,
  LambdaClient,
} from "@aws-sdk/client-lambda";

// import constants
import APP_CONSTANTS from "../configs/constants.config";

// import daos
import userDetailDao from "../daos/UserDetail.dao";

// import enums
import { MatchingScoreEntityEnum } from "../enums/Common.enum";
import { InvocationTypeEnum } from "../enums/InvokeLambda.enum";

/**
 * API Invoke Error Codes:
 * @see https://docs.aws.amazon.com/lambda/latest/api/API_Invoke.html#API_Invoke_Errors
 */
class InvokeLambdaService {
  client = new LambdaClient({});

  /**
   * triggerMatchingScoreCalculation
   *
   * Triggers the Lambda function to calculate the matching score for a given job application request or referral request.
   *
   * @param {string} email - The email of the user for which the matching score is to be calculated.
   * @param {MatchingScoreEntityEnum} entity - The type of entity for which the matching score is to be calculated. Can be either "REFERRAL" or "JOB_APP".
   * @param {string} entitySK - The SK (Sort Key) of the entity for which the matching score is to be calculated. If entity is "REFERRAL", then this should be the "REF#ID#{reqId}" [Refer `UserReferral.dao.ts`]. If entity is "JOB_APP", then this should be the "JOB#APP#ID#{id}" [Refer `UserJobApplication.dao.ts`].
   * @returns {Promise<number>} The status code of the Lambda function.
   */
  async triggerMatchingScoreCalculation(
    email: string,
    entity: MatchingScoreEntityEnum,
    entitySK: string
  ) {
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

    const command = new InvokeCommand({
      FunctionName:
        APP_CONSTANTS.LAMBDA_FUNCTION_NAMES.MATCHING_SCORE_LAMBDA_NAME,
      Payload: JSON.stringify(payload),
      // LogType: LogType.Tail,
      InvocationType: InvocationTypeEnum.EventType, // this is for asynchronous
    });

    const response: any = await this.client.send(command);

    logger.info("Lambda function to calculate matching score is triggered!!");

    // Return status code
    return response?.StatusCode;
  }

  async triggerResumeExtraction(email: string) {
    logger.info(" [service] Trigger Resume Extraction ");
    const payload = {
      USER_PK: "USR#EML#" + email,
      USER_DETAIL_SK: "ID#",
    };

    const command = new InvokeCommand({
      FunctionName:
        APP_CONSTANTS.LAMBDA_FUNCTION_NAMES.RESUME_EXTRACTION_LAMBDA_NAME,
      Payload: JSON.stringify(payload),
      // LogType: LogType.Tail,
      InvocationType: InvocationTypeEnum.EventType, // this is for asynchronous
    });

    const response: any = await this.client.send(command);
    // const result = Buffer.from(Payload as ArrayBuffer).toString();
    // const logs = Buffer.from(LogResult as string, "base64").toString();
    logger.info("result", response);
    logger.info("Lambda function to extract resume is triggered!!");
    return response?.StatusCode;
  }
}

// Export an instance of the InvokeLambda class
export default new InvokeLambdaService();
