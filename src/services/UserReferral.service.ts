// import luxon
import { DateTime } from 'luxon';

// Load the local daos
import userReferralDao from "../daos/UserReferral.dao";
import userDetailDao from '../daos/UserDetail.dao';

// import Services
import UserService from "./User.service";
import UserReferralResponseService from "./UserReferralResponse.service";
import UserDetailService from "./UserDetail.service";

// Load the local dtos
import { UserReferralRequestCreateDTO } from "../dtos/User.dto";
import {
  UserReferralDTO,
  UserReferralStatusChangeByCandDTO,
} from "../dtos/UserReferral.dto";
import {
  EmailTemplatePlaceholderCAND_REFERRAL_REQ_ACCEPTED,
  EmailTemplatePlaceholderCAND_REFERRAL_REQ_COMPLETED,
  EmailTemplatePlaceholderEMP_ACCEPTED_REFERRAL_REQ_NOTIFCATION,
  EmailTemplatePlaceholderEMP_RECEIVED_REFERRAL_REQ_NOTIFICATION,
  EmailTemplatePlaceholderEMP_REFFERAL_DONE_FOR_CAND
} from "../dtos/EmailTemplatePlaceholder.dto";

// import models
import { DbUserReferralDto } from "../db/models/UserReferral.model";
import { DbUserSubsDto } from "../db/models/UserSubscription.model";

// Import Libraries
import {
  EmailSourceDestinationAddress,
  emailLibrary,
} from "../libraries/email.library";
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import Enums
import { EmailTemplateEnum } from "../enums/EmailTemplate.enum";
import { ReferralStatus } from "../enums/UserReferral.enum";
import { ReferralActions } from "../enums/User.enum";
import { UserSubscriptionStatus } from "../enums/UserSubscription.enum";

// Import constants
import APP_CONSTANTS from '../configs/constants.config';

// Import dtos
import { ScheduleJobCreateDto, ScheduleJobRefReviewAcceptanceStatusInputDto } from '../dtos/ScheduleJob.dto';

// Import enums
import { ScheduleJobStatus, ScheduleJobType } from '../enums/ScheduleJob.enum';


// Import services
import CompanyService from "./Company.service";
import UserSubscriptionService from "./UserSubscription.service";
import UserExperienceService from './UserExperience.service';
import ScheduleJobService from './ScheduleJob.service';

