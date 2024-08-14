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

// Import Enums
import { EmailTemplateEnum } from "../enums/EmailTemplate.enum";
import { ReferralActions } from "../enums/User.enum";
import { ReferralStatus } from "../enums/UserReferral.enum";

// Import Libraries
import { EmailSourceDestinationAddress, emailLibrary } from "../libraries/email.library";

// Import Utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

// Import Services
import UserDetailService from "./UserDetail.service";
import UserExperienceService from "./UserExperience.service";
import UserReferralService from "./UserReferral.service";
import UserReferralResponseService from "./UserReferralResponse.service";
import CompanyService from "./Company.service";

// Import DateTime Library
import { DateTime } from "luxon";

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
      return this.getEmployeeAwaitingReferrals(empPrimaryEmail, companyId, referralStatus);
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
      const userReferralResponse = await UserReferralResponseService.get(empPrimaryEmail);
      const empPassedRefIds = Array.from(new Set(userReferralResponse[0]?.passedRefIds || []));
      const empRejectedRefIds = Array.from(new Set(userReferralResponse[0]?.rejectedRefIds || []));
      const referralIdsToBeExcluded = [...empPassedRefIds, ...empRejectedRefIds];

      // Get company referrals where status is awaiting
      const companyReferrals = await userReferralDao.getByGSI1PKAndStatus(companyId, referralStatus);

      // NOTE : This block filters the referrals on which the emp has not taken any action
      // @todo : Investigated and see if this can be handle by dynamouse itself
      const awaitingCompanyReferrals = [];
      for (const referral of companyReferrals) {
        if (!referralIdsToBeExcluded.includes(referral.id)) {
          awaitingCompanyReferrals.push(referral);
        }
      }
      global.logger.info("Filtered Company Referrals:", awaitingCompanyReferrals);

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
  async getEmployeeReferralsByStatus(empPrimaryEmail: string, referralStatus: string): Promise<DbUserReferralDto[]> {
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
    const userReferralResponse = await UserReferralResponseService.getByEmailWithSpecifiedAttributes(
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
    return result.filter((referral) => referral !== null) as DbUserReferralDto[];
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
      const employeesResponse = await UserExperienceService.getCompanyCurrentEmployeesByCompanyId(companyId, {
        pageSize,
        lastKey: lastKey,
      });

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
      const emailPlaceholders: EmailTemplatePlaceholderEMP_RECEIVED_REFERRAL_REQ_NOTIFICATION = {
        emp_first_name: refereeName,
        candidate_name: candidateName,
      };

      // Send the email using the email library
      return emailLibrary.sendEmail(
        EmailTemplateEnum.EMP_RECEIVED_REFERRAL_REQ_NOTIFICATION,
        toAddress,
        emailPlaceholders
      );
    });

    // Merge the current batch of promises with the accumulated ones
    global.logger.info(`Processed ${emailPromisesBatch.length} email sending tasks so far for companyId: ${companyId}`);

    // Wait for all email sending promises to complete
    await Promise.all(emailPromisesBatch);

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
    return emailLibrary.sendEmail(EmailTemplateEnum.EMP_REFFERAL_DONE_FOR_CAND, toAddress, emailPlaceholders);
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
  async update(PK: string, SK: string, userReferralDTO: UserReferralDTO, status: string): Promise<any> {
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
    const companyDetails = await CompanyService.getCompanyDetailsByIds([companyId]);

    if (!companyDetails || companyDetails.length === 0) {
      throw new Error("Company not found");
    }
    const companyName = companyDetails[0].name;

    // Update the referral
    let result = await userReferralDao.update(PK, SK, userReferralDTO);

    if (result) {
      // Update the referral counts if the status is 'ACCEPT' or 'DONE'
      if (status === ReferralActions.ACCEPT || status === ReferralActions.DONE) {
        const userSubscriptionId = userReferralDTO.userSubscriptionId;
        await UserReferralService.calculateAndUpdateReferralCounts(candEmail, userSubscriptionId, status);
      }

      // Handle the different actions (accept, done) and send emails accordingly
      if (status === ReferralActions.ACCEPT) {
        // Get the name and email of the referee who accepted the referral request
        const empId = userReferralDTO.acceptedByUserId as string;
        const empDetails = await UserDetailService.getUserById(empId);
        const refereeName = empDetails[0].name;
        const refereeEmail = empDetails[0].emailList.primary;

        // Prepare the necessary parameters required for the sendEmailToCandWhenReferralRequestAccepted function
        const toAddress: EmailSourceDestinationAddress = {
          email: candEmail,
          fullName: candName,
        };
        const emailPlaceholders: EmailTemplatePlaceholderCAND_REFERRAL_REQ_ACCEPTED = {
          candName: candName,
          companyName: companyName,
          refereeName: refereeName,
        };

        // Prepare the necessary parameters required for the sendEmailToEmpWhenReferralRequestAccepted function
        const emptoAddress: EmailSourceDestinationAddress = {
          email: refereeEmail,
          fullName: refereeName,
        };

        const empemailPlaceholders: EmailTemplatePlaceholderEMP_ACCEPTED_REFERRAL_REQ_NOTIFCATION = {
          empName: refereeName,
          candName: candName,
        };

        // Send emails to the candidate and the employee
        await Promise.all([
          UserReferralService.sendEmailToCandWhenReferralRequestAccepted(emailPlaceholders, toAddress),
          this.sendEmailToEmpWhenReferralRequestAccepted(empemailPlaceholders, emptoAddress),
        ]);
      }
      // When employee marks the referral request as done, email will be sent to candidate
      else if (status === ReferralActions.DONE) {
        // Get the name and email of the referee who completed the referral request
        const empId = userReferralDTO.doneByUserId as string;
        const empDetails = await UserDetailService.getUserById(empId);
        const refereeName = empDetails[0].name;
        const refereeEmail = empDetails[0].emailList.primary;

        // Prepare the necessary parameters required for the sendEmailToCandWhenReferralRequestCompleted function
        const toAddress: EmailSourceDestinationAddress = {
          email: candEmail,
          fullName: candName,
        };
        const emailPlaceholders: EmailTemplatePlaceholderCAND_REFERRAL_REQ_COMPLETED = {
          candName: candName,
          companyName: companyName,
        };

        // Prepare the necessary parameters required for the sendEmailToEmpWhenReferralRequestCompleted function
        const emptoAddress: EmailSourceDestinationAddress = {
          email: refereeEmail,
          fullName: refereeName,
        };

        const empemailPlaceholders: EmailTemplatePlaceholderEMP_REFFERAL_DONE_FOR_CAND = {
          empName: refereeName,
        };

        // Send emails to the candidate and the employee
        await Promise.all([
          UserReferralService.sendEmailToCandWhenReferralRequestCompleted(emailPlaceholders, toAddress),
          this.sendEmailToEmpWhenReferralRequestCompleted(empemailPlaceholders, emptoAddress),
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
    global.logger.info("Updating Referral Status By Employee [UserReferralEMP service]");
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
          referral[0].passedByUserIds.some((passedUser: { userId: string }) => passedUser.userId === userId)
        ) {
          throw new Error("The referral has already been passed by you.");
        }
        // Add the employee's pass action to the referral
        if (!referral[0].passedByUserIds || referral[0].passedByUserIds.length === 0) {
          referral[0].passedByUserIds = [{ userId, actionDate: currentDate.toISO() }];
        } else {
          referral[0].passedByUserIds.push({ userId, actionDate: currentDate.toISO() });
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
          referral[0].rejectedByUserIds.some((rejectedUserId: { userId: string }) => rejectedUserId.userId === userId)
        ) {
          throw new Error("The referral has already been rejected by you.");
        }
        // Add the employee's rejection to the referral
        if (!referral[0].rejectedByUserIds || referral[0].rejectedByUserIds.length === 0) {
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
    const result = await this.update(PK, SK, userReferralDTO, referralStatusUpdate.action);

    // Update or create the referral response
    if (updateReferralResponse) {
      const { passedRefIds, rejectedRefIds, acceptedRefIds, doneRefIds } = referralResponse[0];
      await UserReferralResponseService.update(empEmail, {
        passedRefIds,
        rejectedRefIds,
        acceptedRefIds,
        doneRefIds,
      });
    } else {
      await UserReferralResponseService.create(empEmail, userReferralResponseDTO);
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
