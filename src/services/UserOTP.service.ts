// Import DAOs and models
import { QueryResponse } from "dynamoose/dist/ItemRetriever";
import userOtpDao from "../daos/UserOTP.dao";
import { DbUserOtpDto } from "../db/models/UserOTP.model";

// Import constants
import APP_CONSTANTS from "../configs/constants.config";

// Import DTOs
import { UserOtpCreateDto } from "../dtos/UserOTP.dto";

// Import constants configs
import { awsClientSnsLibrary } from "../configs/aws-sdk.config";

// Import necessary library modules
import { EmailSourceDestinationAddress, emailLibrary } from "../libraries/email.library";

// Import helpers
import { OtpHelper } from "../helpers/otp.helper";

// Import Enums
import { UserOtpSentViaEnum, UserOtpStatusEnum } from "../enums/User.enum";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 * UserOTPService
 * 
 * Class to perform OTP related services
*/
class UserOtpService {
  /**
   * createOTP
   *
   * Creates a new OTP (One-Time Password) object for the given user's primary email address.
   *
   * @param {string} primaryEmail - The primary email address of the user for whom OTP is being created.
   * @param {UserOtpCreateApiDto} otpObjDetails - Details of the OTP object to be created.
   * @returns {Promise<DbUserOtpDto>} - A Promise that resolves with the created OTP object.
   */
  async createOtp(
    primaryEmail: string,
    otpObjDetails: UserOtpCreateDto
  ): Promise<DbUserOtpDto> {
    return userOtpDao.createOtp(primaryEmail, otpObjDetails);
  }

  /**
   * getByUserPrimaryEmailAndSentTo
   * 
   * Retrieves a user OTP record by their primary email and sent to email, with an optional status filter.
   *
   * @param {string} primaryEmail - The primary email of the user
   * @param {string} sentTo - The email where the OTP was sent
   * @param {UserOtpStatusEnum} [status] - Optional status filter for the OTP
   * @return {Promise<QueryResponse<DbUserOtpDto>>} The user OTP record matching the criteria
   */
  async getByUserPrimaryEmailAndSentTo(
    primaryEmail: string,
    sentTo: string,
    status?: UserOtpStatusEnum,
  ): Promise<QueryResponse<DbUserOtpDto>> {
    return userOtpDao.getByUserPrimaryEmailAndSentTo(primaryEmail, sentTo, status);
  }

  async sendOtpToPhoneNumberViaSms(
    userPrimaryEmail: string,
    userPhoneNumber: string,
    userIpAddress: string,
    messageWithOtpPlaceholder: string,
    sender: string,
  ) {
    global.logger.info(`Send SMS to verify user phone number [service]`, {
      methodName: this.sendOtpToPhoneNumberViaSms.name,
      userPhoneNumber,
      userIpAddress,
    });

    // Generate OTP
    const otp: string = OtpHelper.generateOtp(6).toString();

    const smsResponse: {
      messageId: string | undefined;
    } = await awsClientSnsLibrary.sendSms({
      MessageAttributes: {
        "AWS.SNS.SMS.SenderID": {
          DataType: "String", // Amazon SNS supports the following logical data types: String, String.Array, Number, and Binary
          StringValue: sender,
        },
      },
      PhoneNumber: userPhoneNumber,
      Message: messageWithOtpPlaceholder.strtr({
        "{otp}": otp,
      }),
    });

    if(!smsResponse.messageId) {
      throw new BaseError("Failed to send SMS", HttpStatusCode.BAD_REQUEST_400);
    }

    // Create OTP object details
    const otpObjDetails: UserOtpCreateDto = {
      logId: smsResponse.messageId,
      otp: otp,
      userIpAddress: userIpAddress,
      sentTo: userPhoneNumber,
      sentVia: UserOtpSentViaEnum.SMS,
    };

    // Create OTP object in the database
    return this.createOtp(userPrimaryEmail, otpObjDetails);
  }

  /**
   * sendOtpViaEmail
   *
   * Sends a One-Time Password (OTP) to the user's work email address for verification.
   *
   * @param {string} userPrimaryEmail - The primary email of the user
   * @param {string} emailTemplateName - The name of the email template to be used
   * @param {EmailSourceDestinationAddress} toAddress - The destination email address
   * @param {{ [key: string]: any }} emailPlaceholders - The placeholders for the email template
   * @param {string} userIpAddress - The IP address of the user
   * @return {Promise<DbUserOtpDto>} The created UserOtp object in the database
   */
  async sendOtpViaEmail(
    userPrimaryEmail: string,
    emailTemplateName: string,
    toAddress: EmailSourceDestinationAddress,
    emailPlaceholders: { [key: string]: any },
    userIpAddress: string
  ): Promise<DbUserOtpDto> {
    // Generate OTP
    const otp: string = OtpHelper.generateOtp(APP_CONSTANTS.OTP_LENGTH);

    // Update the placeholders with the generated OTP,
    // so that it replaces the otp placeholder with real OTP in the email template
    emailPlaceholders.otp = otp;

    // Send email with OTP to candidate
    const emailResponse = await emailLibrary.sendEmail(
      emailTemplateName,
      toAddress,
      emailPlaceholders
    );

    // Extract system log ID from email response
    const logId = emailResponse.systemLogId as string;

    // Create OTP object details
    const otpObjDetails: UserOtpCreateDto = {
      logId: logId,
      otp: otp,
      userIpAddress: userIpAddress,
      sentTo: toAddress.email,
      sentVia: UserOtpSentViaEnum.EMAIL,
    };

    // Create OTP object in the database
    return this.createOtp(userPrimaryEmail, otpObjDetails);
  }

  /**
   * verifyOTPforUserWorkEmail
   *
   * Verifies the One-Time Password (OTP) provided by the user for their work email address.
   *
   * @param {string} primaryEmail - The primary email of the user
   * @param {string} sentTo - The destination where OTP was sent
   * @param {string} userProvidedOtp - The OTP provided by the user for verification
   * @return {Promise<boolean>} Returns true if OTP verification is successful, false otherwise
   */

  async verifyOtp(
    primaryEmail: string,
    sentTo: string,
    userProvidedOtp: string,
  ): Promise<boolean> {
    // Get the ACTIVE OTP entries for provided "primaryEmail" and "sentTo"
    const userOtps: QueryResponse<DbUserOtpDto> = await this.getByUserPrimaryEmailAndSentTo(primaryEmail, sentTo, UserOtpStatusEnum.ACTIVE);
    if (!userOtps.count) {
      return false;
    }

    // Loop through all retrived OTP entries to check if it is matching with the user provided OTP
    const matchedOtp: DbUserOtpDto | undefined = userOtps.find((userOtp: DbUserOtpDto) => userOtp.otp == userProvidedOtp);

    // Check if the matched OTP is found, if not return false, indicating verification failed.
    if (!matchedOtp) {
      return false;
    }

    // If OTP is found then update its STATUS to "USED", indicating it used, and not available for further usage.
    await userOtpDao.updateUserOtpStatusToUsed(primaryEmail, sentTo, matchedOtp.id);

    // Return true, indicating verification successful.
    return true;
  }
}

const userOtpService = new UserOtpService()
export default userOtpService;