// Import DateTime library
import { DateTime } from "luxon";
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import Services
import UserDetailService from "./UserDetail.service";
import userOtpService from "./UserOTP.service";
import ScheduleJobService from "./ScheduleJob.service";

// Import DAOs
import userExperienceDao from "../daos/UserExperience.dao";

// Import DTOs
import { DbUserExperienceDto } from "../db/models/UserExperience.model";
import { UserExperienceDTO } from "../dtos/UserExperience.dto";
import { ScheduleJobCreateDto, ScheduleJobWhatsAppReminderInputDto } from "../dtos/ScheduleJob.dto";
import { RecordListingFilterOptions } from "../dtos/Common.dto";
import { EmailTemplatePlaceholderUSER_WORK_EMAIL_VERIFICATION_OTP } from "../dtos/EmailTemplatePlaceholder.dto";
import { WhatsappTemplatePlaceholderEMP_WORK_EMAIL_VERIFY_PENDING_NOTIFICATION } from "../dtos/WhatsappTemplatePlaceholder.dto";

// Import Models
import { DbUserOtpDto } from "../db/models/UserOTP.model";

// Import Libraries
import { EmailSourceDestinationAddress } from "../libraries/email.library";
import { whatsappLibraryObj } from "../libraries/Whatsapp.library";

// Import Enums
import { EmailTemplateEnum } from "../enums/EmailTemplate.enum";
import { WhatsappTemplateNameEnum } from "../enums/WhatsappTemplate.enum";
import { ScheduleJobStatus, ScheduleJobType } from "../enums/ScheduleJob.enum";
import { WhatsappMessageTypeCloudApiEnum } from "../enums/WhatsappMessageLog.enum";

// Import Utilities
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

// import constants
import { WHATSAPP_APP_CONSTANTS } from "../configs/constants/Whatsapp.constant";

/**
 *  UserExperienceService class responsible for managing user Experience-related operations.
 */
class UserExperienceService {
  /**
   * Retrieves user Experience by email id.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - Experience of the user
   */
  async get(email: string) {
    global.logger.info("Get user experience by id [service]");
    return userExperienceDao.get(email);
  }

  /**
   * getByUserPrimaryEmailAndId
   *
   * Retrieves a user's experience by their primary email and experience ID asynchronously.
   *
   * @param {string} email - The primary email of the user.
   * @param {string} experienceId - The ID of the experience to retrieve.
   * @returns {Promise<QueryResponse<DbUserExperienceDto>>} A promise that resolves with the query response containing the user's experience data.
   */
  async getByUserPrimaryEmailAndId(email: string, experienceId: string): Promise<QueryResponse<DbUserExperienceDto>> {
    return userExperienceDao.getByUserPrimaryEmailAndId(email, experienceId);
  }

  /**
   *
   * @param email
   * @param UserExperienceDto
   */
  async createUserExperience(email: string, userExperienceDto: UserExperienceDTO) {
    global.logger.info("Create employee Work Experience [service]");
    // Create a new user experience in the database
    let userExperience = await userExperienceDao.create(email, userExperienceDto);

    // call the function to setup the user experience related resources
    await this.initializeUserExperienceVerificationProcess(email, userExperience);

    // create user exp
    return userExperience;
  }

  /**
     * Initializes the user experience verification process if the experience is current and email is not verified.
     *
     * @param {string} email - The email of the user.
     * @param {DbUserExperienceDto} userExperience - The user experience to initialize verification for.
     * @returns {Promise<boolean>} True if initialization is successful, false otherwise.
     * @throws {BaseError} If the user with the provided email doesn't exist.
     */
  async initializeUserExperienceVerificationProcess(email: string, userExperience: DbUserExperienceDto): Promise<boolean> {
    global.logger.info("Initialize employee Work Experience verification process [service]");

    // Check if the experience is current and email is not verified
    if (userExperience.isCurrent && !userExperience.isEmailVerified) {
      // Retrieve user details
      let userDetails = await UserDetailService.get(email);
      if (!userDetails.count) {
        throw new BaseError(`The user with provided email:${email} doesn't exist`, HttpStatusCode.NOT_FOUND_404);
      }
      let empName = userDetails[0].name;

      // Schedule the first WhatsApp reminder
      await this.scheduleWhatsAppWorkEmailVerificationReminder(email, empName, userExperience.id, 1);
    }
    return true;
  }

  /**
   * scheduleWhatsAppWorkEmailVerificationReminder
   * 
   * Schedules the next WhatsApp reminder for work email verification.
   * This reminder is scheduled for up to 5 consecutive days until the employee verifies their work email.
   * A WhatsApp message is sent each day after 24 hours from the last reminder.
   * If the employee verifies the email, no further reminders will be sent.
   *
   * @param {string} email - The employee's work email that needs to be verified.
   * @param {string} empName - The name of the employee.
   * @param {string} experienceId - The unique ID of the employee's experience.
   * @param {number} reminderCount - The number of reminders that have been sent so far.
   * @returns {Promise<boolean>} Returns true if scheduling is successful, false otherwise.
   */
  async scheduleWhatsAppWorkEmailVerificationReminder(
    email: string,
    empName: string,
    experienceId: string,
    reminderCount: number
  ): Promise<boolean> {
    // Retrieve the reminder interval from constants
    const reminderInterval = WHATSAPP_APP_CONSTANTS.EMP_WORK_EMAIL_REMINDER_INTERVAL;

    // Calculate the schedule time by adding the interval to the current time
    const scheduleTime = DateTime.now().plus({ milliseconds: reminderInterval });

    // Prepare the input for the scheduler, including user details and reminder count
    const scheduleJobWhatsAppReminderInput: ScheduleJobWhatsAppReminderInputDto =
      {
        email,
        empName,
        experienceId,
        reminderCount,
      };

    // Create a payload for scheduling the WhatsApp reminder
    const scheduleJobPayload: ScheduleJobCreateDto = {
      type: ScheduleJobType.EMP_WORK_EMAIL_VERIFICATION_REMINDER,
      scheduleTime: scheduleTime.toUTC().toFormat("yyyy-MM-dd'T'HH:mm:ss"), // Format time to UTC
      input: scheduleJobWhatsAppReminderInput,
      desc: `Send WhatsApp reminder ${reminderCount} for work email verification to ${email}`,
      status: ScheduleJobStatus.SCHEDULED,
    };

    // Schedule the job using the ScheduleJobService
    await ScheduleJobService.createScheduleJob(scheduleJobPayload);
    return true;
  }

  /**
   * Reviews and sends a scheduled WhatsApp reminder for work email verification.
   *
   * @param {ScheduleJobWhatsAppReminderInputDto} inputDetails - Details of the scheduled WhatsApp reminder.
   * @returns {Promise<boolean>} - A promise that resolves to true if the reminder is sent or skipped, false otherwise.
   * @throws {BaseError} If the user with the provided email doesn't exist.
   */
  async reviewWhatsAppWorkEmailVerificationReminder(
    inputDetails: ScheduleJobWhatsAppReminderInputDto
  ): Promise<boolean> {
    global.logger.info(`Reviewing WhatsApp work email verification reminder for ${inputDetails.email}`);

    // Get the maximum number of allowed reminders from constants
    const maxReminders = WHATSAPP_APP_CONSTANTS.EMP_WORK_EMAIL_REMINDER_X_TIMES;

    // Check if maximum reminders have been sent
    if (inputDetails.reminderCount > maxReminders) {
      global.logger.info(`Skipping reminder as ${maxReminders} reminders have already been sent`, {
        filePath: __filename,
        methodName: "reviewWhatsAppWorkEmailVerificationReminder",
        input: inputDetails
      });
      return true;
    }

    // Check if email is already verified
    const experience = await this.getByUserPrimaryEmailAndId(inputDetails.email, inputDetails.experienceId);
    if (experience[0].isEmailVerified) {
      global.logger.info(`Skipping reminder as employee's work email is already verified`, {
        filePath: __filename,
        methodName: "reviewWhatsAppWorkEmailVerificationReminder",
        email: inputDetails.email,
        experienceId: inputDetails.experienceId
      });
      return true;
    }

    // Get user details
    let userDetails = await UserDetailService.get(inputDetails.email);
    if (!userDetails.count) {
      throw new BaseError(`The user with provided email:${inputDetails.email} doesn't exist`, HttpStatusCode.NOT_FOUND_404);
    }

    // Send WhatsApp reminder if user's email is verified
    if (userDetails[0].isEmailVerified) {
      const whatsappPlaceholders: WhatsappTemplatePlaceholderEMP_WORK_EMAIL_VERIFY_PENDING_NOTIFICATION = {
        body: { type: WhatsappMessageTypeCloudApiEnum.TEXT, value: inputDetails.empName },
      };

      await this.sendWhatsappMsgToEmpAboutPendingWorkEmailVerification(
        inputDetails.email,
        userDetails[0].number,
        whatsappPlaceholders
      );
      global.logger.info(`Sent WhatsApp reminder ${inputDetails.reminderCount} for work email verification`);

      // Schedule the next reminder if we haven't reached the maximum
      if (inputDetails.reminderCount < maxReminders) {
        await this.scheduleWhatsAppWorkEmailVerificationReminder(
          inputDetails.email,
          inputDetails.empName,
          inputDetails.experienceId,
          inputDetails.reminderCount + 1
        );
      }
    } else {
      global.logger.info(`Skipping reminder as user's mobile number is not verified`, {
        filePath: __filename,
        methodName: "reviewWhatsAppWorkEmailVerificationReminder",
        email: inputDetails.email,
        experienceId: inputDetails.experienceId
      });
    }

    return true;
  }

  /**
   * Sends a WhatsApp message to the employee about pending work email verification.
   *
   * @param {string} empEmail - The employee's email address
   * @param {string} toPhoneNumber - The phone number to send the message to
   * @param {WhatsappTemplatePlaceholderEMP_WORK_EMAIL_VERIFY_PENDING_NOTIFICATION} whatsappPlaceholders - Placeholders for the WhatsApp template
   * @returns {Promise<boolean>} - A promise that resolves to true when the message is sent successfully, false otherwise.
   */
  async sendWhatsappMsgToEmpAboutPendingWorkEmailVerification(
    empEmail: string,
    toPhoneNumber: string,
    whatsappPlaceholders: WhatsappTemplatePlaceholderEMP_WORK_EMAIL_VERIFY_PENDING_NOTIFICATION
  ): Promise<boolean> {
    // Set the template name for the WhatsApp message
    const templateName = WhatsappTemplateNameEnum.EMP_WORK_EMAIL_VERIFY_PENDING_NOTIFICATION;

    // Send WhatsApp message using the specified template and placeholders
    await whatsappLibraryObj.sendWhatsappMessage(empEmail, templateName, toPhoneNumber, whatsappPlaceholders);

    global.logger.info("WhatsApp message for pending work email verification sent successfully", {
      filePath: __filename,
      methodName: this.sendWhatsappMsgToEmpAboutPendingWorkEmailVerification.name,
      empEmail: empEmail,
    });
    return true;
  }

  /**
   * Updates an existing user Experience.
   *
   * @param email - Email of the user
   * @param userExperienceDTO - Data Transfer Object containing updated user Experience details
   * @returns {Promise<any>} - A Promise that resolves when the Experience is successfully updated
   */
  async updateUserExperience(
    email: string,
    SK: string,
    userExperienceDTO: UserExperienceDTO
  ): Promise<DbUserExperienceDto> {
    global.logger.info("Update employee work experience [service]");

    // Update the user experience in the database
    return userExperienceDao.update(email, SK, userExperienceDTO);
  }

  /**
   * verifyWorkEmail
   *
   * Verifies a user's work email asynchronously.
   *
   * @param {string} email - The work email to verify.
   * @param {string} userId - The ID of the user to verify the work email for.
   * @returns {Promise<DbUserExperienceDto>} A promise that resolves with the user's experience data if the email is verified.
   */

  /**
   * verifyWorkEmail
   *
   * Verifies a user's work email asynchronously.
   *
   * @param {string} primaryEmail - the primary email to verify
   * @param {string} experienceId - the user ID to verify the email for
   * @return {Promise<DbUserExperienceDto>} the verified user experience DTO
   */
  async verifyWorkEmail(primaryEmail: string, experienceId: string): Promise<DbUserExperienceDto> {
    return userExperienceDao.verifyWorkEmail(primaryEmail, experienceId);
  }

  /**
   * sendOtptoVerifyUserWorkEmail
   *
   * Send OTP to verify user's work email.
   *
   * @param {string} primaryEmail - the user's primary email address
   * @param {string} experienceId - the ID of the user's experience
   * @param {string} userIpAddress - the IP address of the user
   * @return {Promise<DbUserOtpDto>} the DTO containing the user's OTP details
   */
  async sendOtptoVerifyUserWorkEmail(
    primaryEmail: string,
    experienceId: string,
    userIpAddress: string
  ): Promise<DbUserOtpDto> {
    // Get the user experince details to get the user's work email address
    const userExperience = await this.getByUserPrimaryEmailAndId(primaryEmail, experienceId);
    const userWorkEmail = userExperience[0].emailId;

    // Get the user details to get the user's name
    const userDetails = await UserDetailService.get(primaryEmail);
    const userFullName = userDetails[0].name;

    // Prepare the placeholders and to address to send the email
    const toAddress: EmailSourceDestinationAddress = {
      email: userWorkEmail as string,
      fullName: userFullName,
    };
    const emailPlaceholders: Partial<EmailTemplatePlaceholderUSER_WORK_EMAIL_VERIFICATION_OTP> = {
      userFullName: userFullName,
    };

    // Send OTP to user's work email to verify the same.
    return userOtpService.sendOtpViaEmail(
      primaryEmail,
      EmailTemplateEnum.USER_WORK_EMAIL_VERIFICATION_OTP,
      toAddress,
      emailPlaceholders,
      userIpAddress
    );
  }

  /**
   * verifyOTPforUserWorkEmail
   *
   * To verify work email by matching otp
   *
   * @param {string} primaryEmail - description of parameter
   * @param {string} experienceId - description of parameter
   * @param {string} otp - description of parameter
   * @return {Promise<boolean>} description of return value
   */
  async verifyOtpforUserWorkEmail(primaryEmail: string, experienceId: string, otp: string): Promise<boolean> {
    // Get user's experience details to get the work email
    const userExperience = await this.getByUserPrimaryEmailAndId(primaryEmail, experienceId);
    const userWorkEmail = userExperience[0].emailId as string;

    // Verify the OTP provided by the user from the database
    const isOtpVerified = await userOtpService.verifyOtp(primaryEmail, userWorkEmail, otp);

    // If OTP is not verified then return false, indicating verification failed
    if (!isOtpVerified) {
      return false;
    }

    // As the OTP is verified, mark the user's work email as verified
    await this.verifyWorkEmail(primaryEmail, experienceId);

    // As the OTP is verified, indicating verification successful
    return true;
  }

  /**
   * getCompanyCurrentEmployeesByCompanyId
   *
   * Retrieves company's current employees for the provided companyId.
   *
   * @param {string} companyId - The ID of the company to retrieve users for.
   * @return {Promise<QueryResponse<DbUserExperienceDto>>} A promise that resolves to a QueryResponse of DbUserExperienceDto.
   */
  async getCompanyCurrentEmployeesByCompanyId(
    companyId: string,
    options: RecordListingFilterOptions
  ): Promise<QueryResponse<DbUserExperienceDto>> {
    return userExperienceDao.getCompanyCurrentEmployeesByCompanyId(companyId, options);
  }
}

// Export an instance of the UserExperienceService class
export default new UserExperienceService();
