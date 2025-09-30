// Import necessary modules and services
import APP_CONSTANTS from "../constants.config";

/**
 * WHATSAPP_APP_CONSTANTS
 *
 * This object contains constants and configuration details specifically for the WhatsApp integration,
 * including API settings and reminder scheduling for employee work email verification.
 */
const WHATSAPP_APP_CONSTANTS = {
  /** WhatsApp API version to be used */
  API_VERSION: "v20.0",

  /** WhatsApp webhook hub mode */
  WEBHOOK_HUB_MODE: "subscribe",

  /**
   * EMP_WORK_EMAIL_REMINDER_X_TIMES
   *
   * This constant defines the total maximum number of reminders that should be sent to EMP every 24 hours.
   * The same count is used for both production and development environments.
   */
  EMP_WORK_EMAIL_REMINDER_X_TIMES: 5,

  /**
   * EMP_WORK_EMAIL_REMINDER_INTERVAL
   *
   * This constant defines the interval between subsequent reminders after the initial one.
   * The interval is calculated differently based on the environment:
   * - Production (PROD): 24 hours (in milliseconds)
   * - Development/Testing: 10 minutes (in milliseconds)
   *
   * @returns {number} - The interval between reminders in milliseconds.
   */
  get EMP_WORK_EMAIL_REMINDER_INTERVAL(): number {
    return process.env.APP_SLS_STAGE === APP_CONSTANTS.STAGES.PROD
      ? 24 * 60 * 60 * 1000 // 24 hours in milliseconds
      : 5 * 60 * 1000; // 5 minutes in milliseconds
  },

  /**
   * EMP_REF_VALIDATE_DONE_STATUS_REMINDER_INITIAL_DELAY
   *
   * This property returns the initial delay for sending the first reminder after
   * an employee's work email has been validated. The delay is calculated differently
   * based on the environment:
   * - Production (PROD): 24 hours (in milliseconds)
   * - Development/Testing: 10 minutes (in milliseconds)
   *
   * @returns {number} - The initial delay in milliseconds.
   */
  get EMP_REF_VALIDATE_DONE_STATUS_REMINDER_INITIAL_DELAY(): number {
    return process.env.APP_SLS_STAGE === APP_CONSTANTS.STAGES.PROD
      ? 24 * 60 * 60 * 1000 // 24 hours in milliseconds
      : 5 * 60 * 1000; // 5 minutes in milliseconds
  },

  /**
   * EMP_REF_VALIDATE_DONE_STATUS_REMINDER_INTERVAL
   *
   * This property returns the interval between subsequent reminders after the first one
   * has been sent for validating an employee's work email. The interval is calculated
   * differently based on the environment:
   *
   * @returns {number} - The interval between reminders in milliseconds.
   */
  get EMP_REF_VALIDATE_DONE_STATUS_REMINDER_INTERVAL(): number {
    return process.env.APP_SLS_STAGE === APP_CONSTANTS.STAGES.PROD
      ? 3 * 24 * 60 * 60 * 1000 // 3 days in milliseconds
      : 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
  },
};

/**
 * WHATSAPP_CLOUD_API_ENDPOINTS
 *
 * This object contains endpoint URLs for various WhatsApp Cloud API operations.
 * The URLs are parameterized and should be populated with actual values before use.
 */
const WHATSAPP_CLOUD_API_ENDPOINTS = {
  /**
   * TEMPLATE_CREATE
   *
   * Endpoint for creating a new message template.
   * This URL is parameterized and needs to be populated with `baseUrl`, `apiVersion`,
   * and `whatsappBusinesssAccountId` before being used.
   */
  TEMPLATE_CREATE:
    "{baseUrl}/{apiVersion}/{whatsappBusinesssAccountId}/message_templates",

  /**
   * TEMPLATE_UPDATE
   *
   * Endpoint for updating an existing message template.
   * This URL is parameterized and needs to be populated with `baseUrl`, `apiVersion`,
   * and `whatsappBusinesssAccountId` before being used.
   */
  TEMPLATE_UPDATE:
    "{baseUrl}/{apiVersion}/{whatsappBusinesssAccountId}/message_templates",

  /**
   * TEMPLATE_GET
   *
   * Endpoint for retrieving a specific message template by its name.
   * This URL is parameterized and needs to be populated with `baseUrl`, `apiVersion`,
   * `whatsappBusinesssAccountId`, and `templateName` before being used.
   */
  TEMPLATE_GET:
    "{baseUrl}/{apiVersion}/{whatsappBusinesssAccountId}/message_templates?name={templateName}",

  /** 
   * TEMPLATE_DELETE
   * 
   * Endpoint for deleting a specific message template by its name.
   * This URL is parameterized and needs to be populated with `baseUrl`, `apiVersion`,
   * `whatsappBusinesssAccountId`, and `templateName` before being used.
   */
  TEMPLATE_DELETE:
    "{baseUrl}/{apiVersion}/{whatsappBusinesssAccountId}/message_templates/{templateName}",

  /**
   * MSG_SEND_USING_TEMPLATE
   *
   * Endpoint for sending a message using a message template.
   * This URL is parameterized and needs to be populated with `baseUrl`, `apiVersion`,
   * and `fromPhoneNumberId` before being used.
  */
  MSG_SEND_USING_TEMPLATE: "{baseUrl}/{apiVersion}/{fromPhoneNumberId}/messages",
};

// Exports the constants and API endpoints as a single object
export {
  WHATSAPP_APP_CONSTANTS,
  WHATSAPP_CLOUD_API_ENDPOINTS
};