// Import npm packages
import { Context, SQSEvent } from "aws-lambda";

// Import extensions, the extensions must be imported after all natural imports
// and before any direct imports like this which defines something and adds to the current scope.
import "./extensions/string.extension";

// Import libraries
import "./libraries/logger.library";

// Import configurations
import DBConfig from "./db/DB.config";

// Import local DTOs
import {
  SqsMsgBaseReqDto,
  SqsMsgReferralValidationMatchingScoreReqDto,
  SqsMsgReviewReferralAcceptanceStatusReqDto,
} from "./dtos/SqsEvent.dto";

// Import local Enums
import { SqsMsgEventEnum } from "./enums/SqsEvent.enum";

// Import local Services
import UserReferralService from "./services/UserReferral.service";
import UserDetailService from "./services/UserDetail.service";

// Import utils
import { BaseError } from "./utils/errors.util";
import HttpStatusCode from "./utils/http-codes.util";

/**
 * initDatabaseConfig
 *
 * Initialise the database configurations
 */
const initDatabaseConfig = () => {
  // Create a new database configuration instance
  const dbConf = new DBConfig();
  // Initialize the database configuration
  dbConf.init();
};

// Initialize the database configuration
initDatabaseConfig();

/**
 * Sends an error response.
 *
 * @param {any} error - The custom error object.
 * @param {string} message - The error message.
 * @param {boolean} consoleResponse - Whether to console the response or not.
 * @returns {Promise<object>} The error response object.
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

  // If consoleResponse is true, log the response
  if (consoleResponse) {
    global.logger.info("sendErrResponse: ", {
      filePath: __filename,
      methodName: "sendErrResponse",
      response: response,
    });
  }

  return response;
};

/**
 * Sends a success response.
 *
 * @param {number} statusCode - The HTTP status code.
 * @param {string} message - The success message.
 * @param {boolean} consoleResponse - Whether to console the response or not.
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

  // If consoleResponse is true, log the response
  if (consoleResponse) {
    global.logger.info("sendSuccessResponse: ", {
      filePath: __filename,
      methodName: "sendSuccessResponse",
      response: response,
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
    // Use the sendWelcomeEmail function from UserDetailService
    const emailSent = await UserDetailService.sendWelcomeEmail(message.userEmail);

    // Check if the email was sent
    if (emailSent) {
      // Return success response if email was sent successfully
      return sendSuccessResponse(
        HttpStatusCode.OK_200,
        `The welcome email for the "${message.userEmail}" email has been sent successfully.`
      );
    } else {
      // Throw custom error if email sending failed
      throw new BaseError(`Unable to send welcome email for the "${message.userEmail}" email.`);
    }
  } catch (error: any) {
    // Return error response if email sending failed
    return sendErrResponse(
      error,
      error?.errorMsg ?? error?.message
    );
  }
};

/**
 * Validates the referral matching score and updates the referral status if necessary.
 * If the score is above the minimum threshold, it creates a delayed message to check the status after 5 days.
 *
 * @param {SqsMsgReferralValidationMatchingScoreReqDto} message - The SQS message payload containing the referral ID and user details
 * @param {SQSEvent} event - The SQS event object
 * @param {Context} context - The AWS Lambda context object
 * @returns {Promise<object>} The response object
 */
const validateReferralMatchingScore = async (
  message: SqsMsgReferralValidationMatchingScoreReqDto,
  event: SQSEvent,
  context: Context
): Promise<object> => {
  try {
    global.logger.debug(`message: ${message}`, {
      filePath: __filename,
      methodName: "validateReferralMatchingScore",
    });

    // Retrieve the necessary information from the message
    const { referralId } = message.context;
    const { userEmail, userId } = message;


    // Validate the referral matching score
    const isReferralMatchingScoreValid: boolean = await UserReferralService.validateReferralMatchingScore(
        referralId,
        userEmail,
        userId
      );

    // Return success response if validation was successful
    if (isReferralMatchingScoreValid) {
      return sendSuccessResponse(
        HttpStatusCode.OK_200,
        "Referral matching score validated successfully."
      );
    } else {
      // Throw custom error if validation failed
      throw new BaseError(`Unable to validate referral matching score for referral ID "${referralId}".`);
    }
  } catch (error: any) {
    // Return error response if validation failed
    return sendErrResponse(
      error,
      error?.errorMsg ?? error?.message
    );
  }
};

