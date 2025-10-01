// Load the defaults
import { DateTime } from "luxon";

// Import query response
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import aws lambda
import { APIGatewayProxyResult } from "aws-lambda";

// Load the local constants
import APP_CONSTANTS from "../configs/constants.config";

// Load the local daos
import userDao from "../daos/User.dao";
import userDetailDao from "../daos/UserDetail.dao";
import {
  EmailTemplatePlaceholderCAND_PREMIUM_EXPIRED_NOTIFICATION,
  EmailTemplatePlaceholderCAND_PREMIUM_UPGRADE_NOTIFICATION,
  EmailTemplatePlaceholderCAND_PROFILE_COMPLETION_REMINDER,
  EmailTemplatePlaceholderCAND_PROFILE_SWITCH_NOTIFICATION,
  EmailTemplatePlaceholderCAND_WELCOME_MSG,
  EmailTemplatePlaceholderEMP_PROFILE_COMPLETION_REMINDER,
  EmailTemplatePlaceholderEMP_SWITCH_PROFILE_NOTIFICATION,
  EmailTemplatePlaceholderEMP_WELCOME_MSG,
} from "../dtos/EmailTemplatePlaceholder.dto";

// Load the local dtos
import { SubscriptionCreateRequestDTO } from "../dtos/Subscription.dto";
import {
  NewUserCandSignUpDTO,
  NewUserEmpSignUpDTO,
  UserDetailSettingCreateApiDTO,
  UserParseCvRequestApiDto,
  UserParseCvResponseDto,
  UserPartialCvExtractDetailUpdateApiDto,
  UserSubscriptionDetailsUpdateDto,
} from "../dtos/User.dto";
import {
  EmailSourceDestinationAddress,
  emailLibrary,
} from "../libraries/email.library";

// Load the local enum
import { UserType } from "../enums/User.enum";
import { EmailTemplateEnum } from "../enums/EmailTemplate.enum";
import {
  UserSubscriptionStatus,
  UserSubscriptionType,
} from "../enums/UserSubscription.enum";

// Import helpers
import { getEmailFromPK } from "../helpers/user.helper";

// Load the local model
import { DbUserDetailSettingDto } from "../db/models/UserDetailSetting.model";
import { DbUserSkillDto } from "../db/models/UserSkill.model";
import { DbUserDetailDto } from "../db/models/UserDetail.model";
import { DbUserPreferenceDto } from "../db/models/UserPreference.model";
import { DbUserAchievementDto } from "../db/models/UserAchievement.model";

// Load the local services
import UserSkillService from "./UserSkill.service";
import UserDetailService from "./UserDetail.service";
import MasterSubscriptionService from "./MasterSubscription.service";
import UserSubscriptionService from "./UserSubscription.service";
import UserProfilePercentageService from "./UserProfilePercentage.service";
import { userDetailSettingServiceObj } from "./UserDetailSetting.service";
import { userPreferenceServiceObj } from "./UserPreference.service";
import UserAchievementService from "./UserAchievement.service";
import InvokeLambdaService from "./InvokeLambda.service";

// Load the local utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

// @todo all methods from everything (Dao, Service, etc) should return the response,
// it will help the caller to know what happed with the action and what is the response.

/**
 *  UserService class responsible for managing user-related operations.
 */
class UserService {
  /**
   * Retrieves user details by email id.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - Details of the user
   */
  async getUserByEmail(email: string) {
    global.logger.info("Get user detail by id [service]");
    return userDao.getUserInfo(email);
  }

  /**
   * Retrieves user details by email id.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - Details of the user
   */
  async getUserDetailByEmail(email: string, SK: string) {
    global.logger.info("Get user detail by id [service]");
    return userDetailDao.getUserDetails(email, SK);
  }

  /**
   *Get Count(pk)
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - Details of the user
   */
  async getCount(email: string) {
    global.logger.info("Get count by id [service]");
    return userDao.getCount(email);
  }

  /**
   * create a new user with provided details.
   *
   * @param userSignUpDTO - Details of the user to be added
   * @param email - Email of the user
   */
  async createNewUser(
    userSignUpDTO: NewUserCandSignUpDTO | NewUserEmpSignUpDTO,
    userType: string
  ): Promise<DbUserDetailDto> {
    global.logger.info("Create candidate/employee [service]");
    // Create a new user in db
    let createdUser = await userDetailDao.add(userSignUpDTO);

    // call setupUserResources to set up additional user resources after account creation
    await this.setupUserResources(createdUser, createdUser.userType[0]);

    // Create a new user in db
    return createdUser;
  }

  /**
   * createUserDetailSetting
   *
   * @param {string} email
   * @param {UserDetailSettingCreateApiDTO} validatedRequestBody
   * @returns {Promise<DbUserDetailSettingDto>}
   */
  async createUserDetailSetting(
    email: string,
    validatedRequestBody: UserDetailSettingCreateApiDTO
  ): Promise<DbUserDetailSettingDto> {
    // logger
    global.logger.info("Create user detail settings [service]", {
      methodName: this.createUserDetailSetting.name,
    });

    return userDetailSettingServiceObj.createUserDetailSetting(
      email,
      validatedRequestBody
    );
  }

