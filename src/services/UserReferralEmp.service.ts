// Import DateTime Library
import { DateTime } from "luxon";

// Import DAOs
import userReferralDao from "../daos/UserReferral.dao";

// Import Models
import { DbUserExperienceDto } from "../db/models/UserExperience.model";
import { DbUserReferralDto } from "../db/models/UserReferral.model";

// Import DTOs
import {
  EmailTemplatePlaceholderEMP_RECEIVED_REFERRAL_REQ_NOTIFICATION,
  EmailTemplatePlaceholderEMP_ACCEPTED_REFERRAL_REQ_NOTIFCATION,
  EmailTemplatePlaceholderEMP_REFFERAL_DONE_FOR_CAND,
  EmailTemplatePlaceholderCAND_REFERRAL_REQ_ACCEPTED,
  EmailTemplatePlaceholderCAND_REFERRAL_REQ_COMPLETED,
} from "../dtos/EmailTemplatePlaceholder.dto";
import { UserReferralResponseDTO } from "../dtos/UserReferralResponse.dto";
import { UserReferralDTO } from "../dtos/UserReferral.dto";
import { ScheduleJobReferralReminderInputDto, ScheduleJobCreateDto } from "../dtos/ScheduleJob.dto";
import { GrowaasanTemplatePlaceholderCAND_REFERRAL_REQUEST_ACCEPTED_CANDIDATE, GrowaasanTemplatePlaceholderCAND_REFERRAL_REQUEST_COMPLETED_CANDIDATE, GrowaasanTemplatePlaceholderEMP_ACCEPTED_REQUEST_COUNT_EMPLOYEE, GrowaasanTemplatePlaceholderEMP_NEW_REFERRAL_REQUEST_EMPLOYEE, GrowaasanTemplatePlaceholderEMP_PENDING_REQUEST_COUNT_EMPLOYEE, GrowaasanTemplatePlaceholderEMP_REFERRAL_REQUEST_PENDING_EMPLOYEE } from "../dtos/GrowaasanTemplatePlaceholder.dto";
import { GrowaasanPhoneNumberDto } from "../dtos/Growaasan.dto";

// Import Enums
import { EmailTemplateEnum } from "../enums/EmailTemplate.enum";
import { ReferralActions } from "../enums/User.enum";
import { ReferralStatus } from "../enums/UserReferral.enum";
import { ScheduleJobType, ScheduleJobStatus } from "../enums/ScheduleJob.enum";
import { GrowaasanTemplateNameEnum } from "../enums/GrowaasanTemplate.enum";

// Import Libraries
import { EmailSourceDestinationAddress, emailLibrary } from "../libraries/email.library";
import { growaasanLibraryObj } from "../libraries/Growaasan.library";

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

// import constants
import { WHATSAPP_APP_CONSTANTS } from "../configs/constants/Whatsapp.constant";
import { GROWAASAN_APP_CONSTANTS } from "../configs/constants/Growaasan.constant";

/**
 *  UserReferralEmpService class responsible for managing employee-related referral operations.
 */
class UserReferralEmpService {
  /**
   * getEmployeeReferrals
   *
   * Retrieves employee referrals based on their primary email, company ID, and referral status.
   *
   * @param {string} empPrimaryEmail - Employee's primary email
   * @param {string} companyId - Company ID
   * @param {string} referralStatus - Referral status
   */
  async getEmployeeReferrals(
    empPrimaryEmail: string,
    companyId: string,
    referralStatus: string
  ): Promise<DbUserReferralDto[]> {
    // If referralStatus is AWAITING then fetch the details
    if (referralStatus === ReferralStatus.AWAITING) {
      // If status is awaiting, call the function to get awaiting referrals
      return this.getEmployeeAwaitingReferrals(
        empPrimaryEmail,
        companyId,
        referralStatus
      );
    } else {
      // Otherwise, call the function to get referrals by status
      return this.getEmployeeReferralsByStatus(empPrimaryEmail, referralStatus);
    }
  }

