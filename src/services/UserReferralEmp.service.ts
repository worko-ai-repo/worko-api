// Import required dynamoose libraries
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import DateTime Library
import { DateTime } from "luxon";

// Import DAOs
import userReferralDao from "../daos/UserReferral.dao";

// Import Models
import { DbUserExperienceDto } from "../db/models/UserExperience.model";
import { DbUserReferralDto } from "../db/models/UserReferral.model";
import { DbUserDetailDto } from "../db/models/UserDetail.model";

// Import DTOs
import {
  EmailTemplatePlaceholderEMP_RECEIVED_REFERRAL_REQ_NOTIFICATION,
  EmailTemplatePlaceholderEMP_ACCEPTED_REFERRAL_REQ_NOTIFCATION,
  EmailTemplatePlaceholderEMP_REFFERAL_DONE_FOR_CAND,
  EmailTemplatePlaceholderCAND_REFERRAL_REQ_ACCEPTED,
  EmailTemplatePlaceholderCAND_REFERRAL_REQ_COMPLETED,
} from "../dtos/EmailTemplatePlaceholder.dto";
import { UserReferralResponseDTO } from "../dtos/UserReferralResponse.dto";
import { EmpReferralListingFilterOptions, UserReferralDTO } from "../dtos/UserReferral.dto";
import { ScheduleJobReferralReminderInputDto, ScheduleJobCreateDto } from "../dtos/ScheduleJob.dto";
import { PaginatedResultsWithMatchingConditionsInternalResponse, PaginatedResultsWithMatchingConditionsResponse } from "../dtos/Common.dto";
import { WhatsAppBusinessPartnerTemplatePlaceholderCAND_REFERRAL_REQUEST_ACCEPTED_CANDIDATE, WhatsAppBusinessPartnerTemplatePlaceholderCAND_REFERRAL_REQUEST_COMPLETED_CANDIDATE, WhatsAppBusinessPartnerTemplatePlaceholderEMP_NEW_REFERRAL_REQUEST_EMPLOYEE, WhatsAppBusinessPartnerTemplatePlaceholderEMP_REFERRAL_REQUEST_PENDING_EMPLOYEE } from "../dtos/WhatsAppBusinessPartnerTemplatePlaceholder.dto";

// Import Enums
import { EmailTemplateEnum } from "../enums/EmailTemplate.enum";
import { ReferralActions } from "../enums/User.enum";
import { ReferralStatus } from "../enums/UserReferral.enum";
import { ScheduleJobType, ScheduleJobStatus } from "../enums/ScheduleJob.enum";
import { WhatsAppBusinessPartnerTemplateNameEnum } from "../enums/WhatsAppBusinessPartnerTemplate.enum";
import { CountUserDbEntityTypeEnum } from "../enums/CountUser.enum";

// Import Helpers
import { urlHelperObj } from "../helpers/Url.helper";

// Import Libraries
import { EmailSourceDestinationAddress, emailLibrary } from "../libraries/email.library";
import { whatsAppBusinessPartnerLibraryObj } from "../libraries/WhatsAppBusinessPartner.library";

// Import Models
import { DbUserReferralResponseDto } from "../db/models/UserReferralResponse.model";
import { DbCountUserDto } from "../db/models/CountUser.model";

// Import Utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

// Import Services
import UserDetailService from "./UserDetail.service";
import UserExperienceService from "./UserExperience.service";
import UserReferralService from "./UserReferral.service";
import UserReferralResponseService from "./UserReferralResponse.service";
import CompanyService from "./Company.service";
import ScheduleJobService from "./ScheduleJob.service";
import { countUserServiceObj } from "./CountUser.service";

// import constants
import { WHATSAPP_APP_CONSTANTS } from "../configs/constants/Whatsapp.constant";
import { WHATSAPP_BUSINESS_PARTNER_APP_CONSTANTS } from "../configs/constants/WhatsAppBusinessPartner.constant";
import APP_CONSTANTS from "../configs/constants.config";

/**
 *  UserReferralEmpService class responsible for managing employee-related referral operations.
 */
class UserReferralEmpService {
  async getEmployeeRespondedReferralIds(    
    empPrimaryEmail: string,
  ): Promise<string[]> {
      const userReferralResponse: QueryResponse<DbUserReferralResponseDto> =
        await UserReferralResponseService.get(empPrimaryEmail);

      // Check if response exists and has data
      if (!userReferralResponse || userReferralResponse.length === 0) {
        return [];
      }

      const userReferralResponseData: DbUserReferralResponseDto = userReferralResponse[0];

      const empPassedRefIds: string[] = Array.from(
        new Set(userReferralResponseData?.passedRefIds || [])
      );
      const empRejectedRefIds: string[] = Array.from(
        new Set(userReferralResponseData?.rejectedRefIds || [])
      );
      const empAcceptedRefIds: string[] = Array.from(
        new Set(userReferralResponseData?.acceptedRefIds || [])
      );
      const empDoneRefIds: string[] = Array.from(
        new Set(userReferralResponseData?.doneRefIds || [])
      );
      const referralIds: string[] = [
        ...empPassedRefIds,
        ...empRejectedRefIds,
        ...empAcceptedRefIds,
        ...empDoneRefIds
      ];

      return referralIds;
  }