  /**
   * @todo : Try to change name to "userAccountCreationAddtionalActvs", "finaliseUserAccountCreation"
   *
   * Sets up additional user resources after account creation.
   * This includes creating a subscription, sending welcome messages, etc.
   *
   * @param userSignUpDTO - Details of the user
   * @param userType - Type of user (candidate or employee)
   * */
  async setupUserResources(
    userSignUpDTO: DbUserDetailDto,
    userType: string
  ): Promise<boolean> {
    // Adding the FREE subscription plan for the User(Cand/Emp)
    let planName = UserSubscriptionType.FREE;
    const subPlan = await MasterSubscriptionService.getByPlan(planName);
    if (subPlan) {
      // Create partial data for subscription
      const subscriptionCreateRequest: SubscriptionCreateRequestDTO = {
        status: UserSubscriptionStatus.ACTIVE,
        orderId: "0",
        requestedReferrals: 0,
        acceptedReferrals: 0,
        completedReferrals: 0,
      };
      await UserSubscriptionService.create(
        subPlan.SK,
        userSignUpDTO.emailList.primary,
        subscriptionCreateRequest
      );
    } else {
      // Logger message
      global.logger.info(
        "The default/free subscription was not found therefore could not add free subscription to candidate while creating account.",
        {
          filePath: __filename,
          methodName: userSignUpDTO.name,
          plan: planName,
        }
      );
    }

    return true;
  }

  /**
   * getSK
   *
   * @param email - Email of the user making the request
   */
  async getSK(email: string) {
    global.logger.info("Get user SK [service]");
    return userDetailDao.getUserDetailSK(email);
  }

  /**
   *
   *  getSubscriptionStatus
   *
   * @param email - Email of the user making the request
   * @param SK
   * @returns
   */
  async getSubscriptionStatus(email: string, SK: string) {
    global.logger.info("Get user Subscription status [service]");
    return userDetailDao.getUserSubscriptionStatus(email, SK);
  }

  /**
   * EmailVerified
   *
   * @param email - Email of the user making the request
   */
  async verifyEmail(email: string) {
    global.logger.info("update user Email status to true [service]");
    const SK = await userDetailDao.getUserDetailSK(email);
    userDetailDao.updateEmailVerify(SK, email);
  }

  /**
   * sendProfileReminderEmailtoCand
   *
   * This function sends email to the candidate a profile completion reminder
   * @param email - Email of the candidate
   */
  async sendProfileReminderEmailtoCand(email: string) {
    // Get the User details to get his email and name
    const userDetails = await UserDetailService.get(email);
    if (!userDetails.count) {
      throw new Error("User does not exist");
    }
    const candEmail = userDetails[0].emailList.primary;
    const candName = userDetails[0].name;

    // Get the User Profile data for calculating percentage
    const userProfileData = await UserProfilePercentageService.get(email);
    if (!userProfileData.count) {
      global.logger.info("User with the email doesn't exist");
      return false;
    }
    const percArr = userProfileData[0].candidate;
    const totalCurPerc = percArr.reduce(
      (acc: any, item: { curPerc: any }) => acc + item.curPerc,
      0
    );

    /**
     * Getting the creation time from User Profile Service
     * Although this is correct data, it is not correct process
     * It should be fetched from UserDetails
     * Fix the issue of accessing createdAt from UserDetails
     */
    let creationDate;
    // Attempt to parse the date string into a Date object
    const dateObj = new Date(userProfileData[0].createdAt);
    // Create a Luxon DateTime object from the Date object
    creationDate = DateTime.fromJSDate(dateObj, {
      zone: APP_CONSTANTS.APP_DEFAULT_TIMEZONE,
    });
    // Get the current date and time
    const currentDate = DateTime.now();
    // Calculate the time difference in days
    const daysDifference = currentDate.diff(creationDate, "days").toObject()
      .days as number;

    // If the user profile completion percentage is less than 80%, then an email should be sent to the user
    if (totalCurPerc <= APP_CONSTANTS.PROFILE_COMPLETION_PERCENTAGE.CAND) {
      if (
        (daysDifference >= 3 && daysDifference < 4) ||
        (daysDifference >= 10 && daysDifference < 11) ||
        (daysDifference >= 18 && daysDifference < 19) ||
        (daysDifference >= 25 && daysDifference < 26)
      ) {
        const toAddress: EmailSourceDestinationAddress = {
          email: candEmail,
          fullName: candName,
        };
        const emailPlaceholders: EmailTemplatePlaceholderCAND_PROFILE_COMPLETION_REMINDER =
          {
            candName: candName.toTitleCase(),
          };
        // Function responsible for sending the email to the candidate a profile completion reminder
        const sendEmailResponse =
          await this.sendEmailToCandProfileCompletionReminder(
            emailPlaceholders,
            toAddress
          );
        return true;
      }
    }
    return false;
  }

