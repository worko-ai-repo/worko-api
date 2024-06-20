// Import npm packages
import { Context, SQSEvent } from "aws-lambda";

// Import configurations
import APP_CONSTANTS from "./configs/constants.config";
import DBConfig from "./db/DB.config";

// Import local DTOs
import {
  SqsMsgBaseReqDto,
  SqsMsgReferralValidationMatchingScoreReqDto,
} from "./dtos/SqsEvent.dto";
import {
  EmailTemplatePlaceholderCAND_WELCOME_MSG,
  EmailTemplatePlaceholderEMP_WELCOME_MSG,
} from "./dtos/EmailTemplatePlaceholder.dto";

// Import local Enums
import { ReferralStatus } from "./enums/UserReferral.enum";
import { UserType } from "./enums/User.enum";
import { SqsMsgEventEnum } from "./enums/SqsEvent.enum";

// Import libraries
import { EmailSourceDestinationAddress } from "./libraries/email.library";

// Import local Services
import UserReferralService from "./services/UserReferral.service";
import UserDetailService from "./services/UserDetail.service";
import UserService from "./services/User.service";

// Import utils
import { BaseError } from "./utils/errors.util";
import HttpStatusCode from "./utils/http-codes.util";

// Import extensions, the extensions must be imported after all natural imports 
// and before any direct imports like this which defines something and adds to the current scope.
import "./extensions/string.extension";

// Import libraries
import "./libraries/logger.library";

/**
 * initDatabaseConfig
 * 
 * Initialise the database configurations
 */
const initDatabaseConfig = () => {
  const dbConf = new DBConfig();
  dbConf.init();
}

// initialize DB
initDatabaseConfig()

/**
 * Sends an error response.
 *
 * @param {any} error - The custom error object.
 * @param {string} message - The error message.
 * @param {boolean} consoleResponse - Wheather to console tthe response or not.
 * @returns {Promise<object>} The success response object.
 */
const sendErrResponse = async (
  error: any,
  message: string,
  consoleResponse: boolean = true
): Promise<object> => {
  // Prepare the response with required details
  const response = {
    statusCode: error.statusCode ?? HttpStatusCode.INTERNAL_SERVER_ERROR_500,
    body: JSON.stringify({
      message: message,
      error: error.message ?? "Internal Server Error",
    }),
  };

  // If asked then console the response in log
  if (consoleResponse) {
    global.logger.info("sendErrResponse: ", {
      filePath: __filename,
      methodName: "sendErrResponse",
      response: response
    });
  }

  return response;
};

/**
 * Sends a success response.
 *
 * @param {number} statusCode - The HTTP status code.
 * @param {string} message - The success message.
 * @param {boolean} consoleResponse - Wheather to console tthe response or not.
 * @returns {Promise<object>} The success response object.
 */
const sendSuccessResponse = async (
  statusCode: HttpStatusCode,
  message: string,
  consoleResponse: boolean = true
): Promise<object> => {
  // Prepare the response with required details
  const response = {
    statusCode: statusCode,
    body: JSON.stringify({
      message: message,
    }),
  };

  // If asked then console the response in log
  if (consoleResponse) {
    global.logger.info("sendSuccessResponse: ", {
      filePath: __filename,
      methodName: "sendSuccessResponse",
      response: response
    });
  }

  return response;
};

/**
 * sendWelcomeEmailToUser
 *
 * This function sends a welcome email to the user after their primary email is verified.
 *
 * @param {SqsMsgBaseReqDto} message - The SQS message payload.
 * @param {SQSEvent} event - The SQS event object.
 * @param {Context} context - The AWS Lambda context object.
 * @returns {Promise<object>} The response object.
 */
