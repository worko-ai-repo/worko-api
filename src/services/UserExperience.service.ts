// Load the local daos
import { QueryResponse, ScanResponse } from "dynamoose/dist/ItemRetriever";
import userExperienceDao from "../daos/UserExperience.dao";
import { DbUserExperienceDto } from "../db/models/UserExperience.model";
import { EmailTemplatePlaceholderUSER_WORK_EMAIL_VERIFICATION_OTP } from "../dtos/EmailTemplatePlaceholder.dto";
import { UserExperienceDTO } from "../dtos/UserExperience.dto";
import { EmailTemplateEnum } from "../enums/EmailTemplate.enum";
import { EmailSourceDestinationAddress } from "../libraries/email.library";
import UserDetailService from "./UserDetail.service";
import userOtpService from "./UserOTP.service";
import { DbUserOtpDto } from "../db/models/UserOTP.model";
import { RecordListingFilterOptions, RecordListingResponseDTO } from "../dtos/Common.dto";

// Load the local dtos

/**
 *  UserExperienceService class responsible for managing user Experience-related operations.
 */
class UserExperienceService {
  /**
   * Retrieves user Experience by email id.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - Experience of the user
   */
  async get(email: string) {
    global.logger.info("Get user experience by id [service]");
    return userExperienceDao.get(email);
  }

  /**
   * getByUserPrimaryEmailAndId
   *
   * Retrieves a user's experience by their primary email and experience ID asynchronously.
   * 
   * @param {string} email - The primary email of the user.
   * @param {string} experienceId - The ID of the experience to retrieve.
   * @returns {Promise<QueryResponse<DbUserExperienceDto>>} A promise that resolves with the query response containing the user's experience data.
   */
  async getByUserPrimaryEmailAndId(
    email: string,
    experienceId: string
  ): Promise<QueryResponse<DbUserExperienceDto>> {
    return userExperienceDao.getByUserPrimaryEmailAndId(email, experienceId);
  }

  /**
   *
   * @param email
   * @param UserExperienceDto
   */
  async create(email: string, userExperienceDto: UserExperienceDTO) {
    global.logger.info("Create employee Work Experience [service]");
    userExperienceDao.create(email, userExperienceDto);
  }

  /**
   * Updates an existing user Experience.
   *
   * @param email - Email of the user
   * @param userExperienceDTO - Data Transfer Object containing updated user Experience details
   * @returns {Promise<any>} - A Promise that resolves when the Experience is successfully updated
   */
  async update(
    email: string,
    SK: string,
    userExperienceDTO: UserExperienceDTO
  ): Promise<any> {
    // Logging the action of updating user Experience in the service layer
    logger.info("Updating user Experience [UserExperienceService]");

    return userExperienceDao.update(email, SK, userExperienceDTO);
  }

  /**
   * verifyWorkEmail
   *
   * Verifies a user's work email asynchronously.
   * 
   * @param {string} email - The work email to verify.
   * @param {string} userId - The ID of the user to verify the work email for.
   * @returns {Promise<DbUserExperienceDto>} A promise that resolves with the user's experience data if the email is verified.
   */




  /**
   * verifyWorkEmail
   *
   * Verifies a user's work email asynchronously.
   *
   * @param {string} primaryEmail - the primary email to verify
   * @param {string} experienceId - the user ID to verify the email for
   * @return {Promise<DbUserExperienceDto>} the verified user experience DTO
   */
  async verifyWorkEmail(
    primaryEmail: string,
    experienceId: string
  ): Promise<DbUserExperienceDto> {
    return userExperienceDao.verifyWorkEmail(primaryEmail, experienceId);
  }
  