  /**
   * sendProfileReminderEmailtoEmp - Function to send a profile completion reminder email to an employer
   *
   * @param {string} email - Email address of the employer
   * @returns {Promise<boolean>} - Promise resolving to true if reminder sent, false otherwise
   */
  async sendProfileReminderEmailtoEmp(email: string): Promise<boolean> {
    // Get the User details to get his email and name
    const userDetails = await UserDetailService.get(email);
    if (!userDetails.count) {
      throw new Error("User does not exist");
    }

    // Extract necessary details from userDetails
    const empEmail = userDetails[0].emailList.primary;
    const empName = userDetails[0].name;
    const userType = userDetails[0].userType;

    // Get the User Profile data for calculating percentage
    const userProfileData = await UserProfilePercentageService.get(email);
    if (!userProfileData.count) {
      global.logger.info("User with the email doesn't exist");
      return false;
    }
    const percArr = userProfileData[0].employee;
    const totalCurPerc = percArr.reduce(
      (acc: any, item: { curPerc: any }) => acc + item.curPerc,
      0
    );

    /**
     * Getting the creation time from User Profile Service
     * Although this is correct data, it is not correct process
     * It should be fetched from UserDetails
     * Fix the issue of accessing createdAt from UserDetails
     */
    let creationDate;
    // Attempt to parse the date string into a Date object
    const dateObj = new Date(userProfileData[0].createdAt);
    // Create a Luxon DateTime object from the Date object
    creationDate = DateTime.fromJSDate(dateObj, {
      zone: APP_CONSTANTS.APP_DEFAULT_TIMEZONE,
    });
    // Get the current date and time
    const currentDate = DateTime.now();
    // Calculate the time difference in days
    const daysDifference = currentDate.diff(creationDate, "days").toObject()
      .days as number;

    // If the user profile completion percentage is less than 80%, then an email should be sent to the user
    if (totalCurPerc <= APP_CONSTANTS.PROFILE_COMPLETION_PERCENTAGE.EMP) {
      if (
        userType.includes(UserType.EMP) ||
        (daysDifference >= 3 && daysDifference < 4) ||
        (daysDifference >= 10 && daysDifference < 11) ||
        (daysDifference >= 18 && daysDifference < 19) ||
        (daysDifference >= 25 && daysDifference < 26)
      ) {
        // Prepare email destination
        const toAddress: EmailSourceDestinationAddress = {
          email: empEmail,
          fullName: empName,
        };

        // Prepare email placeholders for profile completion reminder
        const emailPlaceholders: EmailTemplatePlaceholderEMP_PROFILE_COMPLETION_REMINDER =
          {
            empName: empName.toTitleCase(),
          };
        // Function responsible for sending the email to the employee a profile completion reminder
        const sendEmailResponse =
          await this.sendEmailToEmpProfileCompletionReminder(
            emailPlaceholders,
            toAddress
          );
        return true;
      }
    }
    return false;
  }

  /**
   * sendUserMailToUpgradeSubscription - Function to handle sending emails for subscription upgrades
   *
   * @param {string} email - Email address of the user
   * @returns {Promise<{ expired: boolean, awsMessageId: string | null }>} - Promise resolving to an object containing expired status and AWS message ID
   */
  async sendUserMailToUpgradeSubscription(
    email: string
  ): Promise<{ expired: boolean; awsMessageId: string | null }> {
    // Get user details using the email
    const userDetails = await UserDetailService.get(email);
    if (!userDetails.count) {
      throw new Error("User does not exist");
    }
    const candName = userDetails[0].name;
    // Get user subscription details using the email
    const result = await UserSubscriptionService.get(email);
    // Get current date

    let expiryDate;

    // Attempt to parse the date string into a Date object
    const dateObj = new Date(result[0].expiryDate);
    // Create a Luxon DateTime object from the Date object
    expiryDate = DateTime.fromJSDate(dateObj, {
      zone: APP_CONSTANTS.APP_DEFAULT_TIMEZONE,
    });
    // Get the current date and time
    const currentDate = DateTime.now();

    // Check if current date is after expiry date and subscription type is FREE
    if (
      currentDate > expiryDate &&
      result[0].name === UserSubscriptionType.FREE
    ) {
      global.logger.info("Free Subscription expired");
      // Prepare email destination
      const toAddress: EmailSourceDestinationAddress = {
        email: email,
        fullName: candName,
      };
      // Prepare email placeholders for free subscription upgrade notification
      const emailPlaceholders: EmailTemplatePlaceholderCAND_PREMIUM_UPGRADE_NOTIFICATION =
        {
          candName: candName.toTitleCase(),
          candPremiumUpgradeNowMsg:
            APP_CONSTANTS.FRONTEND_URLS.SUBS_PREMIUM_UPGRADE,
          ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
        };
      // Send email to remind upgrading subscription
      const sendEmailResponse =
        await this.sendReminderMailToUpgradeSubscription(
          emailPlaceholders,
          toAddress
        );

      // Return expired status and AWS message ID
      return {
        expired: true,
        awsMessageId: sendEmailResponse.awsMessageId,
      };
    } else if (
      currentDate > expiryDate &&
      result[0].name !== UserSubscriptionType.FREE
    ) {
      global.logger.info("Premium Subscription expired");
      // Prepare email destination
      const toAddress: EmailSourceDestinationAddress = {
        email: email,
        fullName: candName,
      };
      // Prepare email placeholders for premium subscription renewal notification
      const emailPlaceholders: EmailTemplatePlaceholderCAND_PREMIUM_EXPIRED_NOTIFICATION =
        {
          candName: candName.toTitleCase(),
          candRenewNowMsg: APP_CONSTANTS.FRONTEND_URLS.SUBS_PREMIUM_RENEW,
          ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
        };
      // Send email to remind renewing subscription
      const sendEmailResponse = await this.sendReminderMailToRenewSubscription(
        emailPlaceholders,
        toAddress
      );

      // Return expired status and AWS message ID
      return {
        expired: true,
        awsMessageId: sendEmailResponse.awsMessageId,
      };
    } else {
      global.logger.info("Subscription still holds");

      return {
        expired: false,
        awsMessageId: null,
      };
    }
  }