  async getEmployeeReferrals(
    empPrimaryEmail: string,
    empReferralListingFilterOptions: EmpReferralListingFilterOptions
  ): Promise<PaginatedResultsWithMatchingConditionsInternalResponse<DbUserReferralDto[]>> {
    if(empReferralListingFilterOptions?.status) {
      // If referralStatus is AWAITING then fetch the details
      if (empReferralListingFilterOptions.status === ReferralStatus.AWAITING) {
        // If status is awaiting, call the function to get awaiting referrals
        return this.getEmployeeAwaitingReferrals(
          empPrimaryEmail,
          empReferralListingFilterOptions
        );
      } else {
        // Otherwise, call the function to get referrals by status
        return this.getEmployeeReferralsByStatus(
          empPrimaryEmail,
          empReferralListingFilterOptions
        );
      }
    } else {
      const refIds: string[] = await this.getEmployeeRespondedReferralIds(
        empPrimaryEmail
      );

      const allStatusesReferrals: PaginatedResultsWithMatchingConditionsResponse<DbUserReferralDto> = await userReferralDao.getAllStatusesEmployeeReferrals(
        refIds,
        empReferralListingFilterOptions
      );

      const { lastKey, count, timesQueried, queriedCount, ...restReferrals } = allStatusesReferrals;
      const referralsData: DbUserReferralDto[] = Object.values(restReferrals);
      const finalReferrals: PaginatedResultsWithMatchingConditionsInternalResponse<DbUserReferralDto[]> = {
        data: referralsData,
        lastKey,
        count,
        timesQueried,
        queriedCount,
      }

      return finalReferrals;
    }
  }

  async getEmployeeAwaitingReferrals(
    empPrimaryEmail: string,
    empReferralListingFilterOptions: EmpReferralListingFilterOptions
  ): Promise<PaginatedResultsWithMatchingConditionsInternalResponse<DbUserReferralDto[]>> {
    // Get employee's responses given to different referrals by empPrimaryEmail
    const userReferralResponse: QueryResponse<DbUserReferralResponseDto> =
      await UserReferralResponseService.get(empPrimaryEmail);

    // Check if response exists and has data
    const responseData = userReferralResponse && userReferralResponse.length > 0 ? userReferralResponse[0] : null;

    const empPassedRefIds: string[] = Array.from(
      new Set(responseData?.passedRefIds || [])
    );
    const empRejectedRefIds: string[] = Array.from(
      new Set(responseData?.rejectedRefIds || [])
    );
    const referralIdsToBeExcluded: string[] = [
      ...empPassedRefIds,
      ...empRejectedRefIds,
    ];
    global.logger.debug(`employee responses info in "AWAITING" status`, {
      filePath: __filename,
      methodName: this.getEmployeeAwaitingReferrals.name,
      empPrimaryEmail,
      empPassedRefIds,
      empRejectedRefIds,
      referralIdsToBeExcluded,
    });

    // Get company referrals where status is awaiting
    const awaitingReferrals: PaginatedResultsWithMatchingConditionsResponse<DbUserReferralDto> = await userReferralDao.getCompanyReferralsByEmpEmailForAwaiting(
        empReferralListingFilterOptions,
        referralIdsToBeExcluded
      );
    const { lastKey, count, timesQueried, queriedCount, ...restAwaitingReferrals } = awaitingReferrals;
    const awaitingReferralsData: DbUserReferralDto[] = Object.values(restAwaitingReferrals);
    const finalAwaitingReferrals: PaginatedResultsWithMatchingConditionsInternalResponse<DbUserReferralDto[]> = {
      data: awaitingReferralsData,
      lastKey,
      count,
      timesQueried,
      queriedCount,
    }

    return finalAwaitingReferrals;
  }

  async getEmployeeReferralsByStatus(
    empPrimaryEmail: string,
    empReferralListingFilterOptions: EmpReferralListingFilterOptions,
  ): Promise<PaginatedResultsWithMatchingConditionsInternalResponse<DbUserReferralDto[]>>  {
    // Get company referrals where status is referralStatus
    let attributes: string[] = [];
    const referralStatus = empReferralListingFilterOptions.status;

    // Determine the attribute based on referralStatus
    if (referralStatus === ReferralStatus.CANCELLED) {
      attributes = ["passedRefIds"];
    } else if (referralStatus === ReferralStatus.ACCEPTED) {
      attributes = ["acceptedRefIds"];
    } else if (referralStatus === ReferralStatus.REJECTED) {
      attributes = ["rejectedRefIds"];
    } else if (referralStatus === ReferralStatus.DONE) {
      attributes = ["doneRefIds"];
    }

    // Get the refIds on which emp has performed the given action
    const userReferralResponse =
      await UserReferralResponseService.getByEmailWithSpecifiedAttributes(
        empPrimaryEmail,
        attributes
      );
    global.logger.debug(
      `employee responses info in "${referralStatus}" status`,
      {
        filePath: __filename,
        methodName: this.getEmployeeReferralsByStatus.name,
        empPrimaryEmail,
        attributes,
        userReferralResponse,
      }
    )
    if (!userReferralResponse.count) {
      return {
        data: [],
        count: 0,
        lastKey: undefined,
        timesQueried: 0,
        queriedCount: 0,
      };
    }

    // Extract referral IDs based on referralStatus attribute
    const refIds: string[] = userReferralResponse[0][attributes[0]];
    global.logger.debug(
      `refIds info in "${referralStatus}" status`,{
        filePath: __filename,
        methodName: this.getEmployeeReferralsByStatus.name,
        empPrimaryEmail,
        attributes,
        userReferralResponse,
        refIds
      }
    )
    if (!refIds.length) {
      return {
        data: [],
        count: 0,
        lastKey: undefined,
        timesQueried: 0,
        queriedCount: 0,
      };
    }

    // Get employee referrals by filter options and refIds( `refIds` contains referral IDs)
    const referrals: PaginatedResultsWithMatchingConditionsResponse<DbUserReferralDto> = await userReferralDao.getEmployeeReferralsByFilterOptions(
        refIds,
        empReferralListingFilterOptions
      );

    const { lastKey, count, timesQueried, queriedCount, ...restReferrals } = referrals;
    const referralsData: DbUserReferralDto[] = Object.values(restReferrals);
    const finalReferrals: PaginatedResultsWithMatchingConditionsInternalResponse<DbUserReferralDto[]> = {
      data: referralsData,
      lastKey,
      count,
      timesQueried,
      queriedCount,
    }

    return finalReferrals;
  }