  /**
   * sendOtptoVerifyUserWorkEmail
   * 
   * Send OTP to verify user's work email.
   *
   * @param {string} primaryEmail - the user's primary email address
   * @param {string} experienceId - the ID of the user's experience
   * @param {string} userIpAddress - the IP address of the user
   * @return {Promise<DbUserOtpDto>} the DTO containing the user's OTP details
   */
  async sendOtptoVerifyUserWorkEmail(
    primaryEmail: string,
    experienceId: string,
    userIpAddress: string,
  ): Promise<DbUserOtpDto> {
    // Get the user experince details to get the user's work email address
    const userExperience = await this.getByUserPrimaryEmailAndId(primaryEmail, experienceId);
    const userWorkEmail = userExperience[0].emailId;

    // Get the user details to get the user's name
    const userDetails = await UserDetailService.get(primaryEmail);
    const userFullName = userDetails[0].name;

    // Prepare the placeholders and to address to send the email
    const toAddress: EmailSourceDestinationAddress = {
      email: userWorkEmail as string,
      fullName: userFullName,
    };
    const emailPlaceholders: Partial<EmailTemplatePlaceholderUSER_WORK_EMAIL_VERIFICATION_OTP> = {
      userFullName: userFullName,
    };

    // Send OTP to user's work email to verify the same.
    return userOtpService.sendOtpViaEmail(
      primaryEmail,
      EmailTemplateEnum.USER_WORK_EMAIL_VERIFICATION_OTP,
      toAddress,
      emailPlaceholders,
      userIpAddress
    );
  }

  /**
   * verifyOTPforUserWorkEmail
   *
   * To verify work email by matching otp
   *
   * @param {string} primaryEmail - description of parameter
   * @param {string} experienceId - description of parameter
   * @param {string} otp - description of parameter
   * @return {Promise<boolean>} description of return value
   */
  async verifyOtpforUserWorkEmail(
    primaryEmail: string,
    experienceId: string,
    otp: string,
  ): Promise<boolean> {
    // Get user's experience details to get the work email
    const userExperience = await this.getByUserPrimaryEmailAndId(
      primaryEmail,
      experienceId
    );
    const userWorkEmail = userExperience[0].emailId as string;

    // Verify the OTP provided by the user from the database
    const isOtpVerified = await userOtpService.verifyOtp(
      primaryEmail,
      userWorkEmail,
      otp
    );

    // If OTP is not verified then return false, indicating verification failed
    if (!isOtpVerified){
      return false;
    }
    
    // As the OTP is verified, mark the user's work email as verified
    await this.verifyWorkEmail(primaryEmail, experienceId);
    
    // As the OTP is verified, indicating verification successful
    return true;
  }

  // /**
  //  * updateUserExperienceGSIsWithExpId
  //  *
  //  * Updates the GSI1SK and GSI1PK for a user's experience.
  //  *
  //  * @param {string} userEmail - The email of the user
  //  * @param {string} companyId - The companyId of the user's experience
  //  * @param {string} id - The ID of the user's experience
  //  * @returns {Promise<DbUserExperienceDto>} - A promise that resolves when the user's experience is updated
  //  */
  // async updateUserExperienceGSIsWithExpId(userEmail: string, id: string,companyId: string): Promise<DbUserExperienceDto> {
  //   return userExperienceDao.updateUserExperienceGSIsWithExpId(userEmail,id,companyId);
  // } 

  /**
   * getCompanyCurrentEmployeesByCompanyId
   * 
   * Retrieves company's current employees for the provided companyId.
   *
   * @param {string} companyId - The ID of the company to retrieve users for.
   * @return {Promise<QueryResponse<DbUserExperienceDto>>} A promise that resolves to a QueryResponse of DbUserExperienceDto.
   */
  async getCompanyCurrentEmployeesByCompanyId(
    companyId: string,
    options: RecordListingFilterOptions
  ): Promise<QueryResponse<DbUserExperienceDto>> {
    return userExperienceDao.getCompanyCurrentEmployeesByCompanyId(companyId, options);
  }
}

// Export an instance of the UserExperienceService class
export default new UserExperienceService();
