// Import AWS Lambda types
import { Context, ScheduledEvent } from 'aws-lambda';

// Import services
import scheduleJobService from './services/ScheduleJob.service';
import userReferralService from './services/UserReferral.service';

// Import enums
import { ScheduleJobType } from './enums/ScheduleJob.enum';

// Import error handling utilities
import { BaseError } from './utils/errors.util';
import HttpStatusCode from './utils/http-codes.util';

// Import database configuration
import DBConfig from './db/DB.config';

// Import Dtos
import { ScheduleJobRefReviewAcceptanceStatusInputDto } from './dtos/ScheduleJob.dto';

// Import logger library
import './libraries/logger.library';

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
 * Handles the scheduled event and performs the necessary actions based on the schedule job type.
 *
 * @param {ScheduledEvent} event - The scheduled event object.
 * @param {Context} context - The context object.
 * @return {Promise<object>} A promise that resolves with the response object.
 */
export const handler = async (event: ScheduledEvent, context: Context): Promise<object> => {
    try {
        // Log receipt of the event
        global.logger.info("App scheduler handler: Received event from scheduler: ", {
            filePath: __filename,
            methodName: "handler",
            event: event,
            context: context
        });

        // Parse the scheduleJobId from the event detail
       const {scheduleJobId} = JSON.parse(event.detail);

        global.logger.info("App scheduler handler: Parsed event details: ", {
            filePath: __filename,
            methodName: "handler",
            scheduleJobId: scheduleJobId,
            eventDetails : JSON.parse(event.detail)
        });

        // Fetch the schedule job using the scheduleJobId
        const scheduleJob = await scheduleJobService.getScheduleJobById(scheduleJobId);
        
        // Check if the schedule job exists
        if (!scheduleJob) {
            throw new BaseError(`Schedule job ${scheduleJobId} not found`);
        }
        
        // extract the details from scheduled job from local database
        let inputDetails: ScheduleJobRefReviewAcceptanceStatusInputDto = scheduleJob.input as ScheduleJobRefReviewAcceptanceStatusInputDto;
        
        global.logger.info("App scheduler handler: scheduleJob input Details: ", {
            filePath: __filename,
            methodName: "handler",
            inputDetails: inputDetails
        });
        
        // Process the schedule job based on its type
        switch (scheduleJob.type) {
            case ScheduleJobType.REFERRAL_REVIEW_ACCEPTANCE_STATUS:
                global.logger.info("App scheduler handler: referralId and userEmail: ", {
                    filePath: __filename,
                    methodName: "handler",
                    referralId: inputDetails.referralId,
                    userEmail: inputDetails.userEmail
                });

                // Call the user referral service to review the referral status
                await userReferralService.reviewReferralAcceptanceStatus(inputDetails.referralId, inputDetails.userEmail);
                break;

            default:
                // If no matching schedule job type is found, throw an error
                throw new BaseError(`No schedule found for job type: ${scheduleJob.type}`);
        }

        // Mark the schedule job as completed
        await scheduleJobService.completeScheduleJob(scheduleJobId);

        // Return success response
        return sendSuccessResponse(
            HttpStatusCode.OK_200,
            `Schedule job ${scheduleJobId} processed successfully.`
        );
    } catch (error: any) {
        // Return error response
        return sendErrResponse(
            error,
            error?.errorMsg ?? error?.message ?? "An error occurred while processing the scheduled job."
        );
    }
};