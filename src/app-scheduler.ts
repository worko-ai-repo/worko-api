// Import AWS Lambda types
import { Context, ScheduledEvent } from 'aws-lambda';

// Import extensions (must be done after natural imports and before any scope-modifying imports)
import './extensions/string.extension';

// Import logger library
import './libraries/logger.library';

// Import services
import scheduleJobService from './services/ScheduleJob.service';
import userReferralService from './services/UserReferral.service';
import UserExperienceService from './services/UserExperience.service';
import { userReferralEmpServiceObj } from './services/UserReferralEmp.service';
import { corporateBulkJdResumeServiceObj } from './services/CorporateBulkJdResume.service';

// Import enums
import { ScheduleJobType } from './enums/ScheduleJob.enum';

// Import error handling utilities
import { BaseError } from './utils/errors.util';
import HttpStatusCode from './utils/http-codes.util';

// Import database configuration
import DBConfig from './db/DB.config';

// Import Dtos
import { ScheduleJobCorporateBulkJdResumeNotificationsInputDto, ScheduleJobReferralReminderInputDto, ScheduleJobRefReviewAcceptanceStatusInputDto, ScheduleJobWhatsAppReminderInputDto } from './dtos/ScheduleJob.dto';

/**
 * Initializes the database configuration.
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
 * @param {any} error - The error object.
 * @param {string} message - The error message to return in the response.
 * @param {boolean} [consoleResponse=true] - Whether to log the error response to the console.
 * @returns {Promise<object>} The formatted error response object.
 */
const sendErrResponse = async (
    error: any,
    message: string,
    consoleResponse: boolean = true
): Promise<object> => {
    // Prepare the error response
    const response = {
        statusCode: error.statusCode ?? HttpStatusCode.INTERNAL_SERVER_ERROR_500,
        body: JSON.stringify({
            message: message,
            error: error.message ?? 'Internal Server Error',
        }),
    };

    // Log the response if required
    if (consoleResponse) {
        global.logger.info('sendErrResponse: ', {
            filePath: __filename,
            methodName: 'sendErrResponse',
            response: JSON.stringify(response),
        });
    }

    return response;
};

/**
 * Sends a success response.
 *
 * @param {number} statusCode - The HTTP status code to return.
 * @param {string} message - The success message to return in the response.
 * @param {boolean} [consoleResponse=true] - Whether to log the success response to the console.
 * @returns {Promise<object>} The formatted success response object.
 */
const sendSuccessResponse = async (
    statusCode: HttpStatusCode,
    message: string,
    consoleResponse: boolean = true
): Promise<object> => {
    // Prepare the success response
    const response = {
        statusCode: statusCode,
        body: JSON.stringify({
            message: message,
        }),
    };

    // Log the response if required
    if (consoleResponse) {
        global.logger.info('sendSuccessResponse: ', {
            filePath: __filename,
            methodName: 'sendSuccessResponse',
            response: response,
        });
    }

    return response;
};

/**
 * Handles the scheduled event and processes actions based on the schedule job type.
 *
 * @param {ScheduledEvent} event - The scheduled event object containing job details.
 * @param {Context} context - The AWS Lambda context object.
 * @return {Promise<object>} A promise that resolves with the response object.
 */
export const handler = async (event: any, context: Context): Promise<object> => {
    try {
        // Log the receipt of the event
        global.logger.info('App scheduler handler: Received event from scheduler: ', {
            filePath: __filename,
            methodName: 'handler',
            event: JSON.stringify(event),
            eventTypeOf: typeof event,
            context: JSON.stringify(context) // @todo Check with the team if context logging is necessary.
        });

        // Extract scheduleJobId from the event object
        const scheduleJobId = event.scheduleJobId;

        // Fetch the scheduled job by its ID and validate its existence
        const scheduleJob = await scheduleJobService.getScheduleJobById(scheduleJobId);
        if (!scheduleJob) {
            throw new BaseError(`The schedule job with the provided ID "${scheduleJobId}" was not found.`);
        }

        global.logger.info('App scheduler handler: scheduleJob input details: ', {
            filePath: __filename,
            methodName: 'handler',
            scheduledJob: scheduleJob,
        });

        // Process the scheduled job based on its type
        switch (scheduleJob.type) {
          /**
           * REFERRAL_REVIEW_ACCEPTANCE_STATUS
           *
           * Processes the Referral Review Acceptance Status schedule job.
           */
          case ScheduleJobType.REFERRAL_REVIEW_ACCEPTANCE_STATUS: {
            const referralReviewAcceptanceStatusInputDetails = scheduleJob.input as ScheduleJobRefReviewAcceptanceStatusInputDto;

            global.logger.info(
              "App scheduler handler: referralId and userEmail: ",
              {
                filePath: __filename,
                methodName: "handler",
                referralId: referralReviewAcceptanceStatusInputDetails["referralId"],
                userEmail: referralReviewAcceptanceStatusInputDetails["userEmail"],
              }
            );

            // Call the user referral service to review the referral acceptance status
            await userReferralService.reviewReferralAcceptanceStatus(
              referralReviewAcceptanceStatusInputDetails["referralId"],
              referralReviewAcceptanceStatusInputDetails["userEmail"]
            );
            break;
          }

          /**
           * EMP_WORK_EMAIL_VERIFICATION_REMINDER
           *
           * Handles the Employee Work Email Verification Reminder schedule job.
           *
           * @description Sends a WhatsApp reminder to employees about pending work email (corporate email) verification,
           *              triggered if the work email is not verified within 24 hours after creation.
           */
          case ScheduleJobType.EMP_WORK_EMAIL_VERIFICATION_REMINDER:{
            const input =
              scheduleJob.input as ScheduleJobWhatsAppReminderInputDto;
            global.logger.info(
              "App scheduler handler: referralId and userEmail [EMP_WORK_EMAIL_VERIFICATION_REMINDER]: ",
              {
                filePath: __filename,
                methodName: "handler",
              }
            );

            // Send the WhatsApp reminder for work email verification
            await UserExperienceService.reviewWhatsAppWorkEmailVerificationReminder(
              input
            );
            break;
          }

          case ScheduleJobType.REFERRAL_DONE_STATUS_REMINDER: {
            const referralDoneStatusReminderInputDetails = scheduleJob.input as ScheduleJobReferralReminderInputDto;

            global.logger.info(
              "App scheduler handler [REFERRAL_DONE_STATUS_REMINDER]: referralId and userEmail: ",
              {
                filePath: __filename,
                methodName: "handler",
                referralId: referralDoneStatusReminderInputDetails["referralId"],
              }
            );

            // Send the reminder for referral completion
            await userReferralEmpServiceObj.reviewReferralDoneStatusReminder(
              referralDoneStatusReminderInputDetails["referralId"],
              referralDoneStatusReminderInputDetails["reminderCount"]
            );
            break;
          }

          /**
           * CORPORATE_BULK_JD_RESUME_SEND_EMAIL_AND_WHATSAPP_NOTIFICATIONS
           *
           * Handles the Corporate Bulk JD Resume Send Email and WhatsApp Notifications schedule job.
           */
          case ScheduleJobType.CORPORATE_BULK_JD_RESUME_SEND_EMAIL_AND_WHATSAPP_NOTIFICATIONS: {
            global.logger.info(
              "App scheduler handler [CORPORATE_BULK_JD_RESUME_SEND_EMAIL_AND_WHATSAPP_NOTIFICATIONS]: ",
              {
                filePath: __filename,
                methodName: "handler",
              }
            );

            // Extract input details from the scheduled job for bulk resumes notifications
            const scheduleJobCorporateBulkJdResumeNotificationsInput =
              scheduleJob.input as ScheduleJobCorporateBulkJdResumeNotificationsInputDto;

            // Extract the corporate bulk jd id from the input
            const corporateBulkJdId: string =
              scheduleJobCorporateBulkJdResumeNotificationsInput[
                "corporateBulkJdId"
              ];
            global.logger.debug(
              `Corporate Bulk Jd Id`, {
                corporateBulkJdId: corporateBulkJdId,
              }
            )

            // Send email and WhatsApp notifications to bulk resumes candidates by corporate bulk jd id
            const sendEmailAndWhatsappNotificationsToBulkResumeCandidatesByCorporateBulkJdIdResponse: boolean =
              await corporateBulkJdResumeServiceObj.sendEmailAndWhatsappNotificationsToBulkResumeCandidatesByCorporateBulkJdId(
                corporateBulkJdId
              );

            // Log the input details for bulk resumes notifications
            global.logger.info(
              `App scheduler handler [CORPORATE_BULK_JD_RESUME_SEND_EMAIL_AND_WHATSAPP_NOTIFICATIONS]: corporateBulkJdId: `,
              {
                filePath: __filename,
                methodName: "handler",
                corporateBulkJdId: corporateBulkJdId, // Refer `id` attribute in `CorporateBulkJd.model.ts` for more details
                sendEmailAndWhatsappNotificationsToBulkResumeCandidatesByCorporateBulkJdIdResponse:
                  sendEmailAndWhatsappNotificationsToBulkResumeCandidatesByCorporateBulkJdIdResponse,
              }
            );

            break;
          }

          // Handle unknown or unsupported schedule job types
          default: {
            throw new BaseError(
              `No schedule found for job type: ${scheduleJob.type}`
            );
          }
        }

        // Mark the scheduled job as completed
        await scheduleJobService.completeScheduleJob(scheduleJobId);

        // Return success response
        return sendSuccessResponse(
            HttpStatusCode.OK_200,
            `Scheduled job ${scheduleJobId} processed successfully.`
        );
    } catch (error: any) {
        // Return error response
        return sendErrResponse(
            error,
            error?.errorMsg ?? error?.message ?? 'An error occurred while processing the scheduled job.'
        );
    }
};
