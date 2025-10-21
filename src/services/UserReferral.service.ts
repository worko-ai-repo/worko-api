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
  ReferralStatusListingFilterOptions,
  UserReferralStatusChangeByCandDTO,
} from "../dtos/UserReferral.dto";
import {
  EmailTemplatePlaceholderCAND_REF_AUTO_CANCEL_AFTER_X_DAYS,
  EmailTemplatePlaceholderCAND_REF_AUTO_REJECT_AFTER_X_DAYS,
  EmailTemplatePlaceholderCAND_REFERRAL_REQ_ACCEPTED,
  EmailTemplatePlaceholderCAND_REFERRAL_REQ_COMPLETED,
} from "../dtos/EmailTemplatePlaceholder.dto";

// import models
import { DbUserReferralDto } from "../db/models/UserReferral.model";
import { DbUserSubsDto } from "../db/models/UserSubscription.model";
import { DbCountUserDto } from "../db/models/CountUser.model";

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

// Import helpers
import { getEmailFromPK } from "../helpers/user.helper";

// Import constants
import APP_CONSTANTS from '../configs/constants.config';

// Import dtos
import { ScheduleJobCreateDto, ScheduleJobRefReviewAcceptanceStatusInputDto } from '../dtos/ScheduleJob.dto';
import { PaginatedResultsWithMatchingConditionsResponse } from '../dtos/Common.dto';
import { CountUserDbCandidateReferralDto } from "../dtos/CountUser.dto";

// Import enums
import { ScheduleJobStatus, ScheduleJobType } from '../enums/ScheduleJob.enum';
import { CountUserDbEntityTypeEnum } from "../enums/CountUser.enum";
import { CountGlobalDbEntityTypeEnum } from '../enums/CountGlobal.enum';

// Import models
import { DbCountGlobalDto } from "../db/models/CountGlobal.model";
import { DbUserReferralResponseDto } from '../db/models/UserReferralResponse.model';

// Import services
import CompanyService from "./Company.service";
import UserSubscriptionService from "./UserSubscription.service";
import ScheduleJobService from './ScheduleJob.service';
import { userReferralEmpServiceObj } from './UserReferralEmp.service';
import { countUserServiceObj } from "./CountUser.service";
import { countGlobalServiceObj } from "./CountGlobal.service";

// Import utlis
import { BaseError } from '../utils/errors.util';
import HttpStatusCode from '../utils/http-codes.util';

/**
 *  UserReferralService class responsible for managing user referral-related operations.
 */
class UserReferralService {
  async performCountUserActivitiesAfterReferralUpdateForCand(
    updatedReferralData: DbUserReferralDto
  ): Promise<void> {
    const candidateEmail: string = getEmailFromPK(updatedReferralData.PK);
    const countUserReferralQueryResponse: QueryResponse<DbCountUserDto> = await countUserServiceObj.getCountUserByRegisteredEmailAndEntityType(
      candidateEmail, 
      CountUserDbEntityTypeEnum.REFERRAL
    );
    const countUserReferralData: DbCountUserDto = countUserReferralQueryResponse[0];

    if(updatedReferralData.status === ReferralStatus.REJECTED) {
      countUserServiceObj.createOrUpdateCountUserForReferralEntityType(
        candidateEmail,
        {
          candidateReferralCounts: {
            ...countUserReferralData?.candidateReferralCounts,
            total: (countUserReferralData?.candidateReferralCounts?.total ?? 0) - 1,
            awaiting: (countUserReferralData?.candidateReferralCounts?.awaiting ?? 0) - 1,
            rejected: (countUserReferralData?.candidateReferralCounts?.rejected ?? 0) + 1
          }
        },
        !!countUserReferralQueryResponse.count // If count user already exists in ddb then `true` else `false`
      );
    } else if(updatedReferralData.status === ReferralStatus.ACCEPTED) {
      countUserServiceObj.createOrUpdateCountUserForReferralEntityType(
        candidateEmail,
        {
          candidateReferralCounts: {
            ...countUserReferralData?.candidateReferralCounts,
            awaiting: (countUserReferralData?.candidateReferralCounts?.awaiting ?? 0) - 1,
            accepted: (countUserReferralData?.candidateReferralCounts?.accepted ?? 0) + 1
          }
        },
        !!countUserReferralQueryResponse.count // If count user already exists in ddb then `true` else `false`
      );
    } else if(updatedReferralData.status === ReferralStatus.DONE) {
      countUserServiceObj.createOrUpdateCountUserForReferralEntityType(
        candidateEmail,
        {
          candidateReferralCounts: {
            ...countUserReferralData?.candidateReferralCounts,
            accepted: (countUserReferralData?.candidateReferralCounts?.accepted ?? 0) - 1,
            done: (countUserReferralData?.candidateReferralCounts?.done ?? 0) + 1
          }
        },
        !!countUserReferralQueryResponse.count // If count user already exists in ddb then `true` else `false`
      );
    } else if (updatedReferralData.status === ReferralStatus.WITHDRAWN) {
      countUserServiceObj.createOrUpdateCountUserForReferralEntityType(
        candidateEmail,
        {
          candidateReferralCounts: {
            ...countUserReferralData?.candidateReferralCounts,
            total: (countUserReferralData?.candidateReferralCounts?.total ?? 0) - 1,
            awaiting: (countUserReferralData?.candidateReferralCounts?.awaiting ?? 0) - 1,
          }
        },
        !!countUserReferralQueryResponse.count // If count user already exists in ddb then `true` else `false`
      );
    }
  }