  /**
   * sendCandRemindertoCreateMutlipleProfiles - Function to send a reminder to create multiple profiles
   *
   * @param {string} email - Email address of the user
   * @returns {Promise<boolean>} - Promise resolving to true if reminder sent, false otherwise
   */
  async sendCandRemindertoCreateMutlipleProfiles(
    email: string
  ): Promise<boolean> {
    // Get user details using the email
    const userDetails = await UserDetailService.get(email);
    if (!userDetails.count) {
      throw new Error("User does not exist");
    }
    // Get user type
    const userType = userDetails[0].userType;
    // Check if user type includes 'CAND' (Candidate)
    const userTypeCand = UserType.CAND;

    if (userType.includes(userTypeCand)) {
      // If user is a candidate, proceed with sending reminder
      const candName = userDetails[0].name;
      // Get user profile data
      const userProfileData = await UserProfilePercentageService.get(email);
      if (!userProfileData.count) {
        global.logger.info("User with the email doesn't exist");
        return false;
      }
      /**
       * Getting the creation time from User Profile Service
       * Although this is correct data, it is not correct process
       * It should be fetched from UserDetails
       * Fix the issue of accessing createdAt from UserDetails
       */
      let creationDate;
      // Attempt to parse the date string into a Date object
      const dateObj = new Date(userProfileData[0].createdAt);
      // Create a Luxon DateTime object from the Date object
      creationDate = DateTime.fromJSDate(dateObj, {
        zone: APP_CONSTANTS.APP_DEFAULT_TIMEZONE,
      });
      // Get the current date and time
      const currentDate = DateTime.now();
      // Calculate the time difference in days
      const daysDifference = currentDate.diff(creationDate, "days").toObject()
        .days as number;

      // Check if the user profile is created between 3-25 days
      if (
        (daysDifference >= 3 && daysDifference < 4) ||
        (daysDifference >= 10 && daysDifference < 11) ||
        (daysDifference >= 18 && daysDifference < 19) ||
        (daysDifference >= 25 && daysDifference < 26)
      ) {
        // Prepare email destination
        const toAddress: EmailSourceDestinationAddress = {
          email: email,
          fullName: candName,
        };
        // Prepare email placeholders for profile switch notification
        const emailPlaceholders: EmailTemplatePlaceholderCAND_PROFILE_SWITCH_NOTIFICATION =
          {
            candName: candName.toTitleCase(),
          };
        // Send email to remind creating multiple profiles
        const sendEmailResponse =
          await this.sendCandReminderMailtoCreateMutlipleProfiles(
            emailPlaceholders,
            toAddress
          );
        // Return true to indicate reminder sent
        return true;
      }
    }
    // Return false if reminder not sent
    return false;
  }

