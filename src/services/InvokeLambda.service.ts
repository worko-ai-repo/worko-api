// import lambda related libraries
import {
  InvokeCommand,
  InvokeCommandOutput,
  LambdaClient,
} from "@aws-sdk/client-lambda";
import { APIGatewayProxyResult } from "aws-lambda";

// import constants
import APP_CONSTANTS from "../configs/constants.config";

// import dtos
import { ParsedJobDescriptionApiDto } from "../admin/dtos/CompanyJob.dto";
import { InvokeLambdaParsedJobDescriptionDto } from "../dtos/InvokeLambda.dto";

// import daos
import userDetailDao from "../daos/UserDetail.dao";

// import enums
import { MatchingScoreEntityEnum } from "../enums/Common.enum";
import { InvocationTypeEnum } from "../enums/InvokeLambda.enum";

// import utils
import HttpStatusCode from "../utils/http-codes.util";

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

  /**
   * triggerParseJobDescription
   *
   * Triggers the Lambda function to parse the job description.
   *
   * @param {ParsedJobDescriptionApiDto} parsedJobDescriptionApiDto - The DTO containing the job description to be parsed.
   * @returns {Promise<APIGatewayProxyResult>} The decoded payload from the Lambda response, which includes the parsed job details.
   */
  async triggerParseJobDescription(
    parsedJobDescriptionApiDto: ParsedJobDescriptionApiDto
  ): Promise<APIGatewayProxyResult> {
    try {
      // log the info
      global.logger.info(" [service] Trigger Parse Job Description ", {
        filePath: __filename,
        methodName: this.triggerParseJobDescription.name,
      });

      // Prepare Payload
      const parsedJobDescriptionPayload: InvokeLambdaParsedJobDescriptionDto = {
        JOB_DESC: parsedJobDescriptionApiDto.jobDescription,
      };

      /**
       * command
       * 
       * Prepare the command
       *
       * Sample Output of the `command`:
       *  {
            "input": {
              "FunctionName": "worko-job-description-parser",
              "InvocationType": "RequestResponse",
              "Payload": "{\"JOB_DESC\":\"Job Title: Backend Developer Location: Hyderabad, India / Remote Summary:......"}"
            },
            "middlewareStack": {}
      *  }
      */
      const command: InvokeCommand = new InvokeCommand({
        FunctionName:
          APP_CONSTANTS.LAMBDA_FUNCTION_NAMES
            .JOB_DESCRIPTION_PARSER_LAMBDA_NAME,
        Payload: JSON.stringify(parsedJobDescriptionPayload),
        InvocationType: InvocationTypeEnum.RequestResponseType,
      });

      /**
       * Invoke the Lambda function and get the response
       * 
       * Sample Output of the `response`:
       * {
          "$metadata": {
              "httpStatusCode": 200,
              "requestId": "7a708443-8c16-4a63-866f-eef79841d2e4",
              "attempts": 1,
              "totalRetryDelay": 0
          },
          "ExecutedVersion": "$LATEST",
          "Payload": { 
              "0": 91,
              "1": 123,
              "2": 34,
              "3": 116,
              "4": 121,
              "5": 112,
              .
              .
              "903": 85,
              "904": 73,
          },
          "StatusCode": 200
        }
      */
      let response: InvokeCommandOutput = await this.client.send(command);

      // Decode the Payload
      let decodedPayload: APIGatewayProxyResult;

      /**
       * Check if Payload is present and decode it
       *
       * @see https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_lambda_code_examples.html#actions
       */
      if (response["Payload"]) {
        /**
         * @see https://www.w3schools.com/nodejs/met_buffer_from.asp
         * 
         * Sample Output of the `buffer`:
         *  {
              "data": [
                  123,
                  34,
                  115,
                  .
                  .
                  67,
                  125,
                  34,
                  125
              ],
              "type": "Buffer"
            },
        */
        const buffer: Buffer = Buffer.from(response["Payload"]);

        /**
         * 1. (method) Buffer.toString(encoding?: BufferEncoding, start?: number, end?: number): string
         * 2. Decodes buf to a string according to the specified character encoding inencoding. 
         *    start and end may be passed to decode only a subset of buf.
         * 3. If encoding is 'utf8' and a byte sequence in the input is not valid UTF-8, 
         *    then each invalid byte is replaced with the replacement character U+FFFD.
         * 4. The maximum length of a string instance (in UTF-16 code units) is available as constants.MAX_STRING_LENGTH.
         * 
         * Sample Output of the `decodedString`:
         *
         * "{\"statusCode\": 200, \"headers\": {\"Content-Type\": \"application/json\"}, \"body\": \"{\\\"Job Title\\\": \\\"Backend Developer\\\", 
           \\\"Salary Range\\\": null, \\\"Experience Range\\\": null, \\\"Number of Openings\\\": null, 
          \\\"Work Mode\\\": \\\"Hyderabad, India / Remote\\\", \\\"Location\\\": \\\"Hyderabad, India / Remote\\\", 
          \\\"Notice Period (Months)\\\": null, \\\"Type of Employment\\\": null, \\\"Department\\\": null, 
          \\\"Core Skills\\\": [\\\"JavaScript\\\", \\\"HTML\\\", \\\"CSS\\\", \\\"MERN stack\\\", 
          \\\"React.js\\\", \\\"Node.js\\\", \\\"Express.js\\\", \\\"MongoDB\\\", \\\"PostgreSQL\\\", \\\"SQLite\\\", 
          \\\"Redux\\\", \\\"Bootstrap\\\", \\\"Docker\\\", \\\"MVC architecture\\\", \\\"Git\\\", \\\"GitHub\\\", 
          \\\"Postman\\\"], \\\"Soft Skills\\\": null, \\\"Technical Skills\\\": [\\\"RESTful APIs\\\", \\\"Web services\\\", 
          \\\"NoSQL databases\\\", \\\"SQL databases\\\", \\\"Socket.IO\\\", \\\"Responsive user interfaces\\\", \\\"Unit testing\\\", 
          \\\"Debugging\\\", \\\"Code reviews\\\", \\\"Application optimization\\\", \\\"ORM/ODM tools (Mongoose, Sequelize)\\\"], 
          \\\"Good to Have Skills\\\": [\\\"Experience with Docker and containerization\\\"]}\"}"
        */
        const decodedString: string = buffer.toString("utf8");

        // Parse JSON
        global.logger.info(`Parsing JSON...`);
        decodedPayload = JSON.parse(decodedString);

        /**
         * @see https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html#http-api-develop-integrations-lambda.response
         * 
         * Sample Output of the `decodedPayload`:
         * {
             "body": "{\"Job Title\": \"Backend Developer\", \"Salary Range\": null, \"Good command over  Skills\": [\"Experience with Docker and containerization\"]....}",
              "headers": {
                "Content-Type": "application/json"
              },
              "statusCode": 200
        * }
        */
        global.logger.debug(`Decoded Payload Response Status Code:`, {
          decodedPayloadStatusCode: decodedPayload["statusCode"],
        });
      } else {
        global.logger.warn(`No Payload found in the Lambda response`);
        decodedPayload = {
          statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR_500,
          body: "No Payload found in the Lambda response",
        };
      }

      // return the decoded payload as response
      return decodedPayload;
    } catch (error) {
      global.logger.debug(`Error message while parsing job description`, {
        errorMessage: error,
      });

      // return the error response
      return {
        statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR_500,
        body: `Unable to parse job description`,
      };
    }
  }
}

// Export an instance of the InvokeLambda class
export default new InvokeLambdaService();