// Import utlis
import { BaseError } from '../utils/errors.util';
import HttpStatusCode from '../utils/http-codes.util';
import { DbUserExperienceDto } from '../db/models/UserExperience.model';

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
  async create(referralRequest: UserReferralRequestCreateDTO, email: string) {
    global.logger.info("Create referral [service]");

    // here if job url is found then decode it 
    global.logger.info(`Decoding Job Url [${referralRequest.jobUrl}]`);

    // Decode Job Url if it is encoded
    let decodedJobUrl = decodeURIComponent(referralRequest.jobUrl).trim();

    // retive the job url from referral if already exits
    let existingJoburlCheck = await this.getUserReferralsByJobUrl(email, decodedJobUrl);

    // If job url already exists, throw an error
    if (existingJoburlCheck.count) {
      throw new BaseError("You have already requested for referral for this job. Check your dashboard for reference",
        HttpStatusCode.BAD_REQUEST_400
      );
    }

    // Create a new referral request data
    let referralRequestData: UserReferralRequestCreateDTO = {
      userSubscriptionId: referralRequest.userSubscriptionId,
      companyId: referralRequest.companyId,
      jobUrl: decodedJobUrl,
      jdExtracted: referralRequest.jdExtracted,
    }
    
    // Create the referral request
    const createdReferral = await userReferralDao.create(
      referralRequestData,
      email
    );

    // Update the referral counts
    const updatedSubscription = await this.calculateAndUpdateReferralCounts(
      email,
      referralRequest.userSubscriptionId,
      ReferralStatus.AWAITING
    );
   
    return createdReferral;

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
  }

  /**
   *
   * calculateAndUpdateReferralCounts
   *
   * Calculates and updates the referral counts based on the new referral status.
   *
   * @param {string} userEmail - The email of the user.
   * @param {string} userSubscriptionId - The ID of the user's subscription.
   * @param {string} newReferralStatus - The new referral status.
   * @return {Promise<DbUserSubsDto>} A promise that resolves to the updated subscription.
   * @throws {Error} If the user subscription is not found.
   * @throws {Error} If the referral status is invalid.
   */
  async calculateAndUpdateReferralCounts(
    userEmail: string,
    userSubscriptionId: string,
    newReferralStatus: string
  ): Promise<DbUserSubsDto> {
    // Get user's subscription details
    const userSubscription = await UserSubscriptionService.getById(
      userEmail,
      userSubscriptionId
    );
    if (!userSubscription || userSubscription.count === 0) {
      throw new Error("User subscription not found");
    }

    // Retrieve UserDetails from userEmail
    let userDetails = await UserDetailService.get(userEmail);
    if (!userDetails || userDetails.count === 0) {
      throw new Error("User Details not found");
    }

    // Get SK (Sort Key) for the user
    const userSortKey = await UserService.getSK(userEmail);

    // Get user's subscription status details
    const userSubscriptionStatusList =
      await userDetailDao.getUserSubscriptionStatus(userEmail, userSortKey);

    // Get user's current subscription details
    let currentSubscription = userSubscription[0];
    let userSubscriptionStatus = userSubscriptionStatusList[0];

    // Update the referral counts based on the new referral status
    // @todo : When Subscription is Used or expired and user buys a new active subscription
    //  the user/expired referral count if credited then it must go to the new  Subscription as discussed
    switch (newReferralStatus) {
      case ReferralStatus.AWAITING:
        currentSubscription.requestedReferrals += 1;
        currentSubscription.availableReferrals -= 1;
        userSubscriptionStatus.referralCount -= 1;
        break;
      case ReferralStatus.ACCEPTED:
      case ReferralActions.ACCEPT:
        currentSubscription.requestedReferrals -= 1;
        currentSubscription.acceptedReferrals += 1;
        break;
      case ReferralStatus.DONE:
      case ReferralActions.DONE:
        currentSubscription.acceptedReferrals -= 1;
        currentSubscription.completedReferrals += 1;
        break;
      case ReferralStatus.CANCELLED:
      case ReferralStatus.REJECTED:
      case ReferralStatus.WITHDRAWN:
        if (currentSubscription.requestedReferrals > 0) {
          currentSubscription.requestedReferrals -= 1;
          currentSubscription.availableReferrals += 1;
          userSubscriptionStatus.referralCount += 1;
        }
        break;
      default:
        throw new Error("Invalid referral status while updating Counts");
    }

    // Update subscription status based on availableReferrals
    if (currentSubscription.availableReferrals === 0) {
      await UserSubscriptionService.update(userEmail, userSubscriptionId, {
        status: UserSubscriptionStatus.USED,
      });
    } else if (
      currentSubscription.availableReferrals > 0 &&
      currentSubscription.status !== UserSubscriptionStatus.EXPIRED
    ) {
      await UserSubscriptionService.update(userEmail, userSubscriptionId, {
        status: UserSubscriptionStatus.ACTIVE,
      });
    }

    // Update the user's subscription details
    const updatedSubscription = await UserSubscriptionService.update(
      userEmail,
      userSubscriptionId,
      {
        requestedReferrals: currentSubscription.requestedReferrals,
        availableReferrals: currentSubscription.availableReferrals,
        acceptedReferrals: currentSubscription.acceptedReferrals,
        completedReferrals: currentSubscription.completedReferrals,
      }
    );

    // Update user service referral count and subscription status
    await UserService.updateReferralCount(userDetails[0].id, userEmail, {
      referralCount: userSubscriptionStatus.referralCount,
      isSubscribed: userSubscriptionStatus.referralCount > 0,
    });

    return updatedSubscription;
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
    const companyDetails = await CompanyService.getCompanyDetailsByIds([
      companyId,
    ]);

    if (!companyDetails || companyDetails.length === 0) {
      throw new Error("Company not found");
    }
    const companyName = companyDetails[0].name;

    let result = await userReferralDao.update(PK, SK, userReferralDTO);

    if (result) {
      if (
        status === ReferralActions.ACCEPT ||
        status === ReferralActions.DONE
      ) {
        // Update the referral counts
        const userSubscriptionId = userReferralDTO.userSubscriptionId;
        await this.calculateAndUpdateReferralCounts(
          candEmail,
          userSubscriptionId,
          status
        );
      }

      // The actions are done by the employee
      // When employee accepts the referral request, email will be sent to candidate
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
        const emailPlaceholders: EmailTemplatePlaceholderCAND_REFERRAL_REQ_ACCEPTED =
          {
            candName: candName,
            companyName: companyName,
            refereeName: refereeName,
          };

        // Prepare the necessary parameters required for the sendEmailToEmpWhenReferralRequestAccepted function
        const emptoAddress: EmailSourceDestinationAddress = {
          email: refereeEmail,
          fullName: refereeName,
        };

        const empemailPlaceholders: EmailTemplatePlaceholderEMP_ACCEPTED_REFERRAL_REQ_NOTIFCATION =
          {
            empName: refereeName,
            candName: candName,
          };

        await Promise.all([
          this.sendEmailToCandWhenReferralRequestAccepted(
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
        // const employeeId = empId.split("ID#")[1];
        const empDetails = await UserDetailService.getUserById(empId);
        const refereeName = empDetails[0].name;
        const refereeEmail = empDetails[0].emailList.primary;

        // Prepare the necessary parameters required for the sendEmailToCandWhenReferralRequestCompleted function
        const toAddress: EmailSourceDestinationAddress = {
          email: candEmail,
          fullName: candName,
        };
        const emailPlaceholders: EmailTemplatePlaceholderCAND_REFERRAL_REQ_COMPLETED =
          {
            candName: candName,
            companyName: companyName,
          };

        // Prepare the necessary parameters required for the sendEmailToEmpWhenReferralRequestCompleted function
        const emptoAddress: EmailSourceDestinationAddress = {
          email: refereeEmail,
          fullName: refereeName,
        };

        const empemailPlaceholders: EmailTemplatePlaceholderEMP_REFFERAL_DONE_FOR_CAND =
          {
            empName: refereeName,
          };

        await Promise.all([
          this.sendEmailToCandWhenReferralRequestCompleted(
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
   *
   * Fetches Referral based on  companySK
   *
   * @param userEmail - Company sort key
   * @param referralId - Company sort key
   * @returns {Promise<DbUserReferralDto>} - A Promise that resolves to the Referral of the user
   *
   */
  async getUserReferralByReferralId(
    userEmail: string,
    referralId: string
  ): Promise<DbUserReferralDto> {
    // Logging the action of getting user Referral by companyId in the service layer
    logger.info(`Fetching Referrals by referralId :${referralId} and userEmail:${userEmail}  [UserReferralService]`);
    return userReferralDao.getUserReferralByReferralId(userEmail, referralId);
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
  async getReferralsForCand(
    email: string,
    status?: string
  ): Promise<QueryResponse<DbUserReferralDto>> {
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
  async getReferralById(
    referralId: string
  ): Promise<QueryResponse<DbUserReferralDto>> {
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
        const userReferralResponse = await UserReferralResponseService.get(
          empEmail
        );

        // If the userReferralResponse is found, update the user response
        if (userReferralResponse.count) {
          // Remove the referralId from 'acceptedRefIds' from the userReferralResponse and add the referralId in 'doneRefIds' if found
          userReferralResponse[0].acceptedRefIds =
            userReferralResponse[0].acceptedRefIds.filter(
              (id: string) => id !== referralId
            );
          userReferralResponse[0].doneRefIds =
            userReferralResponse[0].doneRefIds.concat(referralId);

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
            doneRefIds: [referralId],
          };
          await UserReferralResponseService.update(
            empEmail,
            userReferralNewResponse
          );
        }
      }
    }

    // Update status without withdrawal details
    const updatedReferralStatus = await userReferralDao.updateStatus(
      referralId,
      candEmail,
      newStatus
    );

    // Calculate and update referral counts when referral status has been updated
    if (updatedReferralStatus) {
      const userSubscriptionId = updatedReferralStatus.userSubscriptionId;
      await this.calculateAndUpdateReferralCounts(
        candEmail,
        userSubscriptionId,
        newStatus
      );
    }

    return updatedReferralStatus;
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

    // Set the actionDate for the withdrawal payload using Luxon
    withdrawnReferralPayload.actionDate = DateTime.now().toJSDate();

    // Update status with withdrawal details
    const updatedReferralStatus =
      await userReferralDao.updateStatusForWithdrawnReferral(
        referralId,
        candEmail,
        withdrawnReferralPayload
      );

    // Update the referral counts
    if (updatedReferralStatus) {
      const userSubscriptionId = updatedReferralStatus.userSubscriptionId;
      await this.calculateAndUpdateReferralCounts(
        candEmail,
        userSubscriptionId,
        ReferralStatus.WITHDRAWN
      );
    }
    return updatedReferralStatus;
  }

  async sendEmailOnReferralAccepted(
    candEmail: string,
    refereeName: string,
    companyName: string
  ) {
    // Get the Candidate Details from his candEmail
    const userDetails = await UserService.getUserByEmail(candEmail);
    const candName: string = userDetails[0].name;

    // Prepare the necessary parameters required for the sendEmailToCandWhenReferralRequestAccepted function
    const toAddress: EmailSourceDestinationAddress = {
      email: candEmail,
      fullName: candName,
    };
    const emailPlaceholders: EmailTemplatePlaceholderCAND_REFERRAL_REQ_ACCEPTED =
      {
        candName: candName,
        companyName: companyName,
        refereeName: refereeName,
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
      emailPlaceholders
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
      emailPlaceholders
    );
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
      global.logger.info(`The employee details for the given email "${empEmail}" not found. Therefore, the email notification cannot be sent for the referral "${referralId}".`, {
        companyId: companyId,
      });
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
   * getReferralsByIdsUsingGsis
   *
   * Fetches referrals based on array of referral IDs.
   *
   * @param {string[]} referralIds - Array of referral IDs
   * @return { Promise<QueryResponse<DbUserReferralDto>[]> } - A Promise that resolves to the Referrals
   */
  async getReferralsByIdsUsingGsis(
    referralIds: string[]
  ): Promise<(DbUserReferralDto | null)[]> {
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
    let result = await this.getReferralsByIdsUsingGsis(refIds);
    return result.filter(
      (referral) => referral !== null
    ) as DbUserReferralDto[];
  }

  /**
   * Validates the referral matching score and updates the referral status if necessary.
   * If the score is above the minimum threshold, it creates a delayed message to check the status after 5 days.
   *
   * @param {string} referralId - The ID of the referral
   * @param {string} userEmail - The email of the user
   * @param {string} userId - The ID of the user
   * @returns {Promise<boolean>} True if validation was successful, false otherwise
   */
  async validateReferralMatchingScore(
    referralId: string,
    userEmail: string,
    userId: string
  ): Promise<boolean> {
    // Log the attempt to validate referral matching score
    logger.info(
      `Attempting to validate referral matching score for referral ID: ${referralId}, user email: ${userEmail} [UserReferralService]`
    );

    // Fetch user referral details using referral ID and user email
    let userReferralDetails = await this.getUserReferralByReferralId(
      userEmail,
      referralId
    );

    // If referral details are not found, throw an error
    if (!userReferralDetails) {
      throw new BaseError(
        `The referral details not found for the provided referral ID "${referralId}" and email "${userEmail}".`
      );
    }

    // Retrieve the matching score from user referral details
    const { matchingScore } = userReferralDetails;

    // Update referral status to CANCELLED if matching score is below minimum threshold
    if (matchingScore < APP_CONSTANTS.REFERRAL_MINIMUM_MATCHING_SCORE) {
      await this.updateStatus(referralId, userEmail, ReferralStatus.CANCELLED);
      logger.info(`Referral ${referralId} cancelled due to low matching score`);
    } else {
      // Create a delayed message to check referral status after 5 days
      let delayedStatusCheck = await this.scheduleDelayedReferralAcceptanceReview(
        referralId,
        userEmail,
        userId
      );

      // If delayed check creation failed, throw an error
      if (!delayedStatusCheck) {
        throw new BaseError(
          `Failed to schedule scheduler to review the referral acceptance status for referral ID "${referralId}".`
        );
      }
      logger.info(`Created delayed status check for referral ${referralId}`);

      // ===========================================================================
      // ===== SEND EMAIL TO EMPLOYEES ON SUCCESSFUL REFERRAL CREATION/REQUEST =====
      // ===========================================================================

      // Fetch candidate details using user ID
      const candidateDetails = await UserDetailService.getUserById(userId);

      // Check if candidate details are found
      if (!candidateDetails.count) {
        throw new BaseError(
          `Candidate details not found with userId ${userId}. Please check the information and try again.`,
          HttpStatusCode.NOT_FOUND_404
        );
      }

      // Extract candidate name from the fetched details
      const candidateName = candidateDetails[0].name;

      // Send email notification to employees about the referral creation
      await this.sendEmailToEmployeesOnReferralCreation(
        userReferralDetails.companyId,
        referralId,
        candidateName
      );
    }
    return true;
  }
  
  /**
   * scheduleDelayedReferralAcceptanceReview
   * 
   * Creates a delayed message to check the referral acceptance status after a specified number of days.
   *
   * @param {string} referralId - The ID of the referral
   * @param {string} userEmail - The email of the user
   * @param {string} userId - The ID of the user
   * @returns {Promise<boolean>} A promise that resolves to true if the message was sent successfully, false otherwise
   */
  async scheduleDelayedReferralAcceptanceReview(
    referralId: string,
    userEmail: string,
    userId: string
  ): Promise<boolean> {
    // Log the attempt to create a delayed referral status check
    logger.info(
      `Attempting to create delayed referral status check for referral ID: ${referralId}, user email: ${userEmail} [UserReferralService]`
    );

    // Calculate the schedule time based on the delay hours constant
    const delayHours = APP_CONSTANTS.REFERRAL_REVIEW_ACCEPTANCE_STATUS_AFTER_X_HOURS;
    const scheduleTime = DateTime.now().plus({ hours: delayHours }).toUTC().toFormat("yyyy-MM-dd'T'HH:mm:ss");
    let schedulerInput : ScheduleJobRefReviewAcceptanceStatusInputDto = {
      referralId,
      userEmail,
      userId
    }
    // Prepare the payload for the scheduled job
    const scheduleJobPayload: ScheduleJobCreateDto = {
      type: ScheduleJobType.REFERRAL_REVIEW_ACCEPTANCE_STATUS,
      scheduleTime: scheduleTime,
      input: schedulerInput,
      desc: `Review referral acceptance status for referral ID "${referralId}"`,
      status: ScheduleJobStatus.SCHEDULED,
    };

    // Create the scheduled job
    let scheduleJobCreated = await ScheduleJobService.createScheduleJob(scheduleJobPayload);

    // Log the result of the scheduled job creation
    if (scheduleJobCreated) {
      logger.info(`Scheduled job created for referral ${referralId}`, {
        filePath: __filename,
        methodName: "scheduleDelayedReferralAcceptanceReview",
      });
      return true;
    } else {
      logger.error(`Failed to create scheduled job for referral ${referralId}`);
      return false;
    }
  }

  /**
   * reviewReferralAcceptanceStatus
   * 
   * Reviews the referral acceptance status after 5 days and rejects it if still in "awaiting" status.
   *
   * @param {string} referralId - The ID of the referral
   * @param {string} userEmail - The email of the user
   * @returns {Promise<boolean>} A promise that resolves to true if the review was successful, false otherwise
   */
  async reviewReferralAcceptanceStatus(
    referralId: string,
    userEmail: string
  ): Promise<boolean> {
    // Log the attempt to review referral acceptance status
    logger.info(
      `Attempting to review referral acceptance status for referral ID: ${referralId}, user email: ${userEmail} [UserReferralService]`
    );

    // Fetch user referral details using referral ID and user email
    let userReferralDetails = await this.getUserReferralByReferralId(
      userEmail,
      referralId
    );

    // If referral details are not found, throw an error
    if (!userReferralDetails) {
      throw new BaseError(
        `The referral details not found for the provided referral ID "${referralId}" and email "${userEmail}".`
      );
    }

    // Update referral status to REJECTED if status is still AWAITING
    if (userReferralDetails.status === ReferralStatus.AWAITING) {
      await this.updateStatus(referralId, userEmail, ReferralStatus.REJECTED);
      logger.info(
        `Referral ${referralId} rejected after 5 days in awaiting status.`
      );
    } else {
      // Log that rejection is not required because status is not AWAITING
      logger.info(
        `The status for referral ${referralId} is "${userReferralDetails.status}", therefore rejection is not required`
      );
    }

    return true;
  }

  /**
   * getUserReferralsByJobUrl
   * 
   * Retrieves a user referral by job URL.
   *
   * @param {string} userEmail - The email of the user.
   * @param {string} jobUrl - The job URL.
   * @return {Promise<QueryResponse<DbUserReferralDto>>} A promise that resolves to the user referral data.
   */
  async getUserReferralsByJobUrl(userEmail: string, jobUrl: string): Promise<QueryResponse<DbUserReferralDto>> {
    return userReferralDao.getUserReferralsByJobUrl(userEmail, jobUrl);
  }
}

// Export an instance of the UserService class
export default new UserReferralService();
