// Load the local daos
import userReferralDao from "../daos/UserReferral.dao";

// import Services
import UserService from "./User.service";
import UserReferralResponseService from "./UserReferralResponse.service";
import UserDetailService from "./UserDetail.service";

// Load the local dtos
import { UserReferralRequestDTO } from "../dtos/User.dto";
import {
  UserReferralDTO,
  UserReferralStatusChangeByCandDTO,
} from "../dtos/UserReferral.dto";

import {
  EmailTemplatePlaceholderCAND_REFERRAL_REQ_ACCEPTED,
  EmailTemplatePlaceholderCAND_REFERRAL_REQ_COMPLETED
} from "../dtos/EmailTemplatePlaceholder.dto";

// import models
import { DbUserReferralDto } from "../db/models/UserReferral.model";

// Import Libraries
import {
  EmailSourceDestinationAddress,
  emailLibrary,
} from "../libraries/email.library";
import { Query, QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import Enums
import { EmailTemplateEnum } from "../enums/EmailTemplate.enum";
import { ReferralStatus } from "../enums/UserReferral.enum";
import { ReferralActions } from "../enums/User.enum";

/**
 *  UserReferralService class responsible for managing user referral-related operations.
 */
class UserReferralService {
  /**
   * Processes a referral request made by a user(candidate).
   *
   * @param referralRequest - Referral request Referrals
   * @param email - Email of the user making the referral request
   */
  async create(
    referralRequest: UserReferralRequestDTO,
    email: string
  ) {
    console.log("Create referral [service]");

    // To decrease the referral count by 1 every time the candidate request for referral
    // UserService.decreaseReferralCount(email);

    //below block checks gets the ExtractedJd from db if it is there
    /* const jdExtract = await CompanyJobService.getJdUrl(
      referralRequest.jobUrl,
      referralRequest.companySK
    );
    if (jdExtract.count == 0) {
      //create new entery for company related jobUrl
      CompanyJobService.addCompanyRelatedJob(
        referralRequest.jobUrl,
        referralRequest.companySK
      );
    }

    console.log("cTesting: ", jdExtract); */
    return userReferralDao.create(referralRequest, email);
  }

  /**
   * Updates an existing user Referral.
   *
   * @param PK - PK of the user
   * @param SK - SK of the user
   * @param userReferralDTO - Data Transfer Object containing updated user Referral Referrals
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
    const candEmail: string = PK.split("#").pop() ?? ""; // for valid PK, there will be valid email id
    const candDetails = await UserDetailService.get(candEmail);
    const candName = candDetails[0].name;

    let result = await userReferralDao.update(PK, SK, userReferralDTO);

    if(result && status === ReferralActions.DONE)
    {
      // Prepare the necessary parameters required for the sendEmailToCandWhenReferralRequestCompleted function
      const toAddress: EmailSourceDestinationAddress = {
        email: candEmail,
        fullName: candName
      };
      const emailPlaceholders: EmailTemplatePlaceholderCAND_REFERRAL_REQ_COMPLETED = {
        candName: candName
      }

      // Function responsible for sending the email to the candidate saying that his referral request has been completed
      const sendEmailResponse = await this.sendEmailToCandWhenReferralRequestCompleted(emailPlaceholders,toAddress);
    }

    return result;
  }

  /**
   *
   *
   *
   * @param referralId Referral request Id
   * @param email Email of the user
   * @returns matchingScore
   */
  async getReferralScoreForCand(referralId: string, email: string) {
    console.log("Get referral matching score [service]");
    return userReferralDao.getReferralScoreForCand(email, referralId);
  }

  /**
   * Retrieves user Referral by email.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - A Promise that resolves to the Referral of the user
   */
  async get(email: string) {
    // Logging the action of getting user Referral by email in the service layer
    logger.info("Fetching user Referral by email [UserReferralService]");
    return userReferralDao.get(email);
  }

  /**
   *
   * Fetches Referral based on  companySK
   *
   * @param companyId - Company sort key
   * @returns {Promise<any>} - A Promise that resolves to the Referral of the user
   *
   */
  async getEmpReferralsByCompanyId(
    companyId: string
  ): Promise<QueryResponse<DbUserReferralDto>> {
    // Logging the action of getting user Referral by companyId in the service layer
    logger.info("Fetching Referrals by companyId  [UserReferralService]");
    return userReferralDao.getEmpReferralsByCompanyId(companyId);
  }

  /**
   *
   * Fetches Referral based on  GSI1SK
   *
   * @param GSI1SK - Company sort key
   * @returns {Promise<any>} - A Promise that resolves to the Referral of the user
   *
   */
  async getByGSI1(GSI1SK: string): Promise<any> {
    // Logging the action of getting user Referral by GSI1SK in the service layer
    logger.info("Fetching Referrals by GSI1SK  [UserReferralService]");
    return userReferralDao.getByGSI1(GSI1SK);
  }

  /**
   *
   * Fetches Referral based on GSI1PK, companySK, and status.
   *
   * @param companySK - Company sort key
   * @param status - Referral status
   * @returns {Promise<any>} - A Promise that resolves to the Referral of the user
   *
   */
  async getByGSI1PKAndStatus(
    companyId: string,
    status: string
  ): Promise<QueryResponse<DbUserReferralDto>> {
    // Logging the action of getting user Referral by GSI1PK & status in the service layer
    logger.info("Fetching Referral by GSI1PK and status [UserReferralService]");

    return userReferralDao.getByGSI1PKAndStatus(companyId, status);
  }

  /**
   *
   * Fetches Referral based on  attribute
   *
   * @param GSI1SK
   * @param attribute
   * @returns {Promise<any>} - A Promise that resolves to the Referral of the user
   *
   */
  async getOnlyAttribute(GSI1SK: string, attribute: string[]): Promise<any> {
    logger.info("Fetching Referrals by GSI1SK  [UserReferralService]");
    return userReferralDao.getOnlyAttribute(GSI1SK, attribute);
  }

  /**
   * Retrieves user Referral by status.
   *
   * @param email - Email of the user
   * @param status - referral status
   * @returns {Promise<any>} - A Promise that resolves to the Referral of the user
   */
  async getReferralsForCand(email: string, status: string):Promise<QueryResponse<DbUserReferralDto>> {
    // Logging the action of getting user Referral by status in the service layer
    logger.info("Fetching user Referral by status [UserReferralService]");
    return userReferralDao.getReferralsForCand(email, status);
  }

  /**
   * updates the status of user Referral
   *
   * @param referralId - Referral ID
   * @param email - Email of the user
   * @param status - status
   * @returns {Promise<any>} - A Promise that resolves to the Referral of the user
   */
  async updateStatus(
    referralId: string,
    candEmail: string,
    newStatus: string
  ): Promise<DbUserReferralDto> {
    // Logging the action of updating user Referral status in the service layer
    global.logger.info("Updating user Referral status [UserReferralService]");

    // Update status without withdrawal details
    const updatedReferralStatus = await userReferralDao.updateStatus(
      referralId,
      candEmail,
      newStatus
    );

    // If the details are updated and newStatus is "ACCEPTED", then email should be sent to the candidate saying that his referral request has been accepted
    if (updatedReferralStatus && newStatus === ReferralStatus.ACCEPTED) {
      await this.sendEmailOnReferralAccepted(candEmail);
    }
    return updatedReferralStatus;
  }

  async updateStatusForWithdrawnReferral(
    referralId: string,
    candEmail: string,
    withdrawnReferralPayload: UserReferralStatusChangeByCandDTO
  ): Promise<DbUserReferralDto> {
    // Logging the action of withdrawing a referral in the service layer
    global.logger.info("Withdrawing user Referral [UserReferralService]");

    // Set the actionDate for the withdrawal payload
    withdrawnReferralPayload.actionDate = new Date();

    // Update status with withdrawal details
    const updatedReferralStatus =
      userReferralDao.updateStatusForWithdrawnReferral(
        referralId,
        candEmail,
        withdrawnReferralPayload
      );

    return updatedReferralStatus;
  }

  async sendEmailOnReferralAccepted(candEmail: string) {
    // Get the Candidate Details from his candEmail
    const userDetails = await UserService.getUserByEmail(candEmail);
    const candName: string = userDetails[0].name;

    // Prepare the necessary parameters required for the sendEmailToCandWhenReferralRequestAccepted function
    const toAddress: EmailSourceDestinationAddress = {
      email: candEmail,
      fullName: candName,
    };
    const emailPlaceholders: EmailTemplatePlaceholderCAND_REFERRAL_REQ_ACCEPTED =
      { candName: candName };

    // Function responsible for sending the email to the candidate saying that his referral request has been accepted
    const sendEmailResponse =
      await this.sendEmailToCandWhenReferralRequestAccepted(
        emailPlaceholders,
        toAddress
      );
  }

  /**
   * updates the status of user Referral
   *
   * @param PK -
   * @param SK -
   * @param status - status
   * @returns {Promise<any>} - A Promise that resolves to the Referral of the user
   */
  async updateStatusByPKSK(
    PK: string,
    SK: string,
    status: string
  ): Promise<any> {
    // Logging the action of getting user Referral by email in the service layer
    global.logger.info(
      "Updating user Referral status by PK and SK [UserReferralService]"
    );
    return userReferralDao.updateStatusByPKSK(PK, SK, status);
  }

  /**
   * sendEmailToCandWhenReferralRequestAccepted
   *
   * Sends a candidate referral request acceptance email.
   *
   * @param {EmailTemplatePlaceholderCAND_REFERRAL_REQ_ACCEPTED} emailPlaceholders - Placeholders for the email template.
   * @param {EmailSourceDestinationAddress} toAddress - Object containing the name and email address of the recipient.
   * @returns { Promise<{ awsMessageId: string | null }> }
   */
  async sendEmailToCandWhenReferralRequestAccepted(
    emailPlaceholders: EmailTemplatePlaceholderCAND_REFERRAL_REQ_ACCEPTED,
    toAddress: EmailSourceDestinationAddress
  ): Promise<{ awsMessageId: string | null }> {
    // Send email using the email library with the specified template, recipient, and placeholders
    return emailLibrary.sendEmail(
      EmailTemplateEnum.CAND_REFERRAL_REQ_ACCEPTED,
      toAddress,
      emailPlaceholders,
    );
  }

  /** 
   * sendEmailToCandWhenReferralRequestCompleted
   * 
   * Sends a candidate referral request completed email.
   * 
   * @param {EmailTemplatePlaceholderCAND_REFERRAL_REQ_COMPLETED} emailPlaceholders - Placeholders for the email template.
   * @param {EmailSourceDestinationAddress} toAddress - Object containing the name and email address of the recipient.
   * @returns { Promise<{ awsMessageId: string | null }> }
   */
  async sendEmailToCandWhenReferralRequestCompleted(
    emailPlaceholders: EmailTemplatePlaceholderCAND_REFERRAL_REQ_COMPLETED,
    toAddress: EmailSourceDestinationAddress
  ): Promise<{ awsMessageId: string | null }> {
    // Send email using the email library with the specified template, recipient, and placeholders
    return emailLibrary.sendEmail(
        EmailTemplateEnum.CAND_REFERRAL_REQ_COMPLETED,
        toAddress,
        emailPlaceholders,
    );
  }

  /**
   * getReferralsByIdsUsingGsis
   * 
   * Fetches referrals based on array of referral IDs.
   *
   * @param {string[]} referralIds - Array of referral IDs
   * @return { Promise<QueryResponse<DbUserReferralDto>[]> } - A Promise that resolves to the Referrals
   */
  async getReferralsByIdsUsingGsis(referralIds: string[]): Promise<QueryResponse<DbUserReferralDto>[]> {
    return userReferralDao.getReferralsByIdsUsingGsis(referralIds);
  }

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
  ) {
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
      const empPassedRefIds = Array.from(new Set(userReferralResponse[0]?.passedRefIds || []));
      const empRejectedRefIds = Array.from(new Set(userReferralResponse[0]?.rejectedRefIds || []));
      const referralIdsToBeExcluded = [...empPassedRefIds, ...empRejectedRefIds];
  
      // Get company referrals where status is awaiting
      const companyReferrals = await this.getByGSI1PKAndStatus(
        companyId,
        referralStatus
      );

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
  ): Promise<QueryResponse<DbUserReferralDto>[]> {
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
    return this.getReferralsByIdsUsingGsis(refIds);
  }
}

// Export an instance of the UserService class
export default new UserReferralService();
