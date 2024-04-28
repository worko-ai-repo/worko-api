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

// Import services
import CompanyService from "./Company.service";
import { UserReferralResponseDTO } from '../dtos/UserReferralResponse.dto';

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
    const candName = candDetails.length > 0 ? candDetails[0].name ?? "" : "";
    logger.debug(`Candidate Name: ${candName}`);
    
    // Get the name of the company for which the referral request got accepted
    const companyId = userReferralDTO.companyId;
    const companyDetails = await CompanyService.getCompanyDetailsByIds([companyId]);
    const companyName = companyDetails.length > 0 ? companyDetails[0].name ?? "" : "";
    logger.debug(`Company Name: ${companyName}`);
    
    // Update the referral details
    let result = await userReferralDao.update(PK, SK, userReferralDTO);
    if(result)
    {
      // When employee accepts the referral request, email will be sent to candidate
      if(status === ReferralActions.ACCEPT) 
      {
        // Get the name of the referee who accepted the referral request
        const employeeId = userReferralDTO.acceptedByUserId as string;
        const empDetails = await UserDetailService.getUserById(employeeId)
        const refereeName = empDetails[0].name;

        // Prepare the necessary parameters required for the sendEmailToCandWhenReferralRequestAccepted function
        const toAddress: EmailSourceDestinationAddress = {
          email: candEmail,
          fullName: candName
        };
        const emailPlaceholders: EmailTemplatePlaceholderCAND_REFERRAL_REQ_ACCEPTED = {
          candName: candName,
          companyName: companyName,
          refereeName: refereeName
        }
  
        // Function responsible for sending the email to the candidate saying that his referral request has been accepted
        await this.sendEmailToCandWhenReferralRequestAccepted(emailPlaceholders,toAddress);
      }
      // When employee marks the referral request as done, email will be sent to candidate
      else if(status === ReferralActions.DONE) {
        // Prepare the necessary parameters required for the sendEmailToCandWhenReferralRequestCompleted function
        const toAddress: EmailSourceDestinationAddress = {
          email: candEmail,
          fullName: candName
        };
        const emailPlaceholders: EmailTemplatePlaceholderCAND_REFERRAL_REQ_COMPLETED = {
          candName: candName,
          companyName: companyName
        }
  
        // Function responsible for sending the email to the candidate saying that his referral request has been completed
        await this.sendEmailToCandWhenReferralRequestCompleted(emailPlaceholders,toAddress);
      }
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
  async getReferralsForCand(email: string, status?: string):Promise<QueryResponse<DbUserReferralDto>> {
    // Logging the action of getting user Referral by status in the service layer
    logger.info("Fetching user Referral by status [UserReferralService]");
    return userReferralDao.getReferralsForCand(email, status);
  }

  /**
   * Retrieves user referral by ID.
   *
   * @param {string} referralId - The ID of the referral
   * @return {Promise<QueryResponse<DbUserReferralDto>>} - A Promise that resolves to the user referral
   */
  async getReferralById(referralId :string):Promise<QueryResponse<DbUserReferralDto>>{
    return userReferralDao.getByGSI1(referralId);
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
    
    // if the new status is DONE, update the user response
    if (newStatus === ReferralStatus.DONE) {
      // Get the referral details
      let referral = await this.getReferralById(referralId);

      // Retrive the employee details
      let empUserId = referral[0].acceptedByUserId as string;
      const empDetail = await UserDetailService.getUserById(empUserId);

      // Check if Emp Details are found
      if (empDetail.count) {
        //Retrive the emp Email and Referral Responses
        let empEmail = empDetail[0].emailList.primary;
        const userReferralResponse = await UserReferralResponseService.get(empEmail);

        // If the userReferralResponse is found, update the user response
        if (userReferralResponse.count) {
          // Remove the referralId from 'acceptedRefIds' from the userReferralResponse and add the referralId in 'doneRefIds' if found 
          userReferralResponse[0].acceptedRefIds = userReferralResponse[0].acceptedRefIds.filter((id: string) => id !== referralId);
          userReferralResponse[0].doneRefIds = userReferralResponse[0].doneRefIds.concat(referralId);

          // Update the UserReferralResponse 
          await UserReferralResponseService.update(empEmail, {
            passedRefIds: userReferralResponse[0].passedRefIds,
            rejectedRefIds: userReferralResponse[0].rejectedRefIds,
            acceptedRefIds: userReferralResponse[0].acceptedRefIds,
            doneRefIds: userReferralResponse[0].doneRefIds,
          });
        } else {
          // If the userReferralResponse is not found, create a new userReferralResponse and update the user response
          let userReferralNewResponse = {
            passedRefIds: [],
            rejectedRefIds: [],
            acceptedRefIds: [], 
            doneRefIds: [referralId]
          };  
          await UserReferralResponseService.update(empEmail, userReferralNewResponse);
        }
      }
    }
    // Update status without withdrawal details
    return userReferralDao.updateStatus(
      referralId,
      candEmail,
      newStatus
    );
    // @todo Ashrith, this function is used for candidate specifically, and candidate will never accept the referral, therefor code to send email is not required here.
    // Kindly remove if this is true.
    // If the details are updated and newStatus is "ACCEPTED", then email should be sent to the candidate saying that his referral request has been accepted
    /* if (updatedReferralStatus && newStatus === ReferralStatus.ACCEPTED) {
      // Get the name of the referee who accepted the referral request
      const employeeId = updatedReferralStatus.acceptedByUserId as string;
      const empDetails = await UserDetailService.getUserById(employeeId)
      const refereeName = empDetails[0].name;
  
      // Get the name of the company for which the referral request got accepted
      const companyId = updatedReferralStatus.companyId;
      const companyDetails = await CompanyService.getCompanyDetailsByIds([companyId]);
      const companyName = companyDetails[0].name;

      await this.sendEmailOnReferralAccepted(candEmail,refereeName,companyName);
    } */
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

  async sendEmailOnReferralAccepted(candEmail: string, refereeName: string, companyName: string) {
    // Get the Candidate Details from his candEmail
    const userDetails = await UserService.getUserByEmail(candEmail);
    const candName: string = userDetails[0].name;

    // Prepare the necessary parameters required for the sendEmailToCandWhenReferralRequestAccepted function
    const toAddress: EmailSourceDestinationAddress = {
      email: candEmail,
      fullName: candName,
    };
    const emailPlaceholders: EmailTemplatePlaceholderCAND_REFERRAL_REQ_ACCEPTED = { 
      candName: candName, 
      companyName: companyName, 
      refereeName: refereeName 
    };

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
  async getReferralsByIdsUsingGsis(referralIds: string[]): Promise<(DbUserReferralDto | null)[]> {
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
  ): Promise<DbUserReferralDto[]>{
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
  ):Promise<DbUserReferralDto[]>{
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
   let result = await this.getReferralsByIdsUsingGsis(refIds);
   return result.filter(referral => referral !== null) as DbUserReferralDto[];
  }
}

// Export an instance of the UserService class
export default new UserReferralService();