/**
 * Reviews the referral acceptance status after 5 days and rejects it if still in "awaiting" status.
 *
 * @param {SqsMsgReviewReferralAcceptanceStatusReqDto} message - The SQS message payload containing the referral ID and user email
 * @param {SQSEvent} event - The SQS event object
 * @param {Context} context - The AWS Lambda context object
 * @returns {Promise<object>} The response object
 */
const reviewReferralAcceptanceStatus = async (
  message: SqsMsgReviewReferralAcceptanceStatusReqDto,
  event: SQSEvent,
  context: Context
): Promise<object> => {
  try {
    // Retrieve the necessary information from the message
    const { referralId } = message.context;
    const { userEmail } = message;

    // Review the referral acceptance status
    const isReferralAcceptanceStatusValid = await UserReferralService.reviewReferralAcceptanceStatus(
      referralId,
      userEmail
    );

    // Return success response if review was successful
    if (isReferralAcceptanceStatusValid) {
      return sendSuccessResponse(
        HttpStatusCode.OK_200,
        "Referral acceptance status reviewed successfully."
      );
    } else {
      // Throw custom error if review failed
      throw new BaseError(`Unable to review referral acceptance status for referral ID "${referralId}".`);
    }
  } catch (error: any) {
    // Return error response if review failed
    return sendErrResponse(
      error,
      error?.errorMsg ?? error?.message
    );
  }
};

/**
 * Main handler function for processing SQS events.
 * It determines the type of event and calls the appropriate function to handle it.
 *
 * @param {SQSEvent} event - The SQS event object
 * @param {Context} context - The AWS Lambda context object
 * @returns {Promise<object>} The response object
 */
export const handler = async (
  event: SQSEvent,
  context: Context
): Promise<object> => {
  try {
    // Log received SQS event
    global.logger.info("App event trigger: Received event from SQS: ", {
      filePath: __filename,
      methodName: "handler",
      event: event,
    });

    // Extract message body from event
    let messageBody = event.Records[0].body;
    global.logger.info(
      `App event trigger: messageBody: ${messageBody}`,
      {
        filePath: __filename,
        methodName: "handler",
      }
    );

    // Convert message body to string if not already a string
    if (typeof messageBody !== "string") {
      messageBody = JSON.stringify(messageBody);
      global.logger.info(
        `App event trigger: messageBody (converted to string): ${messageBody}`,
        {
          filePath: __filename,
          methodName: "handler",
        }
      );
    }

    // Parse message body
    const parsedMessageBody = JSON.parse(messageBody);
    global.logger.info("App event trigger: parsedMessageBody: ", {
      filePath: __filename,
      methodName: "handler",
      parsedMessageBody: parsedMessageBody,
    });

    // Extract message and event type
    const parsedMessage: SqsMsgBaseReqDto = parsedMessageBody;
    const messageEvent = parsedMessage.event;
    global.logger.info("App event trigger: parsedMessage and messageEvent: ", {
      filePath: __filename,
      methodName: "handler",
      parsedMessage: parsedMessage,
      messageEvent: messageEvent,
    });

    // Handle different event types
    if (messageEvent === SqsMsgEventEnum.REFERRAL_VALIDATE_MATCHING_SCORE) {
      return validateReferralMatchingScore(
        parsedMessage as SqsMsgReferralValidationMatchingScoreReqDto,
        event,
        context
      );
    } else if (
      messageEvent === SqsMsgEventEnum.REFERRAL_REVIEW_ACCEPTANCE_STATUS) {
      return reviewReferralAcceptanceStatus(
        parsedMessage as SqsMsgReviewReferralAcceptanceStatusReqDto,
        event,
        context
      );
    } else if (messageEvent === SqsMsgEventEnum.USER_SEND_WELCOME_EMAIL) {
      return sendWelcomeEmailToUser(parsedMessage, event, context);
    }

    // Throw error if event type is invalid
    throw new Error(
      `The provided event ${messageEvent} is invalid, therefore it cannot be processed.`
    );
  } catch (error: any) {
    // Return error response if an unexpected error occurred
    return sendErrResponse(error, "An unexpected error occurred.");
  }
};