  async performCountGlobalActivitiesAfterReferralUpdate(
    updatedReferralData: DbUserReferralDto
  ): Promise<void> {
    const countGlobalReferralQueryResponse: QueryResponse<DbCountGlobalDto> = await countGlobalServiceObj.getCountGlobalByEntityType(
      CountGlobalDbEntityTypeEnum.REFERRAL
    );
    const countGlobalReferralData: DbCountGlobalDto = countGlobalReferralQueryResponse[0];

    if(updatedReferralData.status === ReferralStatus.REJECTED) {
      countGlobalServiceObj.createOrUpdateCountGlobalForReferralEntityType(
        {
          referralCounts: {
            ...countGlobalReferralData?.referralCounts,
            awaiting: (countGlobalReferralData?.referralCounts?.awaiting ?? 0) - 1,
            rejected: (countGlobalReferralData?.referralCounts?.rejected ?? 0) + 1
          }
        },
        !!countGlobalReferralQueryResponse.count // If count user already exists in ddb then `true` else `false`
      );
    } else if(updatedReferralData.status === ReferralStatus.ACCEPTED) {
      countGlobalServiceObj.createOrUpdateCountGlobalForReferralEntityType(
        {
          referralCounts: {
            ...countGlobalReferralData?.referralCounts,
            awaiting: (countGlobalReferralData?.referralCounts?.awaiting ?? 0) - 1,
            accepted: (countGlobalReferralData?.referralCounts?.accepted ?? 0) + 1
          }
        },
        !!countGlobalReferralQueryResponse.count // If count user already exists in ddb then `true` else `false`
      );
    } else if(updatedReferralData.status === ReferralStatus.DONE) {
      countGlobalServiceObj.createOrUpdateCountGlobalForReferralEntityType(
        {
          referralCounts: {
            ...countGlobalReferralData?.referralCounts,
            accepted: (countGlobalReferralData?.referralCounts?.accepted ?? 0) - 1,
            done: (countGlobalReferralData?.referralCounts?.done ?? 0) + 1
          }
        },
        !!countGlobalReferralQueryResponse.count // If count user already exists in ddb then `true` else `false`
      );
    } else if (updatedReferralData.status === ReferralStatus.WITHDRAWN) {
      countGlobalServiceObj.createOrUpdateCountGlobalForReferralEntityType(
        {
          referralCounts: {
            ...countGlobalReferralData?.referralCounts,
            awaiting: (countGlobalReferralData?.referralCounts?.awaiting ?? 0) - 1,
          }
        },
        !!countGlobalReferralQueryResponse.count // If count user already exists in ddb then `true` else `false`
      );
    }
  }

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
    let existingJoburlCheck = await this.getUserReferralsByJobUrl(
      email,
      decodedJobUrl
    );

    // If job url already exists, throw an error
    if (existingJoburlCheck.count) {
      throw new BaseError(
        "You have already requested for referral for this job. Check your dashboard for reference.",
        HttpStatusCode.FORBIDDEN_403
      );
    }

    // Create a new referral request data
    let referralRequestData: UserReferralRequestCreateDTO = {
      userSubscriptionId: referralRequest.userSubscriptionId,
      companyId: referralRequest.companyId,
      jobPortal: referralRequest.jobPortal,
      jobId: referralRequest.jobId,
      jobUrl: decodedJobUrl,
      jdExtracted: referralRequest.jdExtracted,
    };

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

    const countUserReferralQueryResponse: QueryResponse<DbCountUserDto> = await countUserServiceObj.getCountUserByRegisteredEmailAndEntityType(email, CountUserDbEntityTypeEnum.REFERRAL);
    const countUserReferralData: DbCountUserDto = countUserReferralQueryResponse[0];

    countUserServiceObj.createOrUpdateCountUserForReferralEntityType(
      email,
      {
        candidateReferralCounts: {
          ...countUserReferralData?.candidateReferralCounts,
          total: (countUserReferralData?.candidateReferralCounts?.total ?? 0) + 1,
          awaiting: (countUserReferralData?.candidateReferralCounts?.awaiting ?? 0) + 1
        }
      },
      !!countUserReferralQueryResponse.count // If count user already exists in ddb then `true` else `false`
    );

    const countGlobalReferralQueryResponse: QueryResponse<DbCountGlobalDto> = await countGlobalServiceObj.getCountGlobalByEntityType(
      CountGlobalDbEntityTypeEnum.REFERRAL
    );
    const countGlobalReferralData: DbCountGlobalDto = countGlobalReferralQueryResponse[0];

    countGlobalServiceObj.createOrUpdateCountGlobalForReferralEntityType(
      {
        referralCounts: {
          ...countGlobalReferralData?.referralCounts,
          awaiting: (countGlobalReferralData?.referralCounts?.awaiting ?? 0) + 1,
        }
      },
      !!countGlobalReferralQueryResponse.count // If count user already exists in ddb then `true` else `false`
    );

    return createdReferral;

    //below block checks gets the ExtractedJd from db if it is there
    /* const jdExtract = await CompanyJobServiceUrl.getJdUrl(
      referralRequest.jobUrl,
      referralRequest.companySK
    );
    if (jdExtract.count == 0) {
      //create new entery for company related jobUrl
      CompanyJobServiceUrl.addCompanyRelatedJob(
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
   *
   *
   *
   * @param referralId Referral request Id
   * @param email Email of the user
   * @returns matchingScore
   */
  async getReferralScoreForCand(email: string,referralId: string) {
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
    global.logger.info(
      `Fetching Referrals by referralId :${referralId} and userEmail:${userEmail}  [UserReferralService]`
    );
    return userReferralDao.getUserReferralByReferralId(userEmail, referralId);
  }

  /**
   * getReferralDetailsByReferralId
   *
   * Fetches Referral based on referralId.
   *
   * @param referralId - Referral id
   * @returns {Promise<QueryResponse<DbUserReferralDto>>} - A Promise that resolves to the query response containing the referral details.
   */
  async getReferralDetailsByReferralId(
    referralId: string
  ): Promise<QueryResponse<DbUserReferralDto>> {
    global.logger.info(
      `Get Referral Details for Referral Id ${referralId}. [DAO]`,
      {
        filePath: __filename,
        methodName: this.getReferralDetailsByReferralId.name,
      }
    );

    return userReferralDao.getReferralDetailsByReferralId(referralId);
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
   * @param userReferralStatusFilterOptions - userReferralStatusFilterOptions
   */
  async getReferralsForCand(
    email: string,
    userReferralStatusFilterOptions: ReferralStatusListingFilterOptions
  ):Promise<PaginatedResultsWithMatchingConditionsResponse<DbUserReferralDto>> {
    // Logging the action of getting user Referral by status in the service layer
    logger.info("Fetching user Referral by status [UserReferralService]");
    return userReferralDao.getReferralsForCand(
      email,
      userReferralStatusFilterOptions
    );
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

    // Get the referral details
    let referral = await this.getReferralById(referralId);
    const referralDataBeforeUpdate: DbUserReferralDto = referral[0];

    // if the new status is DONE, update the user response
    if (newStatus === ReferralStatus.DONE) {
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
        let updatedReferralResponseDetails: DbUserReferralResponseDto
        if (userReferralResponse.count) {
          // Remove the referralId from 'acceptedRefIds' from the userReferralResponse and add the referralId in 'doneRefIds' if found
          userReferralResponse[0].acceptedRefIds =
            userReferralResponse[0].acceptedRefIds.filter(
              (id: string) => id !== referralId
            );
          userReferralResponse[0].doneRefIds =
            userReferralResponse[0].doneRefIds.concat(referralId);

          // Update the UserReferralResponse
          updatedReferralResponseDetails = await UserReferralResponseService.update(empEmail, {
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
          updatedReferralResponseDetails = await UserReferralResponseService.update(
            empEmail,
            userReferralNewResponse
          );
        }

        UserReferralResponseService.performCountUserActivitiesAfterUserReferralResponseUpdate(
          empEmail,
          updatedReferralResponseDetails
        )
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

      this.performCountUserActivitiesAfterReferralUpdateForCand(
        updatedReferralStatus
      );

      this.performCountGlobalActivitiesAfterReferralUpdate(
        updatedReferralStatus
      )
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

      this.performCountUserActivitiesAfterReferralUpdateForCand(
        updatedReferralStatus
      )

      this.performCountGlobalActivitiesAfterReferralUpdate(
        updatedReferralStatus
      )
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
        candName: candName.toTitleCase(),
        companyName: companyName,
        refereeName: refereeName.toTitleCase(),
        workoAppUrl: APP_CONSTANTS.FRONTEND_URLS.WORKO_APP_URL,
        ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
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
   * sendEmailToCandidateOnAutoReferralCancellation
   *
   * Sends an email to the candidate when their referral is auto-cancelled.
   *
   * @param {string} candEmail - The email address of the candidate
   * @param {string} candName - The name of the candidate
   * @param {string} jobUrl - The title of the job for which the referral was made
   * @param {string} companyName - The name of the company
   * @returns {Promise<{ awsMessageId: string | null }>} A promise that resolves with the AWS message ID
   */
  async sendEmailToCandidateOnAutoReferralCancellation(
    candEmail: string,
    candName: string,
    jobUrl: string,
    companyName: string
  ): Promise<{ awsMessageId: string | null }> {
    // Prepare the email address object
    const toAddress: EmailSourceDestinationAddress = {
      email: candEmail,
      fullName: candName,
    };

    // Prepare the email placeholders
    const emailPlaceholders: EmailTemplatePlaceholderCAND_REF_AUTO_CANCEL_AFTER_X_DAYS =
      {
        candName: candName.toTitleCase(),
        jobUrl: jobUrl,
        companyName: companyName,
        workoAppUrl: APP_CONSTANTS.FRONTEND_URLS.WORKO_APP_URL,
        ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
      };

    // Send the email using the email library
    return emailLibrary.sendEmail(
      EmailTemplateEnum.CAND_REF_AUTO_CANCEL_AFTER_X_DAYS,
      toAddress,
      emailPlaceholders
    );
  }

  /**
   * sendEmailToCandidateOnAutoReferralRejection
   *
   * Sends an email to a candidate when their referral is auto-rejected.
   *
   * @param {string} candEmail - The email address of the candidate.
   * @param {string} candName - The name of the candidate.
   * @param {string} jobUrl - The title of the job for which the referral was made.
   * @param {string} companyName - The name of the company.
   * @param {Array<{ userId: string, actionDate: Date, reason: string, userComment: string }>} rejectedByUserIds - An array of objects containing the userId, actionDate, reason, and userComment of the users who rejected the referral.
   * @return {Promise<{ awsMessageId: string | null }>} A promise that resolves with the AWS message ID or null.
   */
  async sendEmailToCandidateOnAutoReferralRejection(
    candEmail: string,
    candName: string,
    jobUrl: string,
    companyName: string,
    rejectedByUserIds: {
      userId: string;
      actionDate: Date;
      reason: string;
      userComment: string;
    }[]
  ): Promise<{ awsMessageId: string | null }> {
    global.logger.info(
      "Sending Email To Candidate on Auto Referral Rejection [UserReferralService]"
    );
    // Prepare the email address object
    const toAddress: EmailSourceDestinationAddress = {
      email: candEmail,
      fullName: candName,
    };

    // Prepare the email placeholders
    const emailPlaceholders: EmailTemplatePlaceholderCAND_REF_AUTO_REJECT_AFTER_X_DAYS =
      {
        candName: candName.toTitleCase(),
        jobUrl: jobUrl,
        companyName: companyName,
        rejectedReasons: this.prepareReferralRejectedReasons(rejectedByUserIds),
        ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
        workoAppUrl: APP_CONSTANTS.FRONTEND_URLS.WORKO_APP_URL,
      };

    // Send the email using the email library
    return emailLibrary.sendEmail(
      EmailTemplateEnum.CAND_REF_AUTO_REJECT_AFTER_X_DAYS,
      toAddress,
      emailPlaceholders
    );
  }

  /**
   * prepareReferralRejectedReasons
   *
   * Formats the rejected reasons as an unordered list, displaying the last two reasons if there are more than two.
   * The format for each list item is: "Reason from drop down. - (Comment)"
   *
   * @param {Array<{ userId: string; actionDate: Date; reason: string; userComment: string }>} rejectedByUserIds
   * @returns {string} Formatted rejected reasons as an HTML unordered list
   */
  private prepareReferralRejectedReasons(
    rejectedByUserIds: {
      userId: string;
      actionDate: Date;
      reason: string;
      userComment: string;
    }[]
  ): string {
    /*
       `lastTwoReasons`
       This variable holds the last two reasons from the rejectedByUserIds array.
       This ensures that the function always returns the last two reasons, even if there are more than two reasons in the array.
       If there is only one reason, the function will return a single-item unordered list.
     */
    const lastTwoReasons = rejectedByUserIds.slice(-2);

    // Format each reason according to the specified format and join them into an unordered list
    return `<ul>${lastTwoReasons
      .map((item) => `<li>${item.reason} - (${item.userComment})</li>`)
      .join("")}</ul>`;
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
    let userReferralDetails: DbUserReferralDto =
      await this.getUserReferralByReferralId(userEmail, referralId);

    // If referral details are not found, throw an error
    if (!userReferralDetails) {
      throw new BaseError(
        `The referral details not found for the provided referral ID "${referralId}" and email "${userEmail}".`
      );
    }

    // Retrieve the matching score from user referral details
    const { matchingScore } = userReferralDetails;

    // Update referral status to CANCELLED if matching score is below minimum threshold
    if (matchingScore <= APP_CONSTANTS.MATCHING_SCORES.REFERRAL_MINIMUM_MATCHING_SCORE) {
      const updatedReferral: DbUserReferralDto = await this.updateStatus(referralId, userEmail, ReferralStatus.REJECTED);

      this.performCountUserActivitiesAfterReferralUpdateForCand(
        updatedReferral
      )

      this.performCountGlobalActivitiesAfterReferralUpdate(updatedReferral)
      logger.info(`Referral ${referralId} cancelled due to low matching score`);
    } else {
      // Create a delayed message to check referral status after 5 days
      let delayedStatusCheck =
        await this.scheduleDelayedReferralAcceptanceReview(
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
      await userReferralEmpServiceObj.sendEmailToEmployeesOnReferralCreation(
        userReferralDetails.companyId,
        referralId,
        candidateName
      );

      // send whatsappMessage to emp on new referral request
      await userReferralEmpServiceObj.sendWhatsAppBusinessPartnerWhatsappMsgtoEmployeesOnReferralCreation(
        candidateName,
        matchingScore,
        userReferralDetails.jobUrl,
        userReferralDetails.companyId
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
    const delayHours =
      APP_CONSTANTS.REFERRAL_REVIEW_ACCEPTANCE_STATUS_AFTER_X_HOURS;
    const scheduleTime = DateTime.now()
      .plus({ hours: delayHours })
      .toUTC()
      .toFormat("yyyy-MM-dd'T'HH:mm:ss");
    let scheduleJobRefReviewAcceptanceStatusInput: ScheduleJobRefReviewAcceptanceStatusInputDto =
      {
        referralId,
        userEmail,
        userId,
      };
    // Prepare the payload for the scheduled job
    const scheduleJobPayload: ScheduleJobCreateDto = {
      type: ScheduleJobType.REFERRAL_REVIEW_ACCEPTANCE_STATUS,
      scheduleTime: scheduleTime,
      input: scheduleJobRefReviewAcceptanceStatusInput,
      desc: `Review referral acceptance status for referral ID "${referralId}"`,
      status: ScheduleJobStatus.SCHEDULED,
    };

    // Create the scheduled job
    let scheduleJobCreated = await ScheduleJobService.createScheduleJob(
      scheduleJobPayload
    );

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

    if (userReferralDetails.status === ReferralStatus.AWAITING) {
      // Fetch additional details needed for the email
      let userDetails = await UserDetailService.get(userEmail);
      if (!userDetails.count) {
        throw new BaseError(`User Details not found for user ${userEmail}`);
      }
      let userDetail = userDetails[0];

      // Fetch company details
      let companyDetails = await CompanyService.getCompanyDetailsByIds([
        userReferralDetails.companyId,
      ]);
      if (!companyDetails.length) {
        throw new BaseError(
          `Company Details not found for company ID ${userReferralDetails.companyId}`
        );
      }

      // if referral has been already rejected by referree then update the referral status to REJCTED and send email
      if (
        userReferralDetails.rejectedByUserIds &&
        userReferralDetails.rejectedByUserIds.length > 0
      ) {
        // Update referral status based on rejection status
        await this.updateStatus(referralId, userEmail, ReferralStatus.REJECTED);
        logger.info(
          `The Referral ${referralId} updated to ${ReferralStatus.REJECTED} after ${APP_CONSTANTS.REFERRAL_REVIEW_ACCEPTANCE_STATUS_AFTER_X_HOURS} hour(s) in Awaiting status.`
        );

        // ===========================================================================
        // ===== SEND EMAIL TO CANDIDATE ON AUTO-REJECTION =====
        // ===========================================================================
        await this.sendEmailToCandidateOnAutoReferralRejection(
          userEmail,
          userDetail.name, // cand name
          userReferralDetails.jobUrl, // job url
          companyDetails[0].name, // company name
          userReferralDetails.rejectedByUserIds // rejected reasons
        );
      } else {
        // Update referral status based on rejection status
        await this.updateStatus(
          referralId,
          userEmail,
          ReferralStatus.CANCELLED
        );
        logger.info(
          `The Referral ${referralId} updated to ${ReferralStatus.CANCELLED} after ${APP_CONSTANTS.REFERRAL_REVIEW_ACCEPTANCE_STATUS_AFTER_X_HOURS} hour(s) in Awaiting status.`
        );

        // ===========================================================================
        // ===== SEND EMAIL TO CANDIDATE ON AUTO-CANCELLATION =====
        // ===========================================================================
        await this.sendEmailToCandidateOnAutoReferralCancellation(
          userEmail,
          userDetail.name, // cand name
          userReferralDetails.jobUrl, // job url
          companyDetails[0].name // company name
        );
      }
    } else {
      // Log that cancellation is not required because status is not AWAITING
      logger.info(
        `The status for referral ${referralId} is "${userReferralDetails.status}", therefore cancellation/rejection is not required`
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
  async getUserReferralsByJobUrl(
    userEmail: string,
    jobUrl: string
  ): Promise<QueryResponse<DbUserReferralDto>> {
    return userReferralDao.getUserReferralsByJobUrl(userEmail, jobUrl);
  }

  /**
   *========INTERNAL SCRIPT USE ONLY==========*
   *
   * updateUserReferralsJdMatchErrorCode
   *
   * @description This function updates a specific user referral in the database with the provided `jdMatchErrorCode`.
   * It is intended exclusively for internal script operations, particularly when modifying or correcting referral data
   * in bulk based on specific conditions. This function directly interacts with the data access layer to perform the update.
   *
   * **IMPORTANT:**
   * - This function is **not** intended for use in production code or any external operations.
   * - It has **no relation** to other functions, services, or API endpoints.
   * - **Do not use this function** for any kind of user-facing operations or as part of any service logic.
   * - Misuse of this function can lead to unintended consequences, and any such misuse will not be supported.
   *
   * @param {string} candEmail - The email of the user.
   * @param {string} referralId - The ID of the referral.
   * @param {number} jdMatchErrorCode - The data to update the user referral with.
   */
  async updateUserReferralsJdMatchErrorCode(
    candEmail: string,
    referralId: string,
    jdMatchErrorCode: number
  ): Promise<DbUserReferralDto> {
    global.logger.info("Update all user referrals for jd error code [Service]");
    return userReferralDao.updateUserReferralsJdMatchErrorCode(
      candEmail,
      referralId,
      jdMatchErrorCode
    );
  }
}

// Export an instance of the UserService class
export default new UserReferralService();