  /**
   * sendEmpRemindertoCreateMutlipleProfiles - Function to send a reminder to employer to create multiple profiles
   *
   * @param {string} email - Email address of the user
   * @returns {Promise<boolean>} - Promise resolving to true if reminder sent, false otherwise
   */
  async sendEmpRemindertoCreateMutlipleProfiles(
    email: string
  ): Promise<boolean> {
    // Get user details using the email
    const userDetails = await UserDetailService.get(email);
    if (!userDetails.count) {
      throw new Error("User does not exist");
    }
    // Get user type
    const userType = userDetails[0].userType;
    // Check if user type includes 'EMP' (Employer)
    const userTypeEmp = UserType.EMP;
    if (userType.includes(userTypeEmp)) {
      // If user is an employer, proceed with sending reminder
      const empName = userDetails[0].name;
      const userProfileData = await UserProfilePercentageService.get(email);
      if (!userProfileData.count) {
        global.logger.info("User with the email doesn't exist");
        return false;
      }
      /**
       * Getting the creation time from User Profile Service
       * Although this is correct data, it is not correct process
       * It should be fetched from UserDetails
       * Fix the issue of accessing createdAt from UserDetails
       */
      let creationDate;

      // Attempt to parse the date string into a Date object
      const dateObj = new Date(userProfileData[0].createdAt);
      // Create a Luxon DateTime object from the Date object
      creationDate = DateTime.fromJSDate(dateObj, {
        zone: APP_CONSTANTS.APP_DEFAULT_TIMEZONE,
      });
      // Get the current date and time
      const currentDate = DateTime.now();
      // Calculate the time difference in days
      const daysDifference = currentDate.diff(creationDate, "days").toObject()
        .days as number;

      // Check if the user profile is created between 3-25 days
      if (
        (daysDifference >= 3 && daysDifference < 4) ||
        (daysDifference >= 10 && daysDifference < 11) ||
        (daysDifference >= 18 && daysDifference < 19) ||
        (daysDifference >= 25 && daysDifference < 26)
      ) {
        // Prepare email destination
        const toAddress: EmailSourceDestinationAddress = {
          email: email,
          fullName: empName,
        };
        // Prepare email placeholders for profile switch notification
        const emailPlaceholders: EmailTemplatePlaceholderEMP_SWITCH_PROFILE_NOTIFICATION =
          {
            empName: empName.toTitleCase(),
            workoLoginUrl: APP_CONSTANTS.FRONTEND_URLS.WORKO_APP_URL,
            ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
          };
        // Send email to remind creating multiple profiles
        const sendEmailResponse =
          await this.sendEmpReminderMailtoCreateMutlipleProfiles(
            emailPlaceholders,
            toAddress
          );
        // Return true to indicate reminder sent
        return true;
      }
    }
    // Return false if reminder not sent
    return false;
  }

  /**
   *
   * updateUserCV
   *
   * @param email
   * @param resume
   */
  async updateUserCV(
    email: string,
    resume: string,
    userCvFileName?: string,
    isCvExtracted?: boolean
  ) {
    global.logger.info("Update user resume [service]");
    const SK = await userDetailDao.getUserDetailSK(email);
    userDetailDao.updateCv(SK, email, resume, userCvFileName, isCvExtracted);
  }

  async updatePartialCvExtractDetails(userRegisteredEmail: string, reqBody: UserPartialCvExtractDetailUpdateApiDto): Promise<boolean> {
    global.logger.info("Update partial cv extract details [service]", {
      userRegisteredEmail,
    });

    const cognitoUserId: string = global.requestLocalContext.userId;

    const userDetailsQueryResponse: QueryResponse<DbUserDetailDto> =
      await UserDetailService.getUserById(cognitoUserId);
    if (!userDetailsQueryResponse.count) {
      throw new BaseError(
        `Your details are not found in our system, so you are not allowed to update details.`,
        HttpStatusCode.FORBIDDEN_403
      );
    }
    const userDetails: DbUserDetailDto = userDetailsQueryResponse[0];

    if(getEmailFromPK(userDetails.PK) !== userRegisteredEmail) {
      throw new BaseError(
        `You are not allowed to update details.`,
        HttpStatusCode.FORBIDDEN_403
      );
    }

    if(!userDetails?.CV) {
      throw new BaseError(
        `Your CV is not found in our system, so you are not allowed to update details.`,
        HttpStatusCode.FORBIDDEN_403
      );
    }

    const {
      noticePeriod,
      YOE,
      CTC,
      userPreferredDepartments,
      userPreferredlocations,
      coreSkills,
    } = reqBody

    const updateUserData: (Promise<DbUserDetailDto> | Promise<DbUserPreferenceDto> | Promise<DbUserSkillDto>)[] = [
      UserDetailService.updateUserDetail(userRegisteredEmail, userDetails.id, {
        noticePeriod,
        YOE,
        CTC,
      }),

      userPreferenceServiceObj.createOrUpdateUserPreferenceForPartialCvExtract(
        userRegisteredEmail,
        cognitoUserId,
        {
          userPreferredDepartments,
          userPreferredlocations,
        }
      ),

      UserSkillService.createOrUpdateUserSkillForPartialCvExtract(
        userRegisteredEmail,
        {
          coreSkills,
        }
      )
    ]

    const userDetailsUpdated: (DbUserDetailDto | DbUserPreferenceDto | DbUserSkillDto)[] = await Promise.all(updateUserData);

    if(
      !userDetailsUpdated[0] ||
      !userDetailsUpdated[1] ||
      !userDetailsUpdated[2]
    ) {
      return false;
    } 

    return true;
  }

  /**
   *
   * Decrease referral
   *
   * @param email
   */
  // async decreaseReferralCount(email: string) {
  //   global.logger.info("Decrease referral count [service]");
  //   //To Get SK
  //   const SK = await this.getSK(email);
  //   //To Get referral count
  //   const refCount = await userDetailDao.getUserSubscriptionStatus(email, SK);
  //   console.log("refCount: ", refCount[0].referralCount);
  //   const currRefCount = refCount[0].referralCount - 1;
  //   //if referral count is below 1 then subscription status is set to be false
  //   if (currRefCount < 1) {
  //     userDetailDao.updateIsSubscribedStatus(SK, email, false);
  //   }
  //   /* Ensure that the referral count is never below zero.
  //   If somehow the referral count goes below zero (negative number),
  //   reset it to zero to maintain a non-negative count. */
  //   if (currRefCount < 0) {
  //     return userDetailDao.updateReferralCount(SK, email, 0);
  //   }
  //   // updating referral count
  //   return this.updateReferralCount(SK, email, currRefCount);
  // }

  /**
   *
   * Increase referral when Candidate referal requests is Withdrawn
   */

  // async increaseReferralCount(candEmail: string) {
  //   global.logger.info("Increase referral count [service]");

  //   // Get SK
  //   const SK = await this.getSK(candEmail);

  //   // Get referral count
  //   const userSubscriptions = await userDetailDao.getUserSubscriptionStatus(candEmail, SK);

  //   let currRefCount = 0;

  //   // Check if referral count exists
  //   if (userSubscriptions.length > 0) {
  //     currRefCount = userSubscriptions[0].referralCount;
  //     global.logger.info(`Current referral count: ${currRefCount}`);
  //   }

  //   // Increment referral count
  //   currRefCount++;
  //   global.logger.info(`New referral count: ${currRefCount}`);

  //   // Update referral count
  //   const updateResult = await this.updateReferralCount(SK, candEmail, currRefCount);
  //   global.logger.info(`Update result: ${updateResult}`);

  //   if (updateResult.referralCount > 1) {
  //     userDetailDao.updateIsSubscribedStatus(SK, candEmail, true);
  //   }

  //   return updateResult;
  // }

  /**
   * Updates the referral count for a user.
   *
   * @param {string} id - The ID of the user.
   * @param {string} candEmail - The candidate's email address.
   * @param {UserSubscriptionDetailsUpdateDto} updateBodyObject - The object containing updated subscription details.
   * @returns {Promise<DbUserDetailDto>} - A promise that resolves to the updated user details.
   */
  async updateReferralCount(
    id: string,
    candEmail: string,
    updateBodyObject: UserSubscriptionDetailsUpdateDto
  ): Promise<DbUserDetailDto> {
    return userDetailDao.updateReferralCount(id, candEmail, updateBodyObject);
  }

  /**
   * sendEmailToCandWelcomeMessage
   *
   * Sends a candidate welcome email.
   *
   * @param {EmailTemplatePlaceholderCAND_WELCOME_MSG} emailPlaceholders - Placeholders for the email template.
   * @param {EmailSourceDestinationAddress} toAddress - Object containing the name and email address of the recipient.
   * @returns { Promise<{ awsMessageId: string | null }> }
   */
  async sendEmailToCandWelcomeMessage(
    emailPlaceholders: EmailTemplatePlaceholderCAND_WELCOME_MSG,
    toAddress: EmailSourceDestinationAddress
  ): Promise<{ awsMessageId: string | null }> {
    // Send email using the email library with the specified template, recipient, and placeholders
    return emailLibrary.sendEmail(
      EmailTemplateEnum.CAND_WELCOME_MSG,
      toAddress,
      emailPlaceholders
    );
  }

  /**
   * sendEmailToCandProfileCompletionRemainder
   *
   * Sends candidate a profile completion reminder email.
   *
   * @param {EmailTemplatePlaceholderCAND_PROFILE_COMPLETION_REMINDER} emailPlaceholders - Placeholders for the email template.
   * @param {EmailSourceDestinationAddress} toAddress - Object containing the name and email address of the recipient.
   * @returns { Promise<{ awsMessageId: string | null }> }
   */
  async sendEmailToCandProfileCompletionReminder(
    emailPlaceholders: EmailTemplatePlaceholderCAND_PROFILE_COMPLETION_REMINDER,
    toAddress: EmailSourceDestinationAddress
  ): Promise<{ awsMessageId: string | null }> {
    // Send email using the email library with the specified template, recipient, and placeholders
    return emailLibrary.sendEmail(
      EmailTemplateEnum.CAND_PROFILE_COMPLETION_REMINDER,
      toAddress,
      emailPlaceholders
    );
  }

  /**
   * sendEmailToEmpProfileCompletionReminder - Function to send an email reminder to employer for profile completion
   *
   * @param {EmailTemplatePlaceholderEMP_PROFILE_COMPLETION_REMINDER} emailPlaceholders - Placeholders for email content
   * @param {EmailSourceDestinationAddress} toAddress - Email address and full name of the recipient
   * @returns {Promise<{ awsMessageId: string | null }>} - Promise resolving to AWS message ID or null
   */
  async sendEmailToEmpProfileCompletionReminder(
    emailPlaceholders: EmailTemplatePlaceholderEMP_PROFILE_COMPLETION_REMINDER,
    toAddress: EmailSourceDestinationAddress
  ): Promise<{ awsMessageId: string | null }> {
    // Send email using the email library with the specified template, recipient, and placeholders
    return emailLibrary.sendEmail(
      EmailTemplateEnum.EMP_PROFILE_COMPLETION_REMINDER,
      toAddress,
      emailPlaceholders
    );
  }