  /**
   * getEmployeeAwaitingReferrals
   *
   * Retrieves employee awaiting referrals based on their primary email and company ID.
   *
   * @param {string} empPrimaryEmail - Employee's primary email
   * @param {string} companyId - Company ID
   * @param {string} referralStatus - Referral status
   * @returns {Promise<DbUserReferralDto[]>} - A Promise that resolves to the awaiting referrals
   */
  async getEmployeeAwaitingReferrals(
    empPrimaryEmail: string,
    companyId: string,
    referralStatus: string
  ): Promise<DbUserReferralDto[]> {
    try {
      // Get employee's responses given to different referrals by empPrimaryEmail
      const userReferralResponse = await UserReferralResponseService.get(
        empPrimaryEmail
      );
      const empPassedRefIds = Array.from(
        new Set(userReferralResponse[0]?.passedRefIds || [])
      );
      const empRejectedRefIds = Array.from(
        new Set(userReferralResponse[0]?.rejectedRefIds || [])
      );
      const referralIdsToBeExcluded = [
        ...empPassedRefIds,
        ...empRejectedRefIds,
      ];

      // Get company referrals where status is awaiting
      const companyReferrals = await userReferralDao.getByGSI1PKAndStatus(
        companyId,
        referralStatus
      );

      /**
       * `!` negates the value, meaning if the length is 0 (i.e., the array is empty),
       * the condition evaluates to true.
       *
       * If the condition is true (i.e., referralIdsToBeExcluded is an empty array),
       * the function immediately returns companyReferrals.
       */
      if (!referralIdsToBeExcluded.length) {
        return companyReferrals;
      }

      // NOTE : This block filters the referrals on which the emp has not taken any action
      // @todo : Investigated and see if this can be handle by dynamouse itself
      const awaitingCompanyReferrals = [];
      for (const referral of companyReferrals) {
        if (!referralIdsToBeExcluded.includes(referral.id)) {
          awaitingCompanyReferrals.push(referral);
        }
      }
      global.logger.info(
        "Filtered Company Referrals:",
        awaitingCompanyReferrals
      );

      return awaitingCompanyReferrals;
    } catch (error) {
      global.logger.error("Error fetching employee awaiting referrals:", error);
      throw error;
    }
  }

  /**
   * getEmployeeReferralsByStatus
   *
   * Retrieves employee referrals based on their primary email and referral status.
   *
   * @param {string} empPrimaryEmail - Employee's primary email
   * @param {string} referralStatus - Referral status
   * @returns { Promise<QueryResponse<DbUserReferralDto>[]> } - A Promise that resolves to the employee referrals
   */
  async getEmployeeReferralsByStatus(
    empPrimaryEmail: string,
    referralStatus: string
  ): Promise<DbUserReferralDto[]> {
    // Get company referrals where status is referralStatus
    let attributes: string[] = [];

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

    if (!userReferralResponse.length) {
      global.logger.info("No referrals found for the given email");
      return [];
    }

    // Extract referral IDs based on referralStatus attribute
    const refIds: string[] = userReferralResponse[0][attributes[0]];

    // Fetch referral details
    if (!refIds.length) {
      return [];
    }
    let result = await userReferralDao.getReferralsByIdsUsingGsis(refIds);
    return result.filter(
      (referral) => referral !== null
    ) as DbUserReferralDto[];
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
   * sendGrowaasanWhatsappMsgtoEmployeesOnReferralCreation
   *
   * Sends a Growaasan WhatsApp message to all employees of a company when a referral was raised by a candidate on a paricular company.
   *
   * @param {string} candName - The name of the candidate.
   * @param {number} matchingScore - The matching score of the candidate.
   * @param {string} jobUrl - The URL of the job.
   * @param {string} companyId - The ID of the company.
   * @returns {Promise<boolean>} - A promise that resolves to true if all messages are sent successfully.
   */
  async sendGrowaasanWhatsappMsgtoEmployeesOnReferralCreation(
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
    const employeesBatch = companyEmployees.map(async (employee) => {
      // Extract the employee email from the PK field
      const empEmail = employee.PK.split("#")[2];

      // Fetch employee details
      const empDetails = await UserDetailService.get(empEmail);
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
       * NOTE:- As of now we are verifying user "isEmailVerified" attribute to send whatsapp message to the user
       * but in near future we will verify user "isNumberVerified" attribute to send whatsapp message to the user
       *
       * Check if user has isEmailVerified true or false, if true then send whatsapp message to the user
       */
      if (empDetails[0].isEmailVerified) {
        // Prepare placeholders for the Growaasan message
        const growaasanPlaceholders: GrowaasanTemplatePlaceholderEMP_NEW_REFERRAL_REQUEST_EMPLOYEE =
          {
            employeeName: refereeName.toTitleCase(),
            candidateName: candName.toTitleCase(),
            matchingScore: matchingScore.toString(),
            jobUrl: jobUrl,
          };

        await growaasanLibraryObj.sendGrowaasanWhatsappMessage(
          GrowaasanTemplateNameEnum.EMP_NEW_REFERRAL_REQUEST_EMPLOYEE,
          refereeEmail,
          {
            countryCode: GROWAASAN_APP_CONSTANTS.COUNTRY_CODE,
            phoneNumber: parseInt(empDetails[0].number as string),
          },
          growaasanPlaceholders
        );
      } else {
        // Log an info message if the employee's number is not verified
        global.logger.info(
          `The employee's "${refereeEmail}" is not verified. WhatsApp message cannot be sent for the referral.`,
          {
            companyId: companyId,
          }
        );
      }
    });
    global.logger.info(
      `Processed ${employeesBatch.length} WhatsApp messages sending tasks so far for companyId: ${companyId}`
    );

    // Wait for all message sending promises to complete
    await Promise.all(employeesBatch);

    global.logger.info(`WhatsApp Message Sent Successfully!`, {
      filePath: __filename,
      methodName:
        this.sendGrowaasanWhatsappMsgtoEmployeesOnReferralCreation.name,
    });
    return true;
  }

  /**
   * sendGrowaasanWhatsappMsgToEmpAboutPendingAwaitingReferralRequestCount
   *
   * Sends a WhatsApp message to an employee about pending awaiting referral request counts.
   *
   * @param {string} empEmail - The email of the employee.
   * @param {string} companyId - The ID of the company.
   * @returns {Promise<boolean>} - A promise that resolves to true if the message is sent successfully.
   */
  async sendGrowaasanWhatsappMsgToEmpAboutPendingAwaitingReferralRequestCount(
    empEmail: string,
    companyId: string
  ): Promise<boolean> {
    // Get the number of pending awaiting referrals for the employee
    let empReferrals = await this.getEmployeeAwaitingReferrals(
      empEmail,
      companyId,
      ReferralStatus.AWAITING
    );
    let empAwaitingReferralCounts = empReferrals.length;

    // Retrive the employee details and check if the employee exists
    const empDetails = await UserDetailService.get(empEmail);
    if (!empDetails.count) {
      global.logger.info(`Employee details not found for email "${empEmail}".`);
      return true;
    }

    /**
     * NOTE:- As of now we are verifying user "isEmailVerified" attribute to send whatsapp message to the user
     * but in near future we will verify user "isNumberVerified" attribute to send whatsapp message to the user
     *
     * Check if user has isEmailVerified true or false, if true then send whatsapp message to the user
     */
    if (empDetails[0].isEmailVerified) {
      let growaasanPlaceholders: GrowaasanTemplatePlaceholderEMP_PENDING_REQUEST_COUNT_EMPLOYEE =
        {
          employeeName: empDetails[0].name,
          countOfPendingAwaitedReferralRequests:
            empAwaitingReferralCounts.toString(),
        };

      await growaasanLibraryObj.sendGrowaasanWhatsappMessage(
        GrowaasanTemplateNameEnum.EMP_PENDING_REQUEST_COUNT_EMPLOYEE,
        empEmail,
        {
          countryCode: GROWAASAN_APP_CONSTANTS.COUNTRY_CODE,
          phoneNumber: parseInt(empDetails[0].number),
        },
        growaasanPlaceholders
      );

      global.logger.info(
        `WhatsApp Message for ${GrowaasanTemplateNameEnum.EMP_PENDING_REQUEST_COUNT_EMPLOYEE} Sent Successfully!`,
        {
          filePath: __filename,
          methodName:
            this
              .sendGrowaasanWhatsappMsgToEmpAboutPendingAwaitingReferralRequestCount
              .name,
          empEmail: empEmail,
        }
      );
    } else {
      global.logger.info(
        `Employee's number for "${empEmail}" is not verified. WhatsApp message not sent.`
      );
    }
    return true;
  }

  /**
   * sendGrowaasanWhatsappMsgToEmpAboutPendingAcceptedReferralRequestCount
   *
   * Sends a WhatsApp message to an employee about pending accepted referral requests.
   *
   * Sends a WhatsApp message to an employee about pending accepted referral requests.
   * The message is sent using the Growaasan cloud API integration.
   *
   * @todo - need to trigger this function and make required changes accordingly
   * @param {string} empEmail - Email address of the employee to send the message to.
   * @param {GrowaasanPhoneNumberDto} toPhoneNumber - Phone number of the employee to send the message to.
   * @param {GrowaasanTemplatePlaceholderEMP_ACCEPTED_REQUEST_COUNT_EMPLOYEE} growaasanPlaceholders - The placeholders for the message template.
   * @returns {Promise<boolean>} - Returns a promise that resolves when the message is sent.
   */
  async sendGrowaasanWhatsappMsgToEmpAboutPendingAcceptedReferralRequestCount(
    empEmail: string,
    toPhoneNumber: GrowaasanPhoneNumberDto,
    growaasanPlaceholders: GrowaasanTemplatePlaceholderEMP_ACCEPTED_REQUEST_COUNT_EMPLOYEE
  ): Promise<boolean> {
    await growaasanLibraryObj.sendGrowaasanWhatsappMessage(
      GrowaasanTemplateNameEnum.EMP_ACCEPTED_REQUEST_COUNT_EMPLOYEE,
      empEmail,
      toPhoneNumber,
      growaasanPlaceholders
    );

    global.logger.info(
      `WhatsApp Message for ${GrowaasanTemplateNameEnum.EMP_ACCEPTED_REQUEST_COUNT_EMPLOYEE} Sent Successfully!`,
      {
        filePath: __filename,
        methodName:
          this
            .sendGrowaasanWhatsappMsgToEmpAboutPendingAcceptedReferralRequestCount
            .name,
        empEmail: empEmail,
      }
    );
    return true;
  }

  async scheduleReferralDoneStatusReminder(
    email: string,
    empName: string,
    referralId: string
  ): Promise<boolean> {
    // This is a delay before the first reminder is sent. Usually, this is 24 hours for PROD and 20 mins for Dev
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
   *
   * @returns {Promise<boolean>} - Returns a promise that resolves with a boolean indicating if the message was sent or not.
   */
  async reviewReferralDoneStatusReminder(
    referralId: string,
    userEmail: string
  ): Promise<boolean> {
    global.logger.info(
      `Reviewing referral completion status for referral ID: ${referralId}`,
      {
        filePath: __filename,
        methodName: this.reviewReferralDoneStatusReminder.name,
        userEmail: userEmail,
      }
    );

    // Fetch user referral details using referral ID and user email
    let userReferralDetails =
      await UserReferralService.getUserReferralByReferralId(
        userEmail,
        referralId
      );

    // If referral details are not found, throw an error
    if (!userReferralDetails) {
      throw new BaseError(
        `The referral details not found for the provided referral ID "${referralId}" and email "${userEmail}".`
      );
    }

    // Check if the referral is in the "accepted" status , if yes then send whatsapp message to employee
    if (userReferralDetails.status === ReferralStatus.ACCEPTED) {
      // Get the name and email of the referee who accepted the referral request
      const empId = userReferralDetails.acceptedByUserId as string;
      const empDetails = await UserDetailService.getUserById(empId);
      const refereeName = empDetails[0].name;
      const refereeEmail = empDetails[0].emailList.primary;
      let candEmail = userReferralDetails.PK.split("#")[2];
      let candDetails = await UserDetailService.get(candEmail);

      /**
       * NOTE:- As of now we are verifying user "isEmailVerified" attribute to send whatsapp message to the user
       * but in near future we will verify user "isNumberVerified" attribute to send whatsapp message to the user
       *
       * Check if user has isEmailVerified true or false, if true then send whatsapp message to the user
       */
      if (empDetails[0].isEmailVerified) {
        let growaasanPlaceholders: GrowaasanTemplatePlaceholderEMP_REFERRAL_REQUEST_PENDING_EMPLOYEE =
          {
            employeeName: refereeName.toTitleCase(),
            candidateName: candDetails[0].name.toTitleCase(),
          };

        await this.sendGrowaasanWhatsappMsgToEmpAboutPendingAcceptedReferralRequest(
          growaasanPlaceholders,
          {
            countryCode: GROWAASAN_APP_CONSTANTS.COUNTRY_CODE,
            phoneNumber: parseInt(empDetails[0].number as string),
          },
          refereeEmail
        );

        // Schedule the next reminder after the 36 hours on prod and 20 min on dev
        const delay =
          WHATSAPP_APP_CONSTANTS.EMP_REF_VALIDATE_DONE_STATUS_REMINDER_INTERVAL;
        const scheduleTime = DateTime.now().plus({ milliseconds: delay });

        const scheduleJobPayload: ScheduleJobCreateDto = {
          type: ScheduleJobType.REFERRAL_DONE_STATUS_REMINDER,
          scheduleTime: scheduleTime.toUTC().toFormat("yyyy-MM-dd'T'HH:mm:ss"),
          input: { email: refereeEmail, empName: refereeName, referralId },
          desc: `Check referral status and send WhatsApp reminder for ${refereeEmail} if still accepted`,
          status: ScheduleJobStatus.SCHEDULED,
        };

        await ScheduleJobService.createScheduleJob(scheduleJobPayload);
      } else {
        global.logger.info(
          `Employee's number is not verified. WhatsApp message not sent.`
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
   * sendGrowaasanWhatsappMsgToEmpAboutPendingAcceptedReferralRequest
   *
   * Sends a WhatsApp message to an employee about pending accepted referral requests.
   *
   * @param {GrowaasanTemplatePlaceholderEMP_REFERRAL_REQUEST_PENDING_EMPLOYEE} growaasanPlaceholders - Placeholders for the WhatsApp message.
   * @param {GrowaasanPhoneNumberDto} toPhoneNumber - The phone number to send the message to.
   * @param {string} empEmail - The email address of the employee.
   * @returns {Promise<boolean>} - A promise that resolves to true if the message is sent successfully.
   */
  async sendGrowaasanWhatsappMsgToEmpAboutPendingAcceptedReferralRequest(
    growaasanPlaceholders: GrowaasanTemplatePlaceholderEMP_REFERRAL_REQUEST_PENDING_EMPLOYEE,
    toPhoneNumber: GrowaasanPhoneNumberDto,
    empEmail: string
  ): Promise<boolean> {
    await growaasanLibraryObj.sendGrowaasanWhatsappMessage(
      GrowaasanTemplateNameEnum.EMP_REFERRAL_REQUEST_PENDING_EMPLOYEE,
      empEmail,
      toPhoneNumber,
      growaasanPlaceholders
    );

    global.logger.info(
      `WhatsApp Message for ${GrowaasanTemplateNameEnum.EMP_REFERRAL_REQUEST_PENDING_EMPLOYEE} Sent Successfully!`,
      {
        filePath: __filename,
        methodName:
          this.sendGrowaasanWhatsappMsgToEmpAboutPendingAcceptedReferralRequest
            .name,
        empEmail: empEmail,
      }
    );
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
         * NOTE:- As of now we are verifying user "isEmailVerified" attribute to send whatsapp message to the user
         * but in near future we will verify user "isNumberVerified" attribute to send whatsapp message to the user
         *
         * Check if user has isEmailVerified true or false, if true then send whatsapp message to the user
         */
        if (candDetails[0].isEmailVerified) {
          let growaasanPlaceholders: GrowaasanTemplatePlaceholderCAND_REFERRAL_REQUEST_ACCEPTED_CANDIDATE =
            {
              candidateName: candName.toTitleCase(),
              companyName: companyName,
              jobUrl: jobUrl,
              employeeName: refereeName.toTitleCase(),
            };

          await UserReferralService.sendGrowaasanWhatsappMsgToCandWhenReferralRequestAccepted(
            growaasanPlaceholders,
            {
              countryCode: GROWAASAN_APP_CONSTANTS.COUNTRY_CODE,
              phoneNumber: parseInt(candDetails[0].number),
            },
            refereeEmail // employee's email
          );
          await this.scheduleReferralDoneStatusReminder(
            refereeEmail,
            refereeName,
            result.id
          );
        } else {
          global.logger.info(
            `Candidate's number for "${candEmail}" is not verified. WhatsApp message not sent.`
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
         * NOTE:- As of now we are verifying user "isEmailVerified" attribute to send whatsapp message to the user
         * but in near future we will verify user "isNumberVerified" attribute to send whatsapp message to the user
         *
         * Check if user has isEmailVerified true or false, if true then send whatsapp message to the user
         */
        if (candDetails[0].isEmailVerified) {
          let growaasanPlaceholders: GrowaasanTemplatePlaceholderCAND_REFERRAL_REQUEST_COMPLETED_CANDIDATE =
            {
              candidateName: candName.toTitleCase(),
              companyName: companyName,
              jobUrl: jobUrl,
              employeeName: refereeName.toTitleCase(),
            };

          await UserReferralService.sendGrowaasanWhatsappMsgToCandWhenReferralRequestCompleted(
            growaasanPlaceholders,
            {
              countryCode: GROWAASAN_APP_CONSTANTS.COUNTRY_CODE,
              phoneNumber: parseInt(candDetails[0].number),
            },
            candEmail // user email
          );
        } else {
          global.logger.info(
            `Candidate's "${candEmail}" is not verified. WhatsApp message not sent.`
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
          };

        // Prepare the necessary parameters required for the sendEmailToEmpWhenReferralRequestCompleted function
        const emptoAddress: EmailSourceDestinationAddress = {
          email: refereeEmail,
          fullName: refereeName,
        };

        const empemailPlaceholders: EmailTemplatePlaceholderEMP_REFFERAL_DONE_FOR_CAND =
          {
            empName: refereeName.toTitleCase(),
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
    let referralResponse = await UserReferralResponseService.get(empEmail);
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
          throw new Error("The referral has already been rejected by you.");
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
    if (updateReferralResponse) {
      const { passedRefIds, rejectedRefIds, acceptedRefIds, doneRefIds } =
        referralResponse[0];
      await UserReferralResponseService.update(empEmail, {
        passedRefIds,
        rejectedRefIds,
        acceptedRefIds,
        doneRefIds,
      });
    } else {
      await UserReferralResponseService.create(
        empEmail,
        userReferralResponseDTO
      );
    }

    return result;
  }
}
// Export an instance of the UserReferralEmpService class
const userReferralEmpServiceObj = new UserReferralEmpService();
export {
  userReferralEmpServiceObj,
  UserReferralEmpService
};