const sendWelcomeEmailToUser = async (
  message: SqsMsgBaseReqDto,
  event: SQSEvent,
  context: Context
): Promise<object> => {
  try {
    // Retrive the userSignupDetails by useremail provided in message .
    let userSignupDetails = await UserDetailService.get(message.userEmail);

    // thorw error if not found
    if (!userSignupDetails.count) {
      throw new BaseError(
        `The user details not found for the "${message.userEmail}" email address.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    // retrive userDetails and userTypes from userSignUpdetaisl.
    let userDetails = userSignupDetails[0];
    let userType = userDetails.userType[0];

    // If userType is Cand then send the Welcome Email to the provided user.
    if (userType === UserType.CAND) {
      // Prepare details required for sending the Email
      const candName: string = userDetails.name;
      const candEmail: string = userDetails.emailList.primary;

      // Prepare the necessary parameters required for the sendEmailToCandWelcomeMessage function
      const toAddress: EmailSourceDestinationAddress = {
        email: candEmail,
        fullName: candName,
      };
      const emailPlaceholders: EmailTemplatePlaceholderCAND_WELCOME_MSG = {
        candName: candName,
      };

      // Send a welcome email to the candidate
      await UserService.sendEmailToCandWelcomeMessage(
        emailPlaceholders,
        toAddress
      );
    }
    // If userType is EMP then send the Welcome Email to the provided user.
    else if (userType === UserType.EMP) {
      // Prepare details required for sending the Email
      const empName: string = userDetails.name;
      const empEmail: string = userDetails.emailList.primary;

      // Prepare the necessary parameters required for the sendEmailToEmpWelcomeMessage function
      const toAddress: EmailSourceDestinationAddress = {
        email: empEmail,
        fullName: empName,
      };
      const emailPlaceholders: EmailTemplatePlaceholderEMP_WELCOME_MSG = {
        empName: empName,
      };

      // Send a welcome email to the employer
      await UserService.sendEmailToEmpWelcomeMessage(
        emailPlaceholders,
        toAddress
      );
    }

    // Retrun the response
    return sendSuccessResponse(
      HttpStatusCode.OK_200,
      "The Welcome email has been sent successfully."
    );
  } catch (error: any) {
    // Handle error
    return sendErrResponse(error, "Failed to send the welcome email.");
  }
};

/**
 * validateReferralMatchingScore
 *
 * This function validates the referral matching score and updates the referral status if the score is below the minimum threshold.
 *
 * @param {SqsMsgReferralValidationMatchingScoreReqDto} message - The SQS message payload containing the referral ID and user email.
 * @param {SQSEvent} event - The SQS event object.
 * @param {Context} context - The AWS Lambda context object.
 * @returns {Promise<object>} The response object.
 */
const validateReferralMatchingScore = async (
  message: SqsMsgReferralValidationMatchingScoreReqDto,
  event: SQSEvent,
  context: Context
): Promise<object> => {
  try {
    // retrive the referralid and userEmail from message.
    const { referralId } = message.context;
    const { userEmail } = message;

    // Retrive the user referraldetails from its referralId
    const userReferralDetails = await UserReferralService.getReferralById(
      referralId
    );

    // throw error if not found
    if (!userReferralDetails.count) {
      throw new BaseError(
        `The referral details not found for the "${referralId}" referral id.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    // extract the matchingScore from userReferralDetails
    const userReferralMatchingScore = userReferralDetails[0].matchingScore;

    // Validate matchingScore by constant
    if (
      userReferralMatchingScore < APP_CONSTANTS.REFERRAL_MINIMUM_MATCHING_SCORE
    ) {
      await UserReferralService.updateStatus(
        referralId,
        userEmail,
        ReferralStatus.CANCELLED
      );
    }

    // return the sucessfull response
    return sendSuccessResponse(
      HttpStatusCode.OK_200,
      "Referral matching score validated successfully."
    );
  } catch (error: any) {
    // Handle error
    return sendErrResponse(
      error,
      "An error occurred while validating the referral matching score."
    );
  }
};

/**
 * Handles incoming SQS events by parsing the message body and dispatching the appropriate function based on the event type.
 *
 * @param {SQSEvent} event - The SQS event object containing the message(s) to be processed.
 * @param {Context} context - The AWS Lambda context object.
 * @returns {Promise<object>} The response object.
 * @throws {Error} - Throws an error if no event matches the message event type.
 */
export const handler = async (event: SQSEvent, context: Context): Promise<object> => {
  try {
    console.log("App event trigger: Received event from SQS: ", event);

    // Retrieve the message body from the SQS event
    let messageBody = event.Records[0].body;
    console.log("App event trigger: messageBody: " + messageBody);

    // Convert the message body to a string if it's not already a string
    if (typeof messageBody !== 'string') {
      messageBody = JSON.stringify(messageBody);
      console.log("App event trigger: messageBody (converted to string): " + messageBody);
    }

    // Parse the message body as JSON
    const parsedMessageBody = JSON.parse(messageBody);
    console.log("App event trigger: parsedMessageBody: ", parsedMessageBody);
    console.log("App event trigger: typeof parsedMessageBody: ", typeof parsedMessageBody);

    // Parse the entire message as JSON
    const parsedMessage: SqsMsgBaseReqDto = parsedMessageBody;
    const messageEvent = parsedMessage.event;
    console.log("App event trigger: parsedMessage: ", parsedMessage);
    console.log("App event trigger: messageEvent: ", messageEvent);

    // Check the message event type and dispatch the appropriate function based on the event type.
    if (messageEvent === SqsMsgEventEnum.REFERRAL_VALIDATE_MATCHING_SCORE) {
      return validateReferralMatchingScore(
        parsedMessage as SqsMsgReferralValidationMatchingScoreReqDto,
        event,
        context
      );
    } else if (messageEvent === SqsMsgEventEnum.USER_SEND_WELCOME_EMAIL) {
      return sendWelcomeEmailToUser(parsedMessage, event, context);
    }

    // Throw an error if no event matches the message event type.
    throw new Error(`The provided event ${messageEvent} is invalid, therefore it cannot be processed.`);
  } catch (error: any) {
    return sendErrResponse(error, "An unexpected error occurred.");
  }
}