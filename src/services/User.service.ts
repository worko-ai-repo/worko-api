// Load the defaults
import { DateTime } from 'luxon';

// Load the local daos
import APP_CONSTANTS from "../configs/constants.config";
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
  EmailTemplatePlaceholderEMP_WELCOME_MSG
} from "../dtos/EmailTemplatePlaceholder.dto";

// Load the local dtos
import { SubscriptionCreateRequestDTO } from '../dtos/Subscription.dto';
import { NewUserCandSignUpDTO, NewUserEmpSignUpDTO, UserSubscriptionDetailsUpdateDto } from "../dtos/User.dto";
import { EmailSourceDestinationAddress, emailLibrary } from "../libraries/email.library";

// Load the local enum
import { UserType } from "../enums/User.enum";
import { EmailTemplateEnum } from "../enums/EmailTemplate.enum";
import { UserSubscriptionStatus, UserSubscriptionType } from "../enums/UserSubscription.enum";
import { WhatsappTemplateNameEnum } from '../enums/WhatsappTemplate.enum';
import { WhatsappMessageTypeCloudApiEnum } from '../enums/WhatsappMessageLog.enum';

// Load the local model
import { DbUserDetailDto } from "../db/models/UserDetail.model";

// Load the local services
import UserDetailService from "./UserDetail.service";
import MasterSubscriptionService from "./MasterSubscription.service";
import UserSubscriptionService from "./UserSubscription.service";
import UserProfilePercentageService from "./UserProfilePercentage.service";
import { WhatsappTemplatePlaceholderCAND_WELCOME_MSG, WhatsappTemplatePlaceholderEMP_WELCOME_MSG } from '../dtos/WhatsappTemplatePlaceholder.dto';
import { whatsappLibraryObj } from '../libraries/Whatsapp.library';


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
   * updateLastAccessedDash
   * 
   * Updates the last accessed dashboard for a user
   *
   * @param email - Email of the user
   * @param userlastAccessedDash - User's Last Accessed Dashboard
   */
  async updateLastAccessedDash(email: string, userlastAccessedDash: string) {

    const SK = await this.getSK(email);
    return userDetailDao.updateLastAccessedDash(email, SK, userlastAccessedDash);
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
  async createNewUser(userSignUpDTO: NewUserCandSignUpDTO | NewUserEmpSignUpDTO, userType: string): Promise<DbUserDetailDto> {
    global.logger.info("Create candidate/employee [service]");
    // Create a new user in db
    let createdUser = await userDetailDao.add(userSignUpDTO);

    // call setupUserResources to set up additional user resources after account creation
    await this.setupUserResources(createdUser ,createdUser.userType[0]);
    
    // Create a new user in db
    return createdUser;
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
  async setupUserResources(userSignUpDTO: DbUserDetailDto , userType: string) : Promise<boolean>{
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
      await UserSubscriptionService.create(subPlan.SK, userSignUpDTO.emailList.primary, subscriptionCreateRequest);
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

    // send welcome email based on the userType .  
    // @todo Need to review this as this is moved to SQS and should be removed from here as there is no use of the below welcome email code 
    if (userType === UserType.CAND) {
      // Prepare details required for sending the Email
      const candName: string = userSignUpDTO.name;
      const candEmail: string = userSignUpDTO.emailList.primary;

      // Prepare the necessary parameters required for the sendEmailToCandWelcomeMessage function
      const toAddress: EmailSourceDestinationAddress = {
        email: candEmail,
        fullName: candName,
      };
      const emailPlaceholders: EmailTemplatePlaceholderCAND_WELCOME_MSG = {
        candName: candName,
      };

      // Send welcome email // todo : review it to remove from here and use SQS to send email
      await this.sendEmailToCandWelcomeMessage(emailPlaceholders, toAddress);

      // Send welcome WhatsApp message
      const whatsappPlaceholders: WhatsappTemplatePlaceholderCAND_WELCOME_MSG =
        {
          body: { type: WhatsappMessageTypeCloudApiEnum.TEXT, value: candName }, // replace placeholder with candName
        };

      /**
       * NOTE:- As of now we are verifying user "isEmailVerified" attribute to send whatsapp message to the user
       * but in near future we will verify user "isNumberVerified" attribute to send whatsapp message to the user
       *
       * Check if user has isEmailVerified true or false, if true then send whatsapp message to the user
       */
      if (userSignUpDTO.isEmailVerified) {
        // Function responsible for sending a whatsapp message to the candidate
        await this.sendWelcomeWhatsappMessageToCand(
          whatsappPlaceholders,
          userSignUpDTO.number,
          candEmail
        );
      } else {
        global.logger.info(
          "User Number is not verified therefore could not send whatsapp message",
          {
            //
          }
        );
      }
    } else if (userType === UserType.EMP) {
      // Prepare details required for sending the Email
      const empName: string = userSignUpDTO.name;
      const empEmail: string = userSignUpDTO.emailList.primary;

      // Prepare the necessary parameters required for the sendEmailToCandWelcomeMessage function
      const toAddress: EmailSourceDestinationAddress = {
        email: empEmail,
        fullName: empName
      };
      const emailPlaceholders: EmailTemplatePlaceholderEMP_WELCOME_MSG = {
        empName: empName
      }

      // Send welcome WhatsApp message
      const whatsappPlaceholders: WhatsappTemplatePlaceholderEMP_WELCOME_MSG = {
        body: { type: WhatsappMessageTypeCloudApiEnum.TEXT , value: empName } // empName Placeholer
      };

      // Send welcome email // todo : review it to remove from here and use SQS to send email
      await this.sendEmailToEmpWelcomeMessage(emailPlaceholders, toAddress);

      // Check whether emp number is verified or not , if verified then whatsapp message to the candidate
      if (userSignUpDTO.isEmailVerified) {
        // Function responsible for sending a whatsapp message to the candidate 
        await this.sendWelcomeWhatsappMessageToEmp(whatsappPlaceholders, userSignUpDTO.number , empEmail);
      } else {
        global.logger.info(" User Number is not verified therefore could not send any message")
      }
    }

    return true;
  }

  /**
   * Sends a welcome WhatsApp message to a candidate.
   * 
   * @param {WhatsappTemplatePlaceholderCAND_WELCOME_MSG} placeholders - The placeholders for the message template.
   * @param {string} toPhoneNumber - The phone number of the candidate to send the message to.
   * @param {string} userEmail - The email of the candidate.
   * 
   */
  async sendWelcomeWhatsappMessageToCand(
    placeholders: WhatsappTemplatePlaceholderCAND_WELCOME_MSG,
    toPhoneNumber: string,
    userEmail: string
  ) : Promise<boolean>{
    await whatsappLibraryObj.sendWhatsappMessage(
      userEmail,
      WhatsappTemplateNameEnum.CAND_WELCOME_MSG,
      toPhoneNumber,
      placeholders
    );
    return true
  }

  /**
   * Sends a welcome WhatsApp message to an employee.
   * 
   * @param {WhatsappTemplatePlaceholderEMP_WELCOME_MSG} placeholders - The placeholders for the message template.
   * @param {string} toPhoneNumber - The phone number of the employee to send the message to.
   * @param {string} userEmail - The email of the employee.
   * 
   */
  async sendWelcomeWhatsappMessageToEmp(
    placeholders: WhatsappTemplatePlaceholderEMP_WELCOME_MSG,
    toPhoneNumber: string,
    userEmail: string
  ): Promise<boolean> {
     whatsappLibraryObj.sendWhatsappMessage(
      userEmail,
      WhatsappTemplateNameEnum.EMP_WELCOME_MSG,
      toPhoneNumber,
      placeholders
    );
    return true
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
    if(!userDetails.count)
    {
      throw new Error("User does not exist");
    }
    const candEmail = userDetails[0].emailList.primary;
    const candName = userDetails[0].name;
    
    // Get the User Profile data for calculating percentage
    const userProfileData = await UserProfilePercentageService.get(email);
    if(!userProfileData.count)
    {
      global.logger.info("User with the email doesn't exist");
      return false;
    }
    const percArr = userProfileData[0].candidate
    const totalCurPerc = percArr.reduce((acc: any, item: { curPerc: any; }) => acc + item.curPerc, 0);

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
    creationDate = DateTime.fromJSDate(dateObj, { zone: APP_CONSTANTS.APP_DEFAULT_TIMEZONE });
    // Get the current date and time
    const currentDate = DateTime.now();
    // Calculate the time difference in days
    const daysDifference = currentDate.diff(creationDate, 'days').toObject().days as number;

    // If the user profile completion percentage is less than 80%, then an email should be sent to the user
    if (totalCurPerc <= APP_CONSTANTS.PROFILE_COMPLETION_PERCENTAGE.CAND)
    {
      if( (daysDifference >= 3 && daysDifference < 4) 
      || (daysDifference >= 10 && daysDifference < 11) 
      || (daysDifference >= 18 && daysDifference < 19)
      || (daysDifference >= 25 && daysDifference < 26))
      {
        const toAddress: EmailSourceDestinationAddress = {
          email: candEmail,
          fullName: candName
        };
        const emailPlaceholders: EmailTemplatePlaceholderCAND_PROFILE_COMPLETION_REMINDER = {
          candName: candName
        }
        // Function responsible for sending the email to the candidate a profile completion reminder
        const sendEmailResponse = await this.sendEmailToCandProfileCompletionReminder(emailPlaceholders,toAddress);
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
    if(!userDetails.count)
    {
      throw new Error("User does not exist");
    }

    // Extract necessary details from userDetails
    const empEmail = userDetails[0].emailList.primary;
    const empName = userDetails[0].name;
    const userType = userDetails[0].userType; 
    
    // Get the User Profile data for calculating percentage
    const userProfileData = await UserProfilePercentageService.get(email);
    if(!userProfileData.count)
    {
      global.logger.info("User with the email doesn't exist");
      return false;
    }
    const percArr = userProfileData[0].employee
    const totalCurPerc = percArr.reduce((acc: any, item: { curPerc: any; }) => acc + item.curPerc, 0);

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
    creationDate = DateTime.fromJSDate(dateObj, { zone: APP_CONSTANTS.APP_DEFAULT_TIMEZONE });
    // Get the current date and time
    const currentDate = DateTime.now();
    // Calculate the time difference in days
    const daysDifference = currentDate.diff(creationDate, 'days').toObject().days as number;

    // If the user profile completion percentage is less than 80%, then an email should be sent to the user
    if (totalCurPerc <= APP_CONSTANTS.PROFILE_COMPLETION_PERCENTAGE.EMP)
    {
      if (
        userType.includes(UserType.EMP) ||
        ((daysDifference >= 3 && daysDifference < 4) ||
          (daysDifference >= 10 && daysDifference < 11) ||
          (daysDifference >= 18 && daysDifference < 19)  ||
          (daysDifference >= 25 && daysDifference < 26))
      ) {
        // Prepare email destination
        const toAddress: EmailSourceDestinationAddress = {
          email: empEmail,
          fullName: empName,
        };

        // Prepare email placeholders for profile completion reminder
        const emailPlaceholders: EmailTemplatePlaceholderEMP_PROFILE_COMPLETION_REMINDER =
        {
          empName: empName,
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
  async sendUserMailToUpgradeSubscription(email: string): Promise<{ expired: boolean, awsMessageId: string | null }> {

    // Get user details using the email
    const userDetails = await UserDetailService.get(email);
    if(!userDetails.count)
    {
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
    expiryDate = DateTime.fromJSDate(dateObj, { zone: APP_CONSTANTS.APP_DEFAULT_TIMEZONE });
    // Get the current date and time
    const currentDate = DateTime.now();

    // Check if current date is after expiry date and subscription type is FREE
    if (currentDate > expiryDate && result[0].name === UserSubscriptionType.FREE) {
      global.logger.info("Free Subscription expired");
      // Prepare email destination
      const toAddress: EmailSourceDestinationAddress = {
        email: email,
        fullName: candName
      };
      // Prepare email placeholders for free subscription upgrade notification
      const emailPlaceholders: EmailTemplatePlaceholderCAND_PREMIUM_UPGRADE_NOTIFICATION = {
        candName: candName,
        candPremiumUpgradeNowMsg: APP_CONSTANTS.FRONTEND_URLS.SUBS_PREMIUM_UPGRADE
      }
      // Send email to remind upgrading subscription
      const sendEmailResponse = await this.sendReminderMailToUpgradeSubscription(emailPlaceholders,toAddress);
  
      // Return expired status and AWS message ID
      return {
        expired: true,
        awsMessageId: sendEmailResponse.awsMessageId
      }

    } else if (currentDate > expiryDate && result[0].name !== UserSubscriptionType.FREE) {
      global.logger.info("Premium Subscription expired");
      // Prepare email destination
      const toAddress: EmailSourceDestinationAddress = {
        email: email,
        fullName: candName
      };
      // Prepare email placeholders for premium subscription renewal notification
      const emailPlaceholders: EmailTemplatePlaceholderCAND_PREMIUM_EXPIRED_NOTIFICATION = {
        candName: candName,
        candRenewNowMsg: APP_CONSTANTS.FRONTEND_URLS.SUBS_PREMIUM_RENEW
      }
      // Send email to remind renewing subscription
      const sendEmailResponse = await this.sendReminderMailToRenewSubscription(emailPlaceholders,toAddress);
  
      // Return expired status and AWS message ID
      return {
        expired: true,
        awsMessageId: sendEmailResponse.awsMessageId
      }

    }
    else {
      global.logger.info("Subscription still holds");

      return {
        expired: false,
        awsMessageId: null
      }
    }
  }

  /**
   * sendCandRemindertoCreateMutlipleProfiles - Function to send a reminder to create multiple profiles
   * 
   * @param {string} email - Email address of the user
   * @returns {Promise<boolean>} - Promise resolving to true if reminder sent, false otherwise
   */
  async sendCandRemindertoCreateMutlipleProfiles(email: string): Promise<boolean> {

    // Get user details using the email
    const userDetails = await UserDetailService.get(email);
    if(!userDetails.count)
    {
        throw new Error("User does not exist");
    }
    // Get user type
    const userType = userDetails[0].userType;
    // Check if user type includes 'CAND' (Candidate)
    const userTypeCand = UserType.CAND;

    if(userType.includes(userTypeCand)) {

      // If user is a candidate, proceed with sending reminder
      const candName = userDetails[0].name;
      // Get user profile data
      const userProfileData = await UserProfilePercentageService.get(email);
      if(!userProfileData.count)
      {
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
      creationDate = DateTime.fromJSDate(dateObj, { zone: APP_CONSTANTS.APP_DEFAULT_TIMEZONE });
      // Get the current date and time
      const currentDate = DateTime.now();
      // Calculate the time difference in days
      const daysDifference = currentDate.diff(creationDate, 'days').toObject().days as number;
      
      // Check if the user profile is created between 3-25 days
      if( (daysDifference >= 3 && daysDifference < 4) 
        || (daysDifference >= 10 && daysDifference < 11) 
        || (daysDifference >= 18 && daysDifference < 19)
        || (daysDifference >= 25 && daysDifference < 26)) {
        // Prepare email destination
        const toAddress: EmailSourceDestinationAddress = {
          email: email,
          fullName: candName
        };
        // Prepare email placeholders for profile switch notification
        const emailPlaceholders: EmailTemplatePlaceholderCAND_PROFILE_SWITCH_NOTIFICATION = {
          candName: candName
        }
        // Send email to remind creating multiple profiles
        const sendEmailResponse = await this.sendCandReminderMailtoCreateMutlipleProfiles(emailPlaceholders,toAddress);
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
  async sendEmpRemindertoCreateMutlipleProfiles(email: string): Promise<boolean> {
    // Get user details using the email
    const userDetails = await UserDetailService.get(email);
    if(!userDetails.count)
    {
      throw new Error("User does not exist");
    }
    // Get user type
    const userType = userDetails[0].userType;
    // Check if user type includes 'EMP' (Employer)
    const userTypeEmp = UserType.EMP;
    if(userType.includes(userTypeEmp)) {
      // If user is an employer, proceed with sending reminder
      const empName = userDetails[0].name;
      const userProfileData = await UserProfilePercentageService.get(email);
      if(!userProfileData.count)
      {
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
      creationDate = DateTime.fromJSDate(dateObj, { zone: APP_CONSTANTS.APP_DEFAULT_TIMEZONE });
      // Get the current date and time
      const currentDate = DateTime.now();
      // Calculate the time difference in days
      const daysDifference = currentDate.diff(creationDate, 'days').toObject().days as number;
      
      // Check if the user profile is created between 3-25 days
      if( (daysDifference >= 3 && daysDifference < 4) 
        || (daysDifference >= 10 && daysDifference < 11) 
        || (daysDifference >= 18 && daysDifference < 19)
        || (daysDifference >= 25 && daysDifference < 26)) {
        // Prepare email destination
        const toAddress: EmailSourceDestinationAddress = {
          email: email,
          fullName: empName
        };
        // Prepare email placeholders for profile switch notification
        const emailPlaceholders: EmailTemplatePlaceholderEMP_SWITCH_PROFILE_NOTIFICATION = {
          empName: empName
        }
        // Send email to remind creating multiple profiles
        const sendEmailResponse = await this.sendEmpReminderMailtoCreateMutlipleProfiles(emailPlaceholders,toAddress);
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
  async updateUserCV(email: string, resume: string) {
    global.logger.info("Update user resume [service]");
    const SK = await userDetailDao.getUserDetailSK(email);
    userDetailDao.updateCv(SK, email, resume);
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
  async updateReferralCount( id : string, candEmail:string, updateBodyObject:UserSubscriptionDetailsUpdateDto):Promise<DbUserDetailDto>{
    return userDetailDao.updateReferralCount(id, candEmail, updateBodyObject);
    ;
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
        emailPlaceholders,
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
        emailPlaceholders,
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
        emailPlaceholders,
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
      emailPlaceholders,
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
      emailPlaceholders,
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
      emailPlaceholders,
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
      emailPlaceholders,
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
      emailPlaceholders,
    );
  }
}

// Export an instance of the UserService class
export default new UserService();
