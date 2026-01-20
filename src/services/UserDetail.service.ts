import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import cognito related types
import { AdminGetUserCommandOutput, AdminUpdateUserAttributesCommandOutput, AttributeType } from "@aws-sdk/client-cognito-identity-provider";

// import configs
import APP_CONSTANTS from "../configs/constants.config";
import { awsClientCognitoIdentityProviderLibrary, awsS3ClientLibrary } from "../configs/aws-sdk.config";

// Load the local enums
import { UserType } from "../enums/User.enum";

// Load the local daos
import userDetailDao from "../daos/UserDetail.dao";

// Load the local dtos
import { UserDetailCommonUpdateDto, UserDetailDTO, UserDetailForceChangePasswordVerifyOtpApiDto, UserDetailUpdateApiDto } from "../dtos/UserDetail.dto";
import { EmailTemplatePlaceholderCAND_FORCE_CHANGE_PASSWORD_EMAIL_VERIFICATION_OTP, EmailTemplatePlaceholderCAND_WELCOME_MSG, EmailTemplatePlaceholderEMP_WELCOME_MSG } from "../dtos/EmailTemplatePlaceholder.dto";
import { WhatsAppBusinessPartnerTemplatePlaceholderCAND_SIGNUP_CANDIDATE, WhatsAppBusinessPartnerTemplatePlaceholderEMP_SIGNUP_EMP } from "../dtos/WhatsAppBusinessPartnerTemplatePlaceholder.dto";

// Import enums
import { WhatsAppBusinessPartnerTemplateNameEnum } from "../enums/WhatsAppBusinessPartnerTemplate.enum";
import { EmailTemplateEnum } from "../enums/EmailTemplate.enum";

// Import helpers
import { getEmailFromPK } from "../helpers/user.helper";
import { dateHelperObj } from "../helpers/date.helper";

// Load the local libraies
import { whatsAppBusinessPartnerLibraryObj } from "../libraries/WhatsAppBusinessPartner.library";
import { EmailSourceDestinationAddress } from "../libraries/email.library";

// Load the local models
import { DbUserDetailDto } from "../db/models/UserDetail.model";
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";
import { DbCentralCandidateProfileDto } from "../db/gcp-firestore-models/CentralCandidateProfile.model";

// Load the local services
import UserService from "./User.service";
import userOtpService from "./UserOTP.service";
import { candidateParsedCvServiceObj } from "./CandidateParsedCv.service";
import { centralCandidateProfileServiceObj } from "./CentralCandidateProfile.service";

// Load the local types
import { UserDetailProfileInfoType } from "../types/UserDetail.type";

// Inport local utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

// @todo all methods from everything (Dao, Service, etc) should return the response,
// it will help the caller to know what happed with the action and what is the response.

/**
 *  UserDetailService class responsible for managing user-related operations.
 */
class UserDetailService {
  /**
   * Retrieves user details by email id.
   *
   * @param {string} email - Email of the user
   * @returns {Promise<QueryResponse<DbUserDetailDto>>} - Details of the user
   */
  async get(email: string): Promise<QueryResponse<DbUserDetailDto>> {
    // logger
    global.logger.info("Get user detail by email [service]", {
      filePath: __filename,
      methodName: this.get.name,
      email
    });
    
    // Return the user details
    return userDetailDao.get(email);
  }

  /**
   * getUserDetailsByEmail
   *
   * Retrieves user details by email id and parses the result.
   *
   * @param email - Email of the user
   * @returns {Promise<DbUserDetailDto>} - Details of the user
   * @throws {BaseError} If the user details are not found
   */
  async getUserDetailsByEmail(
    email: string
  ): Promise<DbUserDetailDto> {
    // get candidate details by candidateEmailId and throw error if not found
    const candidateDetails: QueryResponse<DbUserDetailDto> =
      await userDetailDao.get(email);
    if (!candidateDetails.count) {
      throw new BaseError(
        `Candidate details not found with candidate EmailId ${email}. Please check the information and try again.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    return candidateDetails[0];
  }

  async getUserDetailsByPkEmailIds(emailIds: string[]): Promise<DbUserDetailDto[]> {
    // Log the action
    global.logger.info("Get user details by ids [service]",{
      filePath: __filename,
      methodName: this.getUserDetailsByPkEmailIds.name
    });


    // Get user details by email
    const userDetailsArray: Promise<DbUserDetailDto>[] = emailIds.map((emailId: string) => {
      return this.getUserDetailsByEmail(emailId);
    })

    // Return the user details
    return Promise.all(userDetailsArray);
  }

  /**
   * getUserDetailsByEmailIds
   *
   * Retrieves user details by given email id list.
   *
   * @param emailIds - List of email ids of the users
   * @returns {Promise<UserDetailProfileInfoType[]>} - List of user details
   */
  async getUserDetailsByEmailIds(emailIds: string[]): Promise<UserDetailProfileInfoType[]> {
    // Log the action
    global.logger.info("Get user details by ids [service]",{
      filePath: __filename,
      methodName: this.getUserDetailsByEmailIds.name
    });

    // Get user details by email
    const userDetailsArray: Promise<UserDetailProfileInfoType>[] = emailIds.map((emailId: string) => {
      return this.getUserProfileDetailsByEmail(emailId);
    })

    // Return the user details
    return Promise.all(userDetailsArray);
  }

  /**
   * Retrieves user profile details by email id.
   *
   * @param email - Email of the user
   * @returns {Promise<UserDetailProfileInfoType>} - Details of the user including
   *  - userDetails: DbUserDetailDto
   *  - cvAwsS3SignedUrl: string | null - Signed URL to download the CV
   *  - profileImageAwsS3SignedUrl: string | null - Signed URL to view the Profile
   * @throws {BaseError} If the user details are not found
   */
  async getUserProfileDetailsByEmail(email: string): Promise<UserDetailProfileInfoType> {
    global.logger.info("Get user profile details by email [service]");

    // Get user details by email
    const userDetails: DbUserDetailDto = await this.getUserDetailsByEmail(email);

    // Prepare the user id
    let userId: string = userDetails.SK?.split("#").pop() ?? "";
    global.logger.debug(`userId to get user profile details : `,{
      userId
    });

    let cvAwsS3SignedUrl = null;
    let profileImageAwsS3SignedUrl = null;

    // Check if CV is present
    if (userDetails.CV) {
      // Construct the file path in the cloud storage
      const filePath: string = APP_CONSTANTS.AWS_S3_DIR_PATHS.USER_RESUME.strtr({
        "{userId}": userId,
      });

      // Assume that you have a method to generate the object URL
      cvAwsS3SignedUrl = await awsS3ClientLibrary.generateObjectUrl(
        process.env.APP_AWS_S3_BUCKET_WORKO_APP as string,
        filePath + "/" + userDetails.CV
      );

      global.logger.debug(`CV details: `,{
        filePath,
        cvAwsS3SignedUrl,
      });
    }

    // Gnereta e signed url to view the Profile
    if (userDetails.profileImage) {
      // Construct the file path in the cloud storage
      const filePath: string = APP_CONSTANTS.AWS_S3_DIR_PATHS.USER_PROFILE_PIC.strtr({
        "{userId}": userId,
      });

      // Assume that you have a method to generate the object URL
      profileImageAwsS3SignedUrl = await awsS3ClientLibrary.generateObjectUrl(
        process.env.APP_AWS_S3_BUCKET_WORKO_APP as string,
        filePath + "/" + userDetails.profileImage
      );

      global.logger.debug(`profileImage details: `,{
        filePath,
        profileImageAwsS3SignedUrl,
      })
    }

    const userProfileDetails: UserDetailProfileInfoType = {
      userDetails,
      cvAwsS3SignedUrl,
      profileImageAwsS3SignedUrl,
    }; 
    global.logger.debug(`userProfileDetails: `,{
      userProfileDetails
    })

    return userProfileDetails;
  }

  /**
   * Retrieves user details by user id.
   *
   * @param userId - ID of the user
   * @returns {Promise<QueryResponse<DbUserDetailDto>>>} - Details of the user
   */
  async getUserById(userId: string): Promise<QueryResponse<DbUserDetailDto>> {
    console.log("Get user detail by userId [service]");
    return userDetailDao.getUserById(userId);
  }

  /**
   * getUserBasicDetailsByUserId
   *
   * Retrieves basic user details by the user ID.
   *
   * @param {string} userId - The ID of the user.
   * @returns {Promise<QueryResponse<DbUserDetailDto>>} A promise that resolves to the basic user details.
   */
  async getUserBasicDetailsByUserId(userId: string): Promise<QueryResponse<DbUserDetailDto>> {
    global.logger.info("Get user basic details by userId [service]", {
      filePath: __filename,
      methodName: this.getUserBasicDetailsByUserId.name,
      userId
    });
    
    return userDetailDao.getUserBasicDetailsByUserId(userId);
  }

  /**
   * getUserByIds
   *
   * Retrieves user details for a list of user IDs.
   *
   * @param {string[]} userIds - The list of user IDs.
   * @returns {Promise<DbUserDetailDto[]>} - A promise that resolves to an array of user details.
   */
  async getUserByIds(userIds: string[]): Promise<DbUserDetailDto[]> {
    // Log the action
    global.logger.info("Get user details by ids [service]", {
      filePath: __filename,
      methodName: this.getUserByIds.name,
    });

    // return all user details by ids
    return Promise.all(
      userIds.map(async (userId: string): Promise<DbUserDetailDto> => {
        return (await userDetailDao.getUserById(userId))[0];
      })
    ); 
  }

  /**
   * getUserByIdOne
   *
   * Retrieves user details by user id and parses the result.
   *
   * @param userId - ID of the user
   * @throws {BaseError} If the user details are not found
   * @returns {Promise<DbUserDetailDto>} - Details of the user
   */
  async getUserByIdOne(userId: string): Promise<DbUserDetailDto> {
    global.logger.info(`Get user detail by userId with parsing [service]`,{
      filePath: __filename,
      methodName: this.getUserByIdOne.name,
      userId
    });

    // Get the user details by userId and throw error if not found
    const userDetail: QueryResponse<DbUserDetailDto> =
      await userDetailDao.getUserById(userId);
    if (!userDetail.count) {
      throw new BaseError(
        `User Details Not Found`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    // Return the parsed user details
    return userDetail[0];
  }

  /**
   * Updates an existing user Detail.
   *
   * @param email - Email of the user
   * @param userDetailDTO - Data Transfer Object containing updated user Detail details
   * @returns {Promise<any>} - A Promise that resolves when the Detail is successfully updated
   */
  async update(
    email: string,
    SK: string,
    userDetailDTO: Partial<UserDetailDTO>
  ): Promise<any> {
    // Logging the action of updating user Detail in the service layer
    logger.info("Updating user Detail [UserDetailService]");

    const result: DbUserDetailDto = await userDetailDao.update(email, SK, userDetailDTO);
    /**
     * @description 
     *  1. Update user preference data in "CentralCandidateProfile.model.ts" if exists
     */
    const centralCandidateProfile: DbCentralCandidateProfileDto | undefined = await centralCandidateProfileServiceObj.getCentralCandidateProfileById(email);
    if (centralCandidateProfile) {
      const { 
        YOE,
        CTC,
        multipleCandidateExperience,
        noticePeriod,
        location,
        isNoticePeriodNegotiable,
      } = result;
      const updateCandParsedData: Partial<DbCandidateParsedCvDto> = {
        updatedAt: dateHelperObj.getISODate(),
      };

      if(noticePeriod) {
        updateCandParsedData.noticePeriod = noticePeriod;
      }
      if(isNoticePeriodNegotiable) {
        updateCandParsedData.isNoticePeriodNegotiable = isNoticePeriodNegotiable;
      }

      if(YOE) {
        updateCandParsedData.totalYOE = YOE;
        updateCandParsedData.relevantYOE = YOE;
      }
      if(CTC) {
        updateCandParsedData.currentCTC = CTC;
        updateCandParsedData.expectedCTC = CTC;
      }
      if(multipleCandidateExperience) {
        updateCandParsedData.multipleCandidateExperience = multipleCandidateExperience;
      }
      if(location) {
        updateCandParsedData.location = location;
      }

      let updateCandidateParsedCvData: DbCandidateParsedCvDto | undefined;

      // If any of the above fields are updated, update the candidate parsed cv data with embedding else update the candidate parsed cv data
      if(
        noticePeriod ||
        isNoticePeriodNegotiable ||
        YOE ||
        CTC ||
        multipleCandidateExperience ||
        location
      ) {
        updateCandidateParsedCvData = await candidateParsedCvServiceObj.updateCandidateParsedCvWithEmbedding(
          centralCandidateProfile.latestCandidateParsedCvId,
          updateCandParsedData
        );
      } 
    }
    return result;
  }

  async updateUserDetail(email:string, id: string, updateData: Partial<UserDetailCommonUpdateDto>): Promise<DbUserDetailDto> {
    global.logger.info("Update user Detail [UserDetailService]", {
      email,
    });
    return userDetailDao.updateUserDetail(email, id, updateData);
  }

  async updateUserDetailByEmail(email: string, userDetailDTO: UserDetailUpdateApiDto): Promise<DbUserDetailDto> {
    global.logger.info("Update user Detail [UserDetailService]", {
      email,
    });

    const cognitoUserId: string = global.requestLocalContext.userId;
    const cognitoUserGroups: string[] = global.requestLocalContext.cognitoUserGroups;

    const existingUserDetail: QueryResponse<DbUserDetailDto> = await this.get(email);
    if (!existingUserDetail.count) {
      throw new BaseError(
        `The user details not found for the provided email "${email}" address.`, 
        HttpStatusCode.NOT_FOUND_404
      );
    }
    const existingUserDetailData: DbUserDetailDto = existingUserDetail[0];
    const pkEmail: string = getEmailFromPK(existingUserDetailData.PK);

    if(existingUserDetailData.id !== cognitoUserId) {
      // Check whether the cognito user is admin or not
      if(!cognitoUserGroups.includes(APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.ADMIN)) {
        throw new BaseError("Unauthorized", HttpStatusCode.UNAUTHORIZED_401);
      }
    }

    if(userDetailDTO.isNumberVerified !== undefined) {
      if(existingUserDetailData.isNumberVerified === userDetailDTO.isNumberVerified) {
        throw new BaseError("Is Number verified is already updated.", HttpStatusCode.BAD_REQUEST_400);
      }
    }

    if(userDetailDTO.isEmailVerified !== undefined && userDetailDTO.isAlreadyVerifiedInCognito !== true) {
      if(existingUserDetailData.isEmailVerified === userDetailDTO.isEmailVerified) {
        throw new BaseError("Is Email verified is already updated.", HttpStatusCode.BAD_REQUEST_400);
      }

      const userPoolId: string | undefined = process.env.APP_AWS_COGNITO_USER_POOL_ID;

      if(!userPoolId) {
        throw new BaseError(
          "User Pool ID is not found",
          HttpStatusCode.INTERNAL_SERVER_ERROR_500
        );
      }

      const updateCognitoUserVerification = [
        // Confirm the user to the corporate group
        awsClientCognitoIdentityProviderLibrary.confirmCognitoUserSignup(
          userPoolId,
          pkEmail,
        ),

        // Verify the user
        awsClientCognitoIdentityProviderLibrary.verifyCognitoUser(
          userPoolId,
          pkEmail,
        ),
      ];

      await Promise.all(updateCognitoUserVerification);
    }

    const {isAlreadyVerifiedInCognito, ...restUserDetailDTO} = userDetailDTO;

    const updateData: Partial<UserDetailCommonUpdateDto> = {
      ...restUserDetailDTO,
    }

    return this.updateUserDetail(email, existingUserDetailData.id, updateData);
  }

  /**
   * sendWelcomeEmailAndWhatsappNotificationToUser
   *
   * Retrieves user details and sends a welcome email and whatsapp message based on the user type.
   *
   * @param userEmail - Email of the user
   * @returns {Promise<boolean>} - True if email was sent successfully, false otherwise
   */
  async sendWelcomeEmailAndWhatsappNotificationToUser(userEmail: string): Promise<boolean> {
    global.logger.info(
      `Send email and whatsapp message to user [UserDetailService]`,
      {
        filePath: __filename,
        methodName: this.sendWelcomeEmailAndWhatsappNotificationToUser.name,
        userEmail,
      }
    );

    // Retrieve the userSignupDetails by userEmail provided in message
    const userSignupDetails: QueryResponse<DbUserDetailDto> = await this.get(
      userEmail
    );

    // If no user found throw error
    if (!userSignupDetails.count) {
      throw new BaseError(
        `The user details not found for the provided email "${userEmail}" address.`
      );
    }

    // Retrieve userDetails from userSignUpdetails
    const userDetails: DbUserDetailDto = userSignupDetails[0];
    const userType: string = userDetails.userType[0];
    const name: string = userDetails.name;
    const email: string = userDetails.emailList.primary;
    const userPhoneNumber: string = userDetails.number;

    // Create email source and destination address
    const toAddress: EmailSourceDestinationAddress = {
      email: email,
      fullName: name,
    };

    // Check if the user type is invalid
    if (![UserType.CAND as string, UserType.EMP as string].includes(userType)) {
      throw new BaseError(
        `Unable to identify the user type for the provided email "${userEmail}" address.`
      );
    }

    // Check if the user type is cand then send candidate email
    if (userType === UserType.CAND) {
      // Placeholders for the email
      const emailPlaceholders: EmailTemplatePlaceholderCAND_WELCOME_MSG = {
        candName: name.toTitleCase(),
        workoAppUrl: APP_CONSTANTS.FRONTEND_URLS.WORKO_APP_URL,
        ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
      };

      // Placeholders for the whatsapp message
      const whatsAppBusinessPartnerPlaceholders: WhatsAppBusinessPartnerTemplatePlaceholderCAND_SIGNUP_CANDIDATE =
        {
          candidateName: name.toTitleCase(),
          pointOne: "• Personalized job matches based on your skills",
          pointTwo: "• Access to our referral network of industry insiders",
          pointThree: "• Career guidance from successful professionals",
        };

      // Promise to send welcome email and whatsapp message
      await Promise.all([
        // Send a welcome email to the candidate
        UserService.sendEmailToCandWelcomeMessage(emailPlaceholders, toAddress),

        // sending a whatsapp message to the candidate using the "WHATSAPP BUSINESS PARTNER API INTEGRATION"
        whatsAppBusinessPartnerLibraryObj.sendWhatsAppBusinessPartnerWhatsappMessage(
          WhatsAppBusinessPartnerTemplateNameEnum.CAND_SIGNUP_CANDIDATE,
          userPhoneNumber.strtr({ "+": "" }), // To Phone Number
          whatsAppBusinessPartnerPlaceholders,
          email
        ),
      ]);
    }
    // Check if the user type is EMP then send employee email
    else if (userType === UserType.EMP) {
      // Placeholders for the email
      const emailPlaceholders: EmailTemplatePlaceholderEMP_WELCOME_MSG = {
        empName: name.toTitleCase(),
        workoAppUrl: APP_CONSTANTS.FRONTEND_URLS.WORKO_APP_URL,
        ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
      };

      // Placeholders for the whatsapp message
      const whatsAppBusinessPartnerPlaceholders: WhatsAppBusinessPartnerTemplatePlaceholderEMP_SIGNUP_EMP =
        {
          employeeName: name.toTitleCase(),
        };

      // Promise to send welcome email and whatsapp message
      await Promise.all([
        // Send a welcome email to the employer
        UserService.sendEmailToEmpWelcomeMessage(emailPlaceholders, toAddress),

        // sending a whatsapp message to the candidate using the "WHATSAPP BUSINESS PARTNER API INTEGRATION"
        whatsAppBusinessPartnerLibraryObj.sendWhatsAppBusinessPartnerWhatsappMessage(
          WhatsAppBusinessPartnerTemplateNameEnum.EMP_SIGNUP_EMP,
          userPhoneNumber.strtr({ "+": "" }), // To Phone Number
          whatsAppBusinessPartnerPlaceholders,
          email
        ),
      ]);
    }

    return true;
  }

  /**
   * Retrieves user details and sends a welcome email based on the user type.
   *
   * @param userEmail - Email of the user
   * @returns {Promise<boolean>} - True if email was sent successfully, false otherwise
   */
  async sendWelcomeEmail(userEmail: string): Promise<boolean> {
    logger.info(
      `Attempting to send welcome email for user: ${userEmail} [UserDetailService]`
    );

    // Retrieve the userSignupDetails by userEmail provided in message
    const userSignupDetails = await this.get(userEmail);

    // If no user found, log and return false
    if (!userSignupDetails.count) {
      throw new BaseError(
        `The user details not found for the provided email "${userEmail}" address.`
      );
    }

    // Retrieve userDetails and userTypes from userSignUpdetails
    const userDetails = userSignupDetails[0];
    const userType = userDetails.userType[0];
    const name: string = userDetails.name;
    const email: string = userDetails.emailList.primary;
    const toAddress: EmailSourceDestinationAddress = {
      email: email,
      fullName: name,
    };

    // Check if the user type is invalid
    if (![UserType.CAND as string, UserType.EMP as string].includes(userType)) {
      throw new BaseError(
        `Unable to identify the user type for the provided email "${userEmail}" address.`
      );
    }

    // Check if the user type is cand then send candidate email
    if (userType === UserType.CAND) {
      const emailPlaceholders: EmailTemplatePlaceholderCAND_WELCOME_MSG = {
        candName: name.toTitleCase(),
        workoAppUrl: APP_CONSTANTS.FRONTEND_URLS.WORKO_APP_URL,
        ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL
      };

      // Send a welcome email to the candidate
      await UserService.sendEmailToCandWelcomeMessage(
        emailPlaceholders,
        toAddress
      );
    }
    // Check if the user type is EMP then send employee email
    else if (userType === UserType.EMP) {
      const emailPlaceholders: EmailTemplatePlaceholderEMP_WELCOME_MSG = {
        empName: name.toTitleCase(),
        workoAppUrl: APP_CONSTANTS.FRONTEND_URLS.WORKO_APP_URL,
        ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
      };

      // Send a welcome email to the employer
      await UserService.sendEmailToEmpWelcomeMessage(
        emailPlaceholders,
        toAddress
      );
    }

    return true;
  }

  /**
   * updateLastAccessedDash
   *
   * Updates the last accessed dashboard for a user
   *
   * @param email - Email of the user
   * @param userlastAccessedDash - User's Last Accessed Dashboard
   */
  async updateLastAccessedDash(email: string, userLastAccessedDash: string) {
    // Fetch the User Details .
    let userDetails = await this.get(email);

    // Throw BaseError if user not present
    if (!userDetails.count) {
      throw new BaseError(
        `The user details not found for the provided email "${email}" address.`
      );
    }

    // Prepare the details required to be updated for the user
    let userModifiedDetails: Partial<UserDetailDTO> = {
      lastAccessedDash: userLastAccessedDash,
    };

    // Check if userType exists or does not exist
    const updatedUserType = userDetails[0].userType || [];

    // If the userType is not present then add it.
    if (!updatedUserType.includes(userLastAccessedDash)) {
      // Push the user type as it is not present
      updatedUserType.push(userLastAccessedDash);

      // Update the user type
      userModifiedDetails.userType = updatedUserType;
    }

    // Update the user details
    return this.update(email, userDetails[0].SK, userModifiedDetails);
  }

  async sendSmsOtptoVerifyUserPhoneNumber(email: string, userIpAddress: string) {
    global.logger.info(`Send SMS to verify user phone number [service]`, {
      methodName: this.sendSmsOtptoVerifyUserPhoneNumber.name,
      email
    });

    const userDetail: DbUserDetailDto = await this.getUserDetailsByEmail(email);

    const cognitoUserId: string = global.requestLocalContext.userId;

    if(cognitoUserId !== userDetail.id) {
      throw new BaseError("Unauthorized", HttpStatusCode.UNAUTHORIZED_401);
    }

    const userPhoneNumber: string = userDetail.number;

    return userOtpService.sendOtpToPhoneNumberViaSms(
      email,
      userPhoneNumber,
      userIpAddress,
      APP_CONSTANTS.SMS_MESSAGE_CONTENT.USER_PHONE_NUMBER_VERIFY.MESSAGE,
      APP_CONSTANTS.SMS_MESSAGE_CONTENT.USER_PHONE_NUMBER_VERIFY.SENDER,
    );
  }

  async verifyUserPhoneNumber(email: string, otp: string) {
    global.logger.info(`Verify user phone number [service]`, {
      methodName: this.verifyUserPhoneNumber.name,
      email,
      otp,
    });

    const userDetail: DbUserDetailDto = await this.getUserDetailsByEmail(email);

    const cognitoUserId: string = global.requestLocalContext.userId;

    if(cognitoUserId !== userDetail.id) {
      throw new BaseError("Unauthorized", HttpStatusCode.UNAUTHORIZED_401);
    }

    // Verify the OTP provided by the user from the database
    const isOtpVerified: boolean = await userOtpService.verifyOtp(email, userDetail.number, otp);

    // If OTP is not verified then return false, indicating verification failed
    if (!isOtpVerified) {
      return false;
    }

    // As the OTP is verified, mark the user's phone number as verified
    const updatedUserDetails = await this.update(
      email,
      userDetail.SK,
      {
        isNumberVerified: isOtpVerified
      }
    )

    // As the OTP is verified, indicating verification successful
    return updatedUserDetails.isNumberVerified;
  }

  async sendOtpForceChangePasswordViaEmail(
    candidateRegisteredEmail: string,
    userIpAddress: string
  ) {
    global.logger.info(`Send OTP to force change password via email [service]`, {
      methodName: this.sendOtpForceChangePasswordViaEmail.name,
      candidateRegisteredEmail
    });

    const userDetails: QueryResponse<DbUserDetailDto> = await this.get(candidateRegisteredEmail);
    if(!userDetails.count) {
      throw new BaseError(`The user details not found for the provided email "${candidateRegisteredEmail}" address.`, HttpStatusCode.NOT_FOUND_404);
    }
    const userDetailData: DbUserDetailDto = userDetails[0];

    const {
      isEmailVerified,
      name: candidateName,
    }= userDetailData;
    if(isEmailVerified) {
      global.logger.error(`The user email is already verified [service]`, {
        methodName: this.sendOtpForceChangePasswordViaEmail.name,
        candidateRegisteredEmail,
        userDetailData
      })
      throw new BaseError("Your email is already verified.", HttpStatusCode.CONFLICT_409);
    }

    // Prepare the placeholders and to address to send the email
    const toAddress: EmailSourceDestinationAddress = {
      email: candidateRegisteredEmail,
      fullName: candidateName.toTitleCase(),
    };
    const emailPlaceholders: EmailTemplatePlaceholderCAND_FORCE_CHANGE_PASSWORD_EMAIL_VERIFICATION_OTP = {
      candidateName: candidateName.toTitleCase(),

      /**
       * @note As of now this is empty but in reused method it will be set.
       */
      otp: "",
      ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
    };

    // Send OTP to user's work email to verify the same.
    return userOtpService.sendOtpViaEmail(
      candidateRegisteredEmail,
      EmailTemplateEnum.CAND_FORCE_CHANGE_PASSWORD_EMAIL_VERIFICATION_OTP,
      toAddress,
      emailPlaceholders,
      userIpAddress
    );
  }

  async verifyOtpForceChangePasswordViaEmail(reqBody: UserDetailForceChangePasswordVerifyOtpApiDto) {
    global.logger.info(`Verify OTP to force change password via email [service]`, {
      methodName: this.sendOtpForceChangePasswordViaEmail.name,
      candidateRegisteredEmail: reqBody.candidateRegisteredEmail
    });

    const workoUserPoolId: string | undefined = process.env.APP_AWS_COGNITO_USER_POOL_ID;
    if(!workoUserPoolId) {
      global.logger.error(`Failed to verify cand email, Worko User Pool Id not found`, { 
        methodName: this.verifyOtpForceChangePasswordViaEmail.name, 
        workoUserPoolId 
      });
      throw new BaseError("Failed to verify your email.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    const {
      candidateRegisteredEmail,
      otp
    } = reqBody;

    const userDetails: QueryResponse<DbUserDetailDto> = await this.get(candidateRegisteredEmail);
    if(!userDetails.count) {
      throw new BaseError(`Your details not found for the provided email "${candidateRegisteredEmail}" address.`, HttpStatusCode.NOT_FOUND_404);
    }
    const userDetailData: DbUserDetailDto = userDetails[0];

    const {
      isEmailVerified,
    }= userDetailData;
    if(isEmailVerified) {
      global.logger.error(`The user email is already verified [service]`, {
        methodName: this.sendOtpForceChangePasswordViaEmail.name,
        candidateRegisteredEmail,
        userDetailData
      })
      throw new BaseError("Your email is already verified.", HttpStatusCode.CONFLICT_409);
    }

    const candCognitoDetails: AdminGetUserCommandOutput = await awsClientCognitoIdentityProviderLibrary.getUserDetails(
      workoUserPoolId,
      userDetailData.id
    );
    if(!candCognitoDetails) {
      global.logger.error(`Failed to verify cand email, Cognito user details not found`, {
        methodName: this.verifyOtpForceChangePasswordViaEmail.name,
        candidateRegisteredEmail,
        candCognitoDetails
      });
      throw new BaseError(`Your details not found for the provided email "${candidateRegisteredEmail}" address.`, HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    const isCandidateCognitoUserEmailVerified: boolean =
      candCognitoDetails?.UserAttributes?.find(
        (attr: AttributeType) => attr.Name === "email_verified"
      )?.Value === "true";
    if(isCandidateCognitoUserEmailVerified) {
      global.logger.error(`The user email is already verified in cognito [service]`, {
        methodName: this.sendOtpForceChangePasswordViaEmail.name,
        candidateRegisteredEmail,
        candCognitoDetails
      });

      throw new BaseError("Your email is already verified.", HttpStatusCode.CONFLICT_409);
    }

    // Verify the OTP provided by the user from the database
    const isOtpVerified: boolean = await userOtpService.verifyOtp(candidateRegisteredEmail, candidateRegisteredEmail, otp);

    // If OTP is not verified then return false, indicating verification failed
    if (!isOtpVerified) {
      return false;
    }

    // As the OTP is verified, mark the user's email as verified
    const updatedUserDetails: DbUserDetailDto = await this.updateUserDetail(
      candidateRegisteredEmail,
      userDetailData.id,
      {
        isEmailVerified: isOtpVerified
      }
    );

    if(!updatedUserDetails.isEmailVerified) {
      global.logger.error(`The isEmailVerified is not updated in aws dynamodb. [service]`, {
        methodName: this.sendOtpForceChangePasswordViaEmail.name,
        candidateRegisteredEmail,
        updatedUserDetails
      })
      throw new BaseError("Failed to verify your email.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    // Update email as verified in cognito
    const updatedCognitoUserDetails: AdminUpdateUserAttributesCommandOutput = await awsClientCognitoIdentityProviderLibrary.verifyCognitoUser(workoUserPoolId, userDetailData.id);
    global.logger.info(`The user email is verified in cognito [service]`, {
      methodName: this.sendOtpForceChangePasswordViaEmail.name,
      candidateRegisteredEmail,
      updatedCognitoUserDetails
    });

    return true;
  }
}

// Export an instance of the UserService class
export default new UserDetailService();