  /**
   * sendEmailToEmployeesOnReferralCreation
   *
   * Sends an email to all current employees of a company when a referral is created.
   * The email notifies employees of a new candidate referral.
   *
   * @param {string} companyId - The ID of the company whose employees will receive the email.
   * @param {string} referralId - The ID of the referral for which the email is being sent.
   * @param {string} candidateName - The name of the referred candidate.
   * @returns {Promise<boolean>} - Returns true if emails are sent successfully.
   * @throws {BaseError} - Throws an error if no employees are found.
   */
  async sendEmailToEmployeesOnReferralCreation(
    companyId: string,
    referralId: string,
    candidateName: string
  ): Promise<boolean> {
    let companyEmployees: DbUserExperienceDto[] = [];
    let lastKey: any = undefined;
    const pageSize = 25;

    // Continue fetching and sending emails as long as there are more employees
    do {
      // Get a batch of employees for the company
      const employeesResponse =
        await UserExperienceService.getCompanyCurrentEmployeesByCompanyId(
          companyId,
          {
            pageSize,
            lastKey: lastKey,
          }
        );

      // Add employees to the list
      companyEmployees = companyEmployees.concat(employeesResponse);

      // Update the lastKey for the next iteration and encode it
      lastKey = employeesResponse.lastKey ?? null;
    } while (lastKey);

    // throw error if no employees are found
    if (!companyEmployees.length) {
      throw new BaseError(
        `No employees found for the company with companyId ${companyId}.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    // Fetch employee details and send emails in parallel
    const emailPromisesBatch = companyEmployees.map(async (employee) => {
      // Prepare the employee email address
      const empEmail = employee.PK.split("#")[2];

      // Get employee details
      const empDetails = await UserDetailService.get(empEmail);
      if (!empDetails.count) {
        // Merge the current batch of promises with the accumulated ones
        global.logger.info(
          `The employee details for the given email "${empEmail}" not found. Therefore, the email notification cannot be sent for the referral "${referralId}".`,
          {
            companyId: companyId,
          }
        );
        return false;
      }

      const refereeName = empDetails[0].name;
      const refereeEmail = empDetails[0].emailList.primary;

      // Construct the email address object
      const toAddress: EmailSourceDestinationAddress = {
        email: refereeEmail,
        fullName: refereeName,
      };

      // Prepare the email placeholders with appropriate values
      const emailPlaceholders: EmailTemplatePlaceholderEMP_RECEIVED_REFERRAL_REQ_NOTIFICATION =
        {
          emp_first_name: refereeName.toTitleCase(),
          candidate_name: candidateName.toTitleCase(),
          ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
          workoReferralUrl: APP_CONSTANTS.FRONTEND_URLS.WORKO_EMP_REFERRAL_LISTING_URL,
        };

      // Send the email using the email library
      return emailLibrary.sendEmail(
        EmailTemplateEnum.EMP_RECEIVED_REFERRAL_REQ_NOTIFICATION,
        toAddress,
        emailPlaceholders
      );
    });

    // Merge the current batch of promises with the accumulated ones
    global.logger.info(
      `Processed ${emailPromisesBatch.length} email sending tasks so far for companyId: ${companyId}`
    );

    // Wait for all email sending promises to complete
    await Promise.all(emailPromisesBatch);

    return true;
  }

  /**
   * sendWhatsAppBusinessPartnerWhatsappMsgtoEmployeesOnReferralCreation
   *
   * Sends WhatsApp message to all employees of a company when a referral was raised by a candidate on a paricular company.
   *
   * @param {string} candName - The name of the candidate.
   * @param {number} matchingScore - The matching score of the candidate.
   * @param {string} jobUrl - The URL of the job.
   * @param {string} companyId - The ID of the company.
   * @returns {Promise<boolean>} - A promise that resolves to true if all messages are sent successfully.
   */
  async sendWhatsAppBusinessPartnerWhatsappMsgtoEmployeesOnReferralCreation(
    candName: string,
    matchingScore: number,
    jobUrl: string,
    companyId: string
  ): Promise<boolean> {
    let companyEmployees: DbUserExperienceDto[] = [];
    let lastKey: any = undefined;
    const pageSize = 25;

    // Continue fetching and sending messages as long as there are more employees
    do {
      // Get a batch of employees for the company
      const employeesResponse: QueryResponse<DbUserExperienceDto> =
        await UserExperienceService.getCompanyCurrentEmployeesByCompanyId(
          companyId,
          {
            pageSize,
            lastKey: lastKey,
          }
        );

      /**
       * companyEmployees
       * 
       * Add employees to the list
       * 
       * .concat(employeesResponse) adds the elements of `employeesResponse` to `companyEmployees`, creating a new array that contains the employee objects.
       */
      companyEmployees = companyEmployees.concat(employeesResponse);

      // Update the lastKey for the next iteration
      lastKey = employeesResponse.lastKey ?? null;
    } while (lastKey);
    
    // Throw an error if no employees are found
    if (!companyEmployees.length) {
      throw new BaseError(
        `No employees found for the company with companyId ${companyId}.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    // Prepare and send WhatsApp messages in parallel
    const employeesBatch = companyEmployees.map(
      async (employee: DbUserExperienceDto) => {
        // Extract the employee email from the PK field
        const empEmail: string = employee.PK.split("#")[2];

      // Fetch employee details
      const empDetails: QueryResponse<DbUserDetailDto> = await UserDetailService.get(empEmail);
      if (!empDetails.count) {
        global.logger.info(
          `The employee details for the given email "${empEmail}" not found. Therefore, the WhatsApp message cannot be sent for the referral.`,
          {
            companyId: companyId,
          }
        );
        return true;
      }

      const refereeName = empDetails[0].name;
      const refereeEmail = empDetails[0].emailList.primary;

        /**
         * - If isWhatsappNotificationEnabled is `undefined` then Send whatsapp message
         * - If isWhatsappNotificationEnabled is `true` then Send whatsapp message
         * - If isWhatsappNotificationEnabled is `false` then Don't Send whatsapp message
         */
        if (
          WHATSAPP_BUSINESS_PARTNER_APP_CONSTANTS.ENABLED &&
          empDetails[0].isWhatsappNotificationEnabled !== false
        ) {
          // Encode the job URL
          const encodedUrl: string = urlHelperObj.encodeQueryString(jobUrl);

          // Prepare placeholders for the WhatsApp message
          const whatsAppBusinessPartnerPlaceholders: WhatsAppBusinessPartnerTemplatePlaceholderEMP_NEW_REFERRAL_REQUEST_EMPLOYEE =
            {
              employeeName: refereeName.toTitleCase(),
              candidateName: candName.toTitleCase(),
              matchingScore: matchingScore.toString(),
              jobUrl: encodedUrl,
            };

          // Send WhatsApp message to employee
          await whatsAppBusinessPartnerLibraryObj.sendWhatsAppBusinessPartnerWhatsappMessage(
            WhatsAppBusinessPartnerTemplateNameEnum.EMP_NEW_REFERRAL_REQUEST_EMPLOYEE,
            empDetails[0].number.strtr({ "+": "" }), // To Phone Number
            whatsAppBusinessPartnerPlaceholders,
            refereeEmail // reciever email
          );
        } else {
          // Log an info message if the employee's number is not verified
          global.logger.info(
            `Whatsapp notification is not enabled for the employee with email "${refereeEmail}". Therefore, the WhatsApp message cannot be sent for the referral.`,
            {
              companyId: companyId,
            }
          );
        }
      }
    );
    global.logger.info(
      `Processed ${employeesBatch.length} WhatsApp messages sending tasks so far for companyId: ${companyId}`
    );

    // Wait for all message sending promises to complete
    await Promise.all(employeesBatch);

    global.logger.info(`WhatsApp Message Sent Successfully!`, {
      filePath: __filename,
      methodName:
        this.sendWhatsAppBusinessPartnerWhatsappMsgtoEmployeesOnReferralCreation
          .name,
    });
    return true;
  }

  /**
   * scheduleReferralDoneStatusReminder
   *
   * Schedules a reminder to check if a referral request is still in the "ACCEPT" status.
   * If the referral request is still in the "ACCEPT" status, a WhatsApp reminder is sent to the employee.
   * The reminder is scheduled after a certain delay, usually 24 hours for `PROD` environment and 5 minutes for `DEV` environment.
   *
   * @param {string} email - Email address of the employee.
   * @param {string} empName - Name of the employee.
   * @param {string} referralId - ID of the referral request to check the status.
   * @param {number} reminderCount - Number of times the reminder has been sent.
   * @returns {Promise<boolean>} - Promise that resolves when the reminder is successfully scheduled.
   */
  async scheduleReferralDoneStatusReminder(
    email: string,
    empName: string,
    referralId: string,
    reminderCount: number
  ): Promise<boolean> {
    // This is a delay before the first reminder is sent. Usually, this is 24 hours for PROD and 5 mins for Dev
    const delay =
      WHATSAPP_APP_CONSTANTS.EMP_REF_VALIDATE_DONE_STATUS_REMINDER_INITIAL_DELAY;

    // Calculate the schedule time
    const scheduleTime = DateTime.now().plus({ milliseconds: delay });

    // Create the input object for the scheduler
    const scheduleJobReferralReminderInput: ScheduleJobReferralReminderInputDto =
      {
        email,
        empName,
        referralId,
        reminderCount,
      };

    // Create the payload for scheduling the job
    const scheduleJobPayload: ScheduleJobCreateDto = {
      type: ScheduleJobType.REFERRAL_DONE_STATUS_REMINDER,
      scheduleTime: scheduleTime.toUTC().toFormat("yyyy-MM-dd'T'HH:mm:ss"),
      input: scheduleJobReferralReminderInput,
      desc: `Check referral status and send WhatsApp reminder for ${email} if still accepted`,
      status: ScheduleJobStatus.SCHEDULED,
    };

    // Schedule the job
    await ScheduleJobService.createScheduleJob(scheduleJobPayload);

    return true;
  }

  /**
   * reviewReferralDoneStatusReminder
   *
   * Reviews the status of a referral request and sends a reminder to the employee
   * [WHEN] if the referral is in the "accepted" status and the employee has not yet completed the referral.
   *
   * @param {string} referralId - The ID of the referral request to review.
   * @param {string} userEmail - The email address of the user who made the referral request.
   * @param {number} currentReminderCount - The current number of reminders sent for the referral request.
   * @returns {Promise<boolean>} - Returns a promise that resolves with a boolean indicating if the message was sent or not.
   */
  async reviewReferralDoneStatusReminder(referralId: string, currentReminderCount: number): Promise<boolean> {
    global.logger.info(
      `Reviewing referral completion status for referral ID: ${referralId}`,
      {
        filePath: __filename,
        methodName: this.reviewReferralDoneStatusReminder.name,
      }
    );

    // Fetch user referral details using referral ID and user email
    let userReferralDetails: QueryResponse<DbUserReferralDto> = await UserReferralService.getReferralDetailsByReferralId(referralId);

    // If referral details are not found, throw an error
    if (!userReferralDetails.count) {
      throw new BaseError(
        `The referral details not found for the provided referral ID "${referralId}" ".`
      );
    }

    // Check if the referral is in the "accepted" status , if yes then send whatsapp message to employee
    if (userReferralDetails[0].status === ReferralStatus.ACCEPTED) {
      // Get the name and email of the referee who accepted the referral request
      const empId = userReferralDetails[0].acceptedByUserId as string;
      const empDetails = await UserDetailService.getUserById(empId);
      const refereeName = empDetails[0].name;
      const refereeEmail = empDetails[0].emailList.primary;
      let candEmail = userReferralDetails[0].PK.split("#")[2];
      let candDetails = await UserDetailService.get(candEmail);

      const referralDoneReminderLimit: string | undefined = process.env.APP_WORKO_REFERRAL_DONE_STATUS_REMAINDER_LIMIT;
      if(!referralDoneReminderLimit) {
        throw new BaseError("APP_WORKO_REFERRAL_DONE_STATUS_REMAINDER_LIMIT is not defined", HttpStatusCode.BAD_REQUEST_400);
      }

      /**
       * - If isWhatsappNotificationEnabled is `undefined` then Send whatsapp message
       * - If isWhatsappNotificationEnabled is `true` then Send whatsapp message
       * - If isWhatsappNotificationEnabled is `false` then Don't Send whatsapp message
       */
      if (
        WHATSAPP_BUSINESS_PARTNER_APP_CONSTANTS.ENABLED &&
        empDetails[0].isWhatsappNotificationEnabled !== false
      ) {
        let whatsAppBusinessPartnerPlaceholders: WhatsAppBusinessPartnerTemplatePlaceholderEMP_REFERRAL_REQUEST_PENDING_EMPLOYEE =
          {
            employeeName: refereeName.toTitleCase(),
            candidateName: candDetails[0].name.toTitleCase(),
          };

        // Send WhatsApp message to employee
        await whatsAppBusinessPartnerLibraryObj.sendWhatsAppBusinessPartnerWhatsappMessage(
          WhatsAppBusinessPartnerTemplateNameEnum.EMP_REFERRAL_REQUEST_PENDING_EMPLOYEE,
          empDetails[0].number.strtr({ "+": "" }), // To Phone Number
          whatsAppBusinessPartnerPlaceholders,
          refereeEmail // reciever email
        );

        if(currentReminderCount < parseInt(referralDoneReminderLimit)) {
          const delay: number =
            WHATSAPP_APP_CONSTANTS.EMP_REF_VALIDATE_DONE_STATUS_REMINDER_INTERVAL;
          const scheduleTime = DateTime.now().plus({ milliseconds: delay });

          const payload: ScheduleJobReferralReminderInputDto = {
            email: refereeEmail,
            empName: refereeName,
            referralId,
            reminderCount: currentReminderCount + 1,
          };

          const scheduleJobPayload: ScheduleJobCreateDto = {
            type: ScheduleJobType.REFERRAL_DONE_STATUS_REMINDER,
            scheduleTime: scheduleTime.toUTC().toFormat("yyyy-MM-dd'T'HH:mm:ss"),
            input: payload,
            desc: `Check referral status and send WhatsApp reminder for ${refereeEmail} if still accepted`,
            status: ScheduleJobStatus.SCHEDULED,
          };

          await ScheduleJobService.createScheduleJob(scheduleJobPayload);
        }
      } else {
        global.logger.info(
          `Skipping sending WhatsApp message to ${refereeEmail}.`,
          {
            remainderCount: currentReminderCount,
            methodName: this.reviewReferralDoneStatusReminder.name,
          }
        );
      }
    } else {
      global.logger.info(
        "Referral status has changed. No further reminders will be sent."
      );
    }

    return true;
  }

  /**
   * sendEmailToEmpWhenReferralRequestAccepted - Function to send an email notification to employer when a referral request is accepted by him
   *
   * @param {EmailTemplatePlaceholderEMP_ACCEPTED_REFERRAL_REQ_NOTIFCATION} emailPlaceholders - Placeholders for email content
   * @param {EmailSourceDestinationAddress} toAddress - Email address and full name of the recipient
   * @returns {Promise<{ awsMessageId: string | null }>} - Promise resolving to AWS message ID or null
   */
  async sendEmailToEmpWhenReferralRequestAccepted(
    emailPlaceholders: EmailTemplatePlaceholderEMP_ACCEPTED_REFERRAL_REQ_NOTIFCATION,
    toAddress: EmailSourceDestinationAddress
  ): Promise<{ awsMessageId: string | null }> {
    // Send email using the email library with the specified template, recipient, and placeholders
    return emailLibrary.sendEmail(
      EmailTemplateEnum.EMP_ACCEPTED_REFERRAL_REQ_NOTIFCATION,
      toAddress,
      emailPlaceholders
    );
  }

  /**
   * sendEmailToEmpWhenReferralRequestCompleted - Function to send an email notification to employer when a referral request is completed by him
   *
   * @param {EmailTemplatePlaceholderEMP_REFFERAL_DONE_FOR_CAND} emailPlaceholders - Placeholders for email content
   * @param {EmailSourceDestinationAddress} toAddress - Email address and full name of the recipient
   * @returns {Promise<{ awsMessageId: string | null }>} - Promise resolving to AWS message ID or null
   */
  async sendEmailToEmpWhenReferralRequestCompleted(
    emailPlaceholders: EmailTemplatePlaceholderEMP_REFFERAL_DONE_FOR_CAND,
    toAddress: EmailSourceDestinationAddress
  ): Promise<{ awsMessageId: string | null }> {
    // Send email using the email library with the specified template, recipient, and placeholders
    return emailLibrary.sendEmail(
      EmailTemplateEnum.EMP_REFFERAL_DONE_FOR_CAND,
      toAddress,
      emailPlaceholders
    );
  }

  /**
   * Updates an existing user Referral.
   *
   * @param PK - PK of the user
   * @param SK - SK of the user
   * @param userReferralDTO - Data Transfer Object containing updated user Referral Referrals
   * @param status - The status to update the referral to (e.g. 'ACCEPT', 'DONE')
   * @returns {Promise<any>} - A Promise that resolves when the Referral is successfully updated
   */
  async update(
    PK: string,
    SK: string,
    userReferralDTO: UserReferralDTO,
    status: string
  ): Promise<any> {
    // Logging the action of updating user Referral in the service layer
    logger.info("Updating user Referral [UserReferralService]");
    // Extract the candidate's email from the PK
    const candEmail: string = PK.split("#").pop() ?? "";
    // Fetch the candidate's details
    const candDetails = await UserDetailService.get(candEmail);
    // Get the candidate's name
    const candName = candDetails.length > 0 ? candDetails[0].name ?? "" : "";
    logger.debug(`Candidate Name: ${candName}`);

    // Get the name of the company for which the referral request got accepted
    const companyId = userReferralDTO.companyId;
    const companyDetails = await CompanyService.getCompanyDetailsByIds([
      companyId,
    ]);

    if (!companyDetails || companyDetails.length === 0) {
      throw new Error("Company not found");
    }
    const companyName = companyDetails[0].name;

    // Update the referral
    let result = await userReferralDao.update(PK, SK, userReferralDTO);

    UserReferralService.performCountUserActivitiesAfterReferralUpdateForCand(result);
    UserReferralService.performCountGlobalActivitiesAfterReferralUpdate(result);

    if (result) {
      // Update the referral counts if the status is 'ACCEPT' or 'DONE'
      if (
        status === ReferralActions.ACCEPT ||
        status === ReferralActions.DONE
      ) {
        const userSubscriptionId = userReferralDTO.userSubscriptionId;
        await UserReferralService.calculateAndUpdateReferralCounts(
          candEmail,
          userSubscriptionId,
          status
        );
      }

      // Handle the different actions (accept, done) and send emails accordingly
      if (status === ReferralActions.ACCEPT) {
        // Get the name and email of the referee who accepted the referral request
        const empId = userReferralDTO.acceptedByUserId as string;
        const empDetails = await UserDetailService.getUserById(empId);
        const refereeName = empDetails[0].name;
        const refereeEmail = empDetails[0].emailList.primary;
        let jobUrl = userReferralDTO.jobUrl;

        // Retrieve the candidate's details by email
        const candDetails = await UserDetailService.get(candEmail);

        /**
         * - If isWhatsappNotificationEnabled is `undefined` then Send whatsapp message
         * - If isWhatsappNotificationEnabled is `true` then Send whatsapp message
         * - If isWhatsappNotificationEnabled is `false` then Don't Send whatsapp message
         */
        if (
          WHATSAPP_BUSINESS_PARTNER_APP_CONSTANTS.ENABLED &&
          candDetails[0].isWhatsappNotificationEnabled !== false
        ) {
          // Encode the job URL
          const encodedUrl: string = urlHelperObj.encodeQueryString(jobUrl);

          let whatsAppBusinessPartnerPlaceholders: WhatsAppBusinessPartnerTemplatePlaceholderCAND_REFERRAL_REQUEST_ACCEPTED_CANDIDATE =
            {
              candidateName: candName.toTitleCase(),
              companyName: companyName,
              jobUrl: encodedUrl,
              employeeName: refereeName.toTitleCase(),
            };

          // Send WhatsApp message to employee
          await whatsAppBusinessPartnerLibraryObj.sendWhatsAppBusinessPartnerWhatsappMessage(
            WhatsAppBusinessPartnerTemplateNameEnum.CAND_REFERRAL_REQUEST_ACCEPTED_CANDIDATE,
            candDetails[0].number.strtr({ "+": "" }), // To Phone Number
            whatsAppBusinessPartnerPlaceholders,
            candEmail
          );


          await this.scheduleReferralDoneStatusReminder(
            refereeEmail,
            refereeName,
            result.id,
            1,
          );
        } else {
          global.logger.info(
            `Whatsapp notification is not enabled for email: ${candEmail}`
          );
        }

        // Prepare the necessary parameters required for the sendEmailToCandWhenReferralRequestAccepted function
        const toAddress: EmailSourceDestinationAddress = {
          email: candEmail,
          fullName: candName,
        };
        const emailPlaceholders: EmailTemplatePlaceholderCAND_REFERRAL_REQ_ACCEPTED =
          {
            candName: candName.toTitleCase(),
            companyName: companyName,
            refereeName: refereeName.toTitleCase(),
            workoAppUrl: APP_CONSTANTS.FRONTEND_URLS.WORKO_APP_URL,
            ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
          };

        // Prepare the necessary parameters required for the sendEmailToEmpWhenReferralRequestAccepted function
        const emptoAddress: EmailSourceDestinationAddress = {
          email: refereeEmail,
          fullName: refereeName,
        };

        const empemailPlaceholders: EmailTemplatePlaceholderEMP_ACCEPTED_REFERRAL_REQ_NOTIFCATION =
          {
            empName: refereeName.toTitleCase(),
            candName: candName.toTitleCase(),
            workoChatUrl: APP_CONSTANTS.FRONTEND_URLS.WORKO_EMP_REFERRAL_LISTING_URL,
            ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
          };

        // Send emails to the candidate and the employee
        await Promise.all([
          UserReferralService.sendEmailToCandWhenReferralRequestAccepted(
            emailPlaceholders,
            toAddress
          ),
          this.sendEmailToEmpWhenReferralRequestAccepted(
            empemailPlaceholders,
            emptoAddress
          ),
        ]);
      }
      // When employee marks the referral request as done, email will be sent to candidate
      else if (status === ReferralActions.DONE) {
        // Get the name and email of the referee who completed the referral request
        const empId = userReferralDTO.doneByUserId as string;
        const empDetails = await UserDetailService.getUserById(empId);
        const refereeName = empDetails[0].name;
        const refereeEmail = empDetails[0].emailList.primary;
        const jobUrl = userReferralDTO.jobUrl;

        // Retrieve the candidate's details by email
        const candDetails = await UserDetailService.get(candEmail);

        /**
         * - If isWhatsappNotificationEnabled is `undefined` then Send whatsapp message
         * - If isWhatsappNotificationEnabled is `true` then Send whatsapp message
         * - If isWhatsappNotificationEnabled is `false` then Don't Send whatsapp message
         */
        if (
          WHATSAPP_BUSINESS_PARTNER_APP_CONSTANTS.ENABLED &&
          candDetails[0].isWhatsappNotificationEnabled !== false
        ) {
          // Encode the job URL
          const encodedUrl: string = urlHelperObj.encodeQueryString(jobUrl);

          let whatsAppBusinessPartnerPlaceholders: WhatsAppBusinessPartnerTemplatePlaceholderCAND_REFERRAL_REQUEST_COMPLETED_CANDIDATE =
            {
              candidateName: candName.toTitleCase(),
              companyName: companyName,
              jobUrl: encodedUrl,
              employeeName: refereeName.toTitleCase(),
            };

          // Send WhatsApp message to employee
          await whatsAppBusinessPartnerLibraryObj.sendWhatsAppBusinessPartnerWhatsappMessage(
            WhatsAppBusinessPartnerTemplateNameEnum.CAND_REFERRAL_REQUEST_COMPLETED_CANDIDATE,
            candDetails[0].number.strtr({ "+": "" }), // To Phone Number
            whatsAppBusinessPartnerPlaceholders,
            candEmail // reciever email
          );
        } else {
          global.logger.info(
            `Candidate's whatsapp notification is not enabled for email: ${candEmail}`
          );
        }

        // Prepare the necessary parameters required for the sendEmailToCandWhenReferralRequestCompleted function
        const toAddress: EmailSourceDestinationAddress = {
          email: candEmail,
          fullName: candName,
        };
        const emailPlaceholders: EmailTemplatePlaceholderCAND_REFERRAL_REQ_COMPLETED =
          {
            candName: candName.toTitleCase(),
            companyName: companyName,
            ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
          };

        // Prepare the necessary parameters required for the sendEmailToEmpWhenReferralRequestCompleted function
        const emptoAddress: EmailSourceDestinationAddress = {
          email: refereeEmail,
          fullName: refereeName,
        };

        const empemailPlaceholders: EmailTemplatePlaceholderEMP_REFFERAL_DONE_FOR_CAND =
          {
            empName: refereeName.toTitleCase(),
            candidateName: candName.toTitleCase(),
            workoReferralUrl: APP_CONSTANTS.FRONTEND_URLS.WORKO_EMP_REFERRAL_LISTING_URL,
            ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
          };

        // Send emails to the candidate and the employee
        await Promise.all([
          UserReferralService.sendEmailToCandWhenReferralRequestCompleted(
            emailPlaceholders,
            toAddress
          ),
          this.sendEmailToEmpWhenReferralRequestCompleted(
            empemailPlaceholders,
            emptoAddress
          ),
        ]);
      }
    }
    return result;
  }

  /**
   * Updates the referral status by an employee.
   *
   * @param referralId - The ID of the referral to update
   * @param referralStatusUpdate - An object containing the updated referral status and additional information
   * @param userId - The ID of the employee updating the referral
   * @param empEmail - The email of the employee updating the referral
   * @returns {Promise<any>} - A Promise that resolves when the referral status is successfully updated
   */
  async updateReferralStatusByEmp(
    referralId: string,
    referralStatusUpdate: any,
    userId: string,
    empEmail: string
  ): Promise<any> {
    global.logger.info(
      "Updating Referral Status By Employee [UserReferralEMP service]"
    );
    // Fetch the referral
    let referral = await UserReferralService.getByGSI1(referralId);
    if (!referral || referral.count === 0) {
      throw new Error("Wrong referralId");
    }

    // Fetch the referral response
    let referralResponse: QueryResponse<DbUserReferralResponseDto> = await UserReferralResponseService.get(empEmail);
    let updateReferralResponse = referralResponse.count !== 0;

    // Initialize the userReferralResponseDTO
    let userReferralResponseDTO: UserReferralResponseDTO = {
      passedRefIds: [],
      rejectedRefIds: [],
      acceptedRefIds: [],
      doneRefIds: [],
    };

    const currentDate = DateTime.now();

    // Handle different actions
    switch (referralStatusUpdate.action) {
      case ReferralActions.PASS:
        // Check if the referral has already been passed by the employee
        if (
          referral[0].passedByUserIds &&
          referral[0].passedByUserIds.some(
            (passedUser: { userId: string }) => passedUser.userId === userId
          )
        ) {
          throw new Error("The referral has already been passed by you.");
        }
        // Add the employee's pass action to the referral
        if (
          !referral[0].passedByUserIds ||
          referral[0].passedByUserIds.length === 0
        ) {
          referral[0].passedByUserIds = [
            { userId, actionDate: currentDate.toISO() },
          ];
        } else {
          referral[0].passedByUserIds.push({
            userId,
            actionDate: currentDate.toISO(),
          });
        }
        // Update the referral response
        if (updateReferralResponse) {
          referralResponse[0].passedRefIds.push(referralId);
        } else {
          userReferralResponseDTO.passedRefIds.push(referralId);
        }
        break;

      case ReferralActions.REJECT:
        // Check if the referral has already been rejected by the employee
        if (
          referral[0].rejectedByUserIds &&
          referral[0].rejectedByUserIds.some(
            (rejectedUserId: { userId: string }) =>
              rejectedUserId.userId === userId
          )
        ) {
          throw new BaseError("The referral has already been rejected by you.", HttpStatusCode.BAD_REQUEST_400);
        }
        // Add the employee's rejection to the referral
        if (
          !referral[0].rejectedByUserIds ||
          referral[0].rejectedByUserIds.length === 0
        ) {
          referral[0].rejectedByUserIds = [
            {
              userId: userId,
              actionDate: currentDate.toISODate(),
              reason: referralStatusUpdate.reason,
              userComment: referralStatusUpdate.userComment,
            },
          ];
        } else {
          referral[0].rejectedByUserIds.push({
            userId: userId,
            actionDate: currentDate.toISODate(),
            reason: referralStatusUpdate.reason,
            userComment: referralStatusUpdate.userComment,
          });
        }
        // Update the referral response
        if (updateReferralResponse) {
          referralResponse[0].rejectedRefIds.push(referralId);
        } else {
          userReferralResponseDTO.rejectedRefIds.push(referralId);
        }
        break;

      case ReferralActions.ACCEPT:
        // Check if the referral has already been accepted by another employee
        if (referral[0].acceptedByUserId) {
          throw new Error("Referral already accepted by other employee");
        }
        // Update the referral with the employee's accept action
        referral[0].acceptedByUserId = userId;
        referral[0].status = ReferralStatus.ACCEPTED;
        referral[0].acceptedAtByUser = currentDate.toJSDate();
        // Update the referral response
        if (updateReferralResponse) {
          referralResponse[0].acceptedRefIds.push(referralId);
        } else {
          userReferralResponseDTO.acceptedRefIds.push(referralId);
        }
        break;

      case ReferralActions.DONE:
        // Check if the referral has already been marked as done by the employee
        if (referral[0].doneByEmployee) {
          throw new Error("Referral already done by you");
        }
        // If the referral was previously accepted, remove it from the accepted list
        if (referral[0].status === ReferralStatus.ACCEPTED) {
          const index = referralResponse[0].acceptedRefIds.indexOf(referralId);
          if (index !== -1) {
            referralResponse[0].acceptedRefIds.splice(index, 1);
          }
        }
        // Update the referral with the employee's done action
        referral[0].doneByEmployee = currentDate.toJSDate();
        referral[0].doneByUserId = userId;
        referral[0].status = ReferralStatus.DONE;
        // Update the referral response
        if (updateReferralResponse) {
          if (referralResponse[0].doneRefIds) {
            referralResponse[0].doneRefIds.push(referralId);
          } else {
            referralResponse[0].doneRefIds = [referralId];
          }
        } else {
          userReferralResponseDTO.doneRefIds.push(referralId);
        }
        break;

      default:
        throw new Error("Invalid action provided");
    }

    // Update the referral
    const { PK, SK, updatedAt, ...userReferralDTO } = referral[0];
    const result = await this.update(
      PK,
      SK,
      userReferralDTO,
      referralStatusUpdate.action
    );

    // Update or create the referral response
    let updatedReferralResponseDetails: DbUserReferralResponseDto;
    if (updateReferralResponse) {
      const { passedRefIds, rejectedRefIds, acceptedRefIds, doneRefIds } =
        referralResponse[0];
      updatedReferralResponseDetails = await UserReferralResponseService.update(empEmail, {
        passedRefIds,
        rejectedRefIds,
        acceptedRefIds,
        doneRefIds,
      });
    } else {
      updatedReferralResponseDetails = await UserReferralResponseService.create(
        empEmail,
        userReferralResponseDTO
      );
    }

    UserReferralResponseService.performCountUserActivitiesAfterUserReferralResponseUpdate(
      empEmail,
      updatedReferralResponseDetails
    )
  }
}
// Export an instance of the UserReferralEmpService class
const userReferralEmpServiceObj = new UserReferralEmpService();
export {
  userReferralEmpServiceObj,
  UserReferralEmpService
};
