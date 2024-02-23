import { InvokeCommand, LambdaClient, LogType } from "@aws-sdk/client-lambda";
import APP_CONSTANTS from "../configs/constants.config";

class InvokeLambdaService {
   client = new LambdaClient({});

  async triggerMatchingScoreCalculation(email: string, referralId: string) {
    logger.info("Trigger Matching Score Calculation [service]");
    const payload = {
      USER_PK: 'USR#EML#'+email,
      USER_DETAIL_SK: 'ID#',
      USER_REFERAL_SK: 'REF#ID#'+referralId,
    };

    const command = new InvokeCommand({
      FunctionName: APP_CONSTANTS.MATCHING_SCORE_LAMBDA_NAME,
      Payload: JSON.stringify(payload),
      // LogType: LogType.Tail,
      InvocationType: "Event"    // this is for asynchronous
    });

    const response: any = await this.client.send(command);
    // const result = Buffer.from(Payload as ArrayBuffer).toString();
    // const logs = Buffer.from(LogResult as string, "base64").toString();
    logger.info("result", response);
    logger.info("Lambda function to calculate matching score is triggered!!")
    return response?.StatusCode ;
  }

  async triggerResumeExtraction(email: string) {
    logger.info(" [service] Trigger Resume Extraction ");
    const payload = {
      USER_PK: 'USR#EML#'+email,
      USER_DETAIL_SK: 'ID#'
    };

    const command = new InvokeCommand({
      FunctionName: APP_CONSTANTS.RESUME_EXTRACTION_LAMBDA_NAME,
      Payload: JSON.stringify(payload),
      // LogType: LogType.Tail,
      InvocationType: "Event"    // this is for asynchronous
    });

    const response: any = await this.client.send(command);
    // const result = Buffer.from(Payload as ArrayBuffer).toString();
    // const logs = Buffer.from(LogResult as string, "base64").toString();
    logger.info("result", response);
    logger.info("Lambda function to extract resume is triggered!!")
    return response?.StatusCode ;
  }
}

// Export an instance of the InvokeLambda class
export default new InvokeLambdaService();