  /**
   * sendReminderMailToUpgradeSubscription - Function to send an email reminder for upgrading subscription
   *
   * @param {EmailTemplatePlaceholderCAND_PREMIUM_UPGRADE_NOTIFICATION} emailPlaceholders - Placeholders for email content
   * @param {EmailSourceDestinationAddress} toAddress - Email address and full name of the recipient
   * @returns {Promise<{ awsMessageId: string | null }>} - Promise resolving to AWS message ID or null
   */
  async sendReminderMailToUpgradeSubscription(
    emailPlaceholders: EmailTemplatePlaceholderCAND_PREMIUM_UPGRADE_NOTIFICATION,
    toAddress: EmailSourceDestinationAddress
  ): Promise<{ awsMessageId: string | null }> {
    // Call emailLibrary to send email using provided template, recipient and placeholders
    return emailLibrary.sendEmail(
      EmailTemplateEnum.CAND_PREMIUM_UPGRADE_NOTIFICATION,
      toAddress,
      emailPlaceholders
    );
  }

  /**
   * sendReminderMailToRenewSubscription - Function to send an email reminder for renewing subscription
   *
   * @param {EmailTemplatePlaceholderCAND_PREMIUM_EXPIRED_NOTIFICATION} emailPlaceholders - Placeholders for email content
   * @param {EmailSourceDestinationAddress} toAddress - Email address and full name of the recipient
   * @returns {Promise<{ awsMessageId: string | null }>} - Promise resolving to AWS message ID or null
   */
  async sendReminderMailToRenewSubscription(
    emailPlaceholders: EmailTemplatePlaceholderCAND_PREMIUM_EXPIRED_NOTIFICATION,
    toAddress: EmailSourceDestinationAddress
  ): Promise<{ awsMessageId: string | null }> {
    // Call emailLibrary to send email using provided template, recipient and placeholders
    return emailLibrary.sendEmail(
      EmailTemplateEnum.CAND_PREMIUM_EXPIRED_NOTIFICATION,
      toAddress,
      emailPlaceholders
    );
  }

  /**
   * sendCandReminderMailtoCreateMutlipleProfiles - Function to send an email reminder to create multiple profiles
   *
   * @param {EmailTemplatePlaceholderCAND_PROFILE_SWITCH_NOTIFICATION} emailPlaceholders - Placeholders for email content
   * @param {EmailSourceDestinationAddress} toAddress - Email address and full name of the recipient
   * @returns {Promise<{ awsMessageId: string | null }>} - Promise resolving to AWS message ID or null
   */
  async sendCandReminderMailtoCreateMutlipleProfiles(
    emailPlaceholders: EmailTemplatePlaceholderCAND_PROFILE_SWITCH_NOTIFICATION,
    toAddress: EmailSourceDestinationAddress
  ): Promise<{ awsMessageId: string | null }> {
    // Call emailLibrary to send email using provided template, recipient, and placeholders
    return emailLibrary.sendEmail(
      EmailTemplateEnum.CAND_PROFILE_SWITCH_NOTIFICATION,
      toAddress,
      emailPlaceholders
    );
  }

  /**
   * sendEmpReminderMailtoCreateMutlipleProfiles - Function to send an email reminder to employer to create multiple profiles
   *
   * @param {EmailTemplatePlaceholderEMP_SWITCH_PROFILE_NOTIFICATION} emailPlaceholders - Placeholders for email content
   * @param {EmailSourceDestinationAddress} toAddress - Email address and full name of the recipient
   * @returns {Promise<{ awsMessageId: string | null }>} - Promise resolving to AWS message ID or null
   */
  async sendEmpReminderMailtoCreateMutlipleProfiles(
    emailPlaceholders: EmailTemplatePlaceholderEMP_SWITCH_PROFILE_NOTIFICATION,
    toAddress: EmailSourceDestinationAddress
  ): Promise<{ awsMessageId: string | null }> {
    // Call emailLibrary to send email using provided template, recipient, and placeholders
    return emailLibrary.sendEmail(
      EmailTemplateEnum.EMP_SWITCH_PROFILE_NOTIFICATION,
      toAddress,
      emailPlaceholders
    );
  }

  /**
   * sendEmailToEmpWelcomeMessage - Function to send a welcome email message to an employer
   *
   * @param {EmailTemplatePlaceholderEMP_WELCOME_MSG} emailPlaceholders - Placeholders for email content
   * @param {EmailSourceDestinationAddress} toAddress - Email address and full name of the recipient
   * @returns {Promise<{ awsMessageId: string | null }>} - Promise resolving to AWS message ID or null
   */
  async sendEmailToEmpWelcomeMessage(
    emailPlaceholders: EmailTemplatePlaceholderEMP_WELCOME_MSG,
    toAddress: EmailSourceDestinationAddress
  ): Promise<{ awsMessageId: string | null }> {
    // Call emailLibrary to send email using provided template, recipient, and placeholders
    return emailLibrary.sendEmail(
      EmailTemplateEnum.EMP_WELCOME_MSG,
      toAddress,
      emailPlaceholders
    );
  }

  /**
   * getUserBasicDetails
   *
   * Retrieves the basic user details including skills. If the user is not found
   * or the skills are not found, it logs an error.
   *
   * @param {string} userId - The ID of the user.
   * @returns A promise that resolves to the basic user details and skills.
   */
  async getUserBasicDetails(
    userId: string
  ): Promise<
    Partial<DbUserDetailDto> &
      Partial<DbUserSkillDto> &
      Partial<DbUserPreferenceDto> &
      Partial<DbUserAchievementDto>
  > {
    // logger
    global.logger.debug(`Get user basic details [service]`, {
      userId,
    });

    // Fetch user details and log error if not found
    const userDetailsQueryResponse: QueryResponse<DbUserDetailDto> =
      await UserDetailService.getUserBasicDetailsByUserId(userId);
    if (!userDetailsQueryResponse.count) {
      global.logger.error(`User not found [service]`, {
        userId,
      });
    }

    // Destructure the fetched user details
    const userDetails: DbUserDetailDto = userDetailsQueryResponse[0];

    const userRegisteredEmail: string = userDetails.PK.split("#")[2];

    // Fetch the skills of the user and log error if not found
    const userSkillsQueryResponse: QueryResponse<DbUserSkillDto> =
      await UserSkillService.getUserSkillsByEmail(userRegisteredEmail);
    if (!userSkillsQueryResponse.count) {
      global.logger.error(`User skills not found [service]`, {
        userId,
      });
    }

    // Destructure the fetched user skills
    const userSkills: DbUserSkillDto = userSkillsQueryResponse[0];

    const userPreferencesQueryResponse: QueryResponse<DbUserPreferenceDto> =
      await userPreferenceServiceObj.getUserPreferenceBasicDetails(
        userRegisteredEmail
      );
    if (!userPreferencesQueryResponse.count) {
      global.logger.error(`User preferences not found [service]`, {
        userId,
      });
    }

    // Destructure the fetched user preferences
    const userPreferences: DbUserPreferenceDto =
      userPreferencesQueryResponse[0];

    const userAchievementsQueryResponse: QueryResponse<DbUserAchievementDto> =
      await UserAchievementService.getUserAchievementBasicDetails(
        userRegisteredEmail
      );
    if (!userAchievementsQueryResponse.count) {
      global.logger.error(`User achievements not found [service]`, {
        userId,
      });
    }

    // Destructure the fetched user achievements
    const userAchievements: DbUserAchievementDto =
      userAchievementsQueryResponse[0];

    const finalUserDetailsResponse: Partial<DbUserDetailDto> &
      Partial<DbUserSkillDto> &
      Partial<DbUserPreferenceDto> &
      Partial<DbUserAchievementDto> = {
      ...userDetails,
      ...userSkills,
      ...userPreferences,
      ...userAchievements,
    };

    return finalUserDetailsResponse;
  }
  /**
   * getUserDetailsById
   *
   * @param {string} userId
   * @returns {Promise<DbUserDetailDto>}
   */
  async getUserDetailsById(userId: string): Promise<DbUserDetailDto> {
    // logger
    global.logger.info("Get user details by id [service]", {
      userId,
    });

    return UserDetailService.getUserByIdOne(userId);
  }

  async parseCv(
    parseCvRequest: UserParseCvRequestApiDto
  ): Promise<UserParseCvResponseDto> {
    const cognitoUserId: string = global.requestLocalContext.userId;

    // Parse the user details
    const userDetailsQueryResponse: QueryResponse<DbUserDetailDto> =
      await UserDetailService.getUserById(cognitoUserId);
    if (!userDetailsQueryResponse.count) {
      throw new BaseError(
        `Your details are not found in our system, so you are not allowed to parse CV.`,
        HttpStatusCode.FORBIDDEN_403
      );
    }

    const userDetails: DbUserDetailDto = userDetailsQueryResponse[0];

    if (userDetails?.CV !== parseCvRequest.s3ResumeId) {
      throw new BaseError(
        `Your CV is not found in our system, so you are not allowed to parse CV.`,
        HttpStatusCode.FORBIDDEN_403
      );
    }

    const cvTriggerResponse: APIGatewayProxyResult =
      await InvokeLambdaService.triggerResumePartialExtraction(
        parseCvRequest.s3ResumeId,
        userDetails.id
      );
    global.logger.info("CV Response", {
      methodName: this.parseCv.name,
      statusCode: cvTriggerResponse.statusCode,
    });
    if (cvTriggerResponse.statusCode !== HttpStatusCode.OK_200) {
      throw new BaseError(
        `CV parsing failed.`,
        cvTriggerResponse?.statusCode ??
          HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    return JSON.parse(cvTriggerResponse["body"]);
  }
}

// Export an instance of the UserService class
export default new UserService();
