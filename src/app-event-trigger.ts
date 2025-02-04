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
  SqsMsgCorporateBulkJDResumeSendEmailAndWhatsappNotificationReqDto,
  SqsMsgJobApplicationValidationMatchingScoreReqDto,
  SqsMsgReferralValidationMatchingScoreReqDto,
  SqsMsgReviewReferralAcceptanceStatusReqDto,
} from "./dtos/SqsEvent.dto";

// Import local Enums
import { SqsMsgEventEnum } from "./enums/SqsEvent.enum";

// Import local Services
import UserReferralService from "./services/UserReferral.service";
import UserDetailService from "./services/UserDetail.service";
import { userJobApplicationServiceObj } from "./services/UserJobApplication.service";
import { corporateBulkJdResumeServiceObj } from "./services/CorporateBulkJdResume.service";

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
 * validateUserJobApplicationMatchingScore
 * 
 * Validates the job application matching score and updates the job application status if necessary.
 *
 * @param {SqsMsgJobApplicationValidationMatchingScoreReqDto} message - The SQS message payload containing the job application request ID and user details
 * @param {SQSEvent} event - The SQS event object
 * @param {Context} context - The AWS Lambda context object
 * @returns {Promise<object>} The response object
 */
const validateUserJobApplicationMatchingScore = async (
  message: SqsMsgJobApplicationValidationMatchingScoreReqDto,
  event: SQSEvent,
  context: Context
): Promise<object> => {
  try {
    global.logger.debug(`Details of sqs event for job application matching score validation: `, {
      filePath: __filename,
      methodName: "validateUserJobApplicationMatchingScore",
      message: message,
      event: event,
      context: context
    });

    // Retrieve the necessary information from the message
    const { jobApplicationRequestId } = message.context;
    const { userEmail, userId } = message;

    // Validate the job application matching score
    const isjobApplicationMatchingScoreValid: boolean =
      await userJobApplicationServiceObj.validateUserJobApplicationMatchingScore(
        jobApplicationRequestId,
        userEmail,
        userId
      );

    global.logger.debug(`Details of job application after matching score validation: `,{
      filePath: __filename,
      methodName: "validateUserJobApplicationMatchingScore",
      isjobApplicationMatchingScoreValid: isjobApplicationMatchingScoreValid,
      jobApplicationRequestId: jobApplicationRequestId,
      userEmail: userEmail,
      userId: userId
    })

    // Return success response if validation was successful
    if (isjobApplicationMatchingScoreValid) {
      global.logger.info(`Job application matching score validated successfully.`,{
        filePath: __filename,
        methodName: "validateUserJobApplicationMatchingScore",
        jobApplicationRequestId: jobApplicationRequestId
      });

      return sendSuccessResponse(
        HttpStatusCode.OK_200,
        "Job application matching score validated successfully."
      );
    } else {
      // Throw custom error if validation failed
      throw new BaseError(
        `Unable to validate job application matching score for job application".`,
        HttpStatusCode.BAD_REQUEST_400
      );
    }
  } catch (error: any) {
    // Return error response if validation failed
    return sendErrResponse(error, error?.errorMsg ?? error?.message);
  }
};

/**
 * corporateBulkJdResumeSendEmailAndWhatsappNotificationAsCandidate
 *
 * Sends email and WhatsApp notification to candidate based on their resume matching score
 * for a specific corporate bulk job description.
 * 
 * When corporate admin/recruiter or worko-admin upload a bulk resumes for a particular job description, 
 * And after the process of matching is done, then this event will be triggered to send email and whatsapp notification
 * to the candidate(Who is not regeistered user on worko).
 *
 * @param {SqsMsgCorporateBulkJDResumeSendEmailAndWhatsappNotificationReqDto} message - The SQS message payload containing the corporate bulk job description resume ID and user details
 * @param {SQSEvent} event - The SQS event object
 * @param {Context} context - The AWS Lambda context object
 * @returns {Promise<object>} The response object
 */
const corporateBulkJdResumeSendEmailAndWhatsappNotificationAsCandidate = async (
  message: SqsMsgCorporateBulkJDResumeSendEmailAndWhatsappNotificationReqDto,
  event: SQSEvent,
  context: Context
): Promise<object> => {
  try {
    global.logger.debug(
      `Details of sqs event for send email and whatsapp message to candidate(Who is not registered user) [SQS Handler]: `,
      {
        filePath: __filename,
        methodName: "corporateBulkJdResumeSendEmailAndWhatsappNotificationAsCandidate",
        message: message,
        event: event,
        context: context,
      }
    );

    // Retrieve the necessary information from the message
    const { corporateBulkJdResumeId } = message.context;

    // Send email and whatsapp message to candidate
    const isEmailAndWhatsappSentToBulkCvCandidate: boolean =
      await corporateBulkJdResumeServiceObj.corporateBulkJdResumeSendEmailAndWhatsappNotificationAsCandidate(
        corporateBulkJdResumeId
      );

    global.logger.debug(
      `Details of send email and whatsapp message to candidate after triggering send email and whatsapp libraries: `,
      {
        filePath: __filename,
        methodName:
          "corporateBulkJdResumeSendEmailAndWhatsappNotificationAsCandidate",
        isEmailAndWhatsappSentToBulkCvCandidate:
          isEmailAndWhatsappSentToBulkCvCandidate,
      }
    );

    // Return success response if message was successful
    if (isEmailAndWhatsappSentToBulkCvCandidate) {
      global.logger.info(
        `Email and whatsapp message to candidate sent successfully.`,
        {
          filePath: __filename,
          methodName:
            "corporateBulkJdResumeSendEmailAndWhatsappNotificationAsCandidate",
          corporateBulkJdResumeId,
        }
      );

      return sendSuccessResponse(
        HttpStatusCode.OK_200,
        "Email and whatsapp message to candidate sent successfully."
      );
    } else {
      // Throw custom error if validation failed
      throw new BaseError(
        `Unable to send email and whatsapp message to candidate".`,
        HttpStatusCode.BAD_REQUEST_400
      );
    }
  } catch (error: any) {
    // Return error response if validation failed
    return sendErrResponse(error, error?.errorMsg ?? error?.message);
  }
}

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
    let messageBody: string = event.Records[0].body;
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

    // Extract message and event type
    const parsedMessage: SqsMsgBaseReqDto = parsedMessageBody;
    const messageEvent = parsedMessage.event;
    global.logger.info("App event trigger: parsedMessage and messageEvent: ", {
      filePath: __filename,
      methodName: "handler",
      parsedMessageBody: parsedMessageBody,
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
    } else if (messageEvent === SqsMsgEventEnum.JOB_APPLICATION_VALIDATE_MATCHING_SCORE) {
      return validateUserJobApplicationMatchingScore(
        parsedMessage as SqsMsgJobApplicationValidationMatchingScoreReqDto,
        event,
        context
      );
    } else if (messageEvent === SqsMsgEventEnum.CORPORATE_BULK_JD_RESUME_SEND_EMAIL_AND_WHATSAPP_NOTIFICATION) {
      return corporateBulkJdResumeSendEmailAndWhatsappNotificationAsCandidate(
        parsedMessage as SqsMsgCorporateBulkJDResumeSendEmailAndWhatsappNotificationReqDto,
        event,
        context
      );
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
