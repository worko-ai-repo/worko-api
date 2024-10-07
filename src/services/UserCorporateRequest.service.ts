// Import Local Packages
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import DAOs
import userCorporateRequestDao from "../daos/UserCorporateRequest.dao";

// Import DTOs
import {
    UserCorporateRequestCreateDto,
    UserCorporateRequestFilterDto,
    UserCorporateRequestUpdateDto,
} from "../dtos/UserCorporateRequest.dto";

// Import Models
import { DbUserCorporateRequestDto } from "../db/models/UserCorporateRequest.model";
import { EmailSourceDestinationAddress } from "../libraries/email.library";
import { EmailTemplatePlaceholderUSER_CORPORATE_REQUEST_EMAIL_OTP } from "../dtos/EmailTemplatePlaceholder.dto";
import { EmailTemplateEnum } from "../enums/EmailTemplate.enum";
import userOtpService from "./UserOTP.service";
import APP_CONSTANTS from "../configs/constants.config";
import { DbUserOtpDto } from "../db/models/UserOTP.model";

/**
 * UserCorporateRequestService
 *
 * Class responsible for managing user corporate request related operations.
 */
class UserCorporateRequestService {
    /**
     * createCorporateRequest
     *
     * Creates a new corporate request for a user.
     *
     * @param {string} emailAddress - Email of the user for whom the request is being created.
     * @param {UserCorporateRequestCreateDto} userCorporateRequestCreateDto - Corporate request data.
     * @returns {Promise<DbUserCorporateRequestDto>} - A Promise that resolves to the created corporate request object.
     */
    async createCorporateRequest(
        emailAddress: string,
        userCorporateRequestCreateDto: UserCorporateRequestCreateDto
    ): Promise<DbUserCorporateRequestDto> {
        // Log the creation of the corporate request
        global.logger.info("Creating corporate request entry", {
            filePath: __filename,
            methodName: this.createCorporateRequest.name,
            userEmail: emailAddress,
            requestData: userCorporateRequestCreateDto.userEmail,
        });

        // Return the created corporate request details
        return userCorporateRequestDao.createCorporateRequest(
            emailAddress,
            userCorporateRequestCreateDto
        );
    }

    /**
     * getgetCountByEmailCount
     * 
     * Checking whether the form is filled only once or not 
     * 
     * @param email - User email used to fill the form
     */
    async getCountByEmail(email: string) {
        return userCorporateRequestDao.getCountByEmail(email);
    }

    /**
     * updateCorporateRequestById
     *
     * Updates an existing corporate request by its ID.
     *
     * @param {string} userEmail - The email address of the user.
     * @param {string} requestId - The ID of the corporate request to update.
     * @param {UserCorporateRequestUpdateApiDto} updateRequestBody - The updated data for the corporate request.
     * @returns {Promise<DbUserCorporateRequestDto>} - A Promise that resolves to the updated corporate request object.
     */
    async updateCorporateRequestById(
        userEmail: string,
        requestId: string,
        updatedCorporateRequestData: UserCorporateRequestUpdateDto
    ): Promise<DbUserCorporateRequestDto> {

        // Update the corporate request through the DAO
        return userCorporateRequestDao.updateCorporateRequestById(
            userEmail,
            requestId,
            updatedCorporateRequestData
        );
    }

    /**
     * getUserCorporateRequestList
     *
     * Retrieves a list of corporate requests based on filter options.
     *
     * @param {UserCorporateRequestFilterDto} filterOptions - Filter options for retrieving corporate requests.
     * @returns {Promise<QueryResponse<DbUserCorporateRequestDto>>} - A Promise that resolves to the list of corporate requests.
     */
    async getUserCorporateRequestList(
        filterOptions: UserCorporateRequestFilterDto
    ): Promise<QueryResponse<DbUserCorporateRequestDto>> {
        // Call the DAO method to retrieve corporate request list
        return userCorporateRequestDao.getUserCorporateRequestList(filterOptions);
    }

    /**
     * sendOtptoVerifyUserForCorporatePage
     *
     * Sends OTP to verify user for corporate page.
     * This function sends an OTP to the provided email address for verifying user's identity for accessing the corporate page.
     *
     * @param {string} email - The email address where OTP will be sent.
     * @param {string} fullName - Full name of the user.
     * @param {string} userIpAddress - IP address of the user.
     * @returns {Promise<DbUserOtpDto>} - A Promise that resolves to the OTP sent to the user.
     */
    async sendOtptoVerifyUserForCorporatePage(email: string, fullName: string, userIpAddress: string): Promise<DbUserOtpDto>
    {
        // Prepare the placeholders and to address to send the email
        const toAddress: EmailSourceDestinationAddress = 
        {
            email: email,
            fullName: fullName,
        };

        const emailPlaceholders: Partial<EmailTemplatePlaceholderUSER_CORPORATE_REQUEST_EMAIL_OTP> = 
        {
            userFullName: fullName.toTitleCase(),
            logoUrl: APP_CONSTANTS.WORKO_LOGO_URL
        };

        // Send OTP to user's work email to verify the same.
        return userOtpService.sendOtpViaEmail(email,EmailTemplateEnum.USER_CORPORATE_REQUEST_EMAIL_OTP,toAddress,emailPlaceholders,userIpAddress);
    }

    /**
     * verifyUserEmailForCorporatePage
     *
     * Verifies the user's email for accessing the corporate page using OTP.
     * This function verifies the user's email by checking the provided OTP against the database.
     *
     * @param {string} email - The email address of the user.
     * @param {string} otp - The OTP provided by the user.
     * @returns {Promise<boolean>} - A Promise that resolves to true if email verification is successful, otherwise false.
     */
    async verifyUserEmailForCorporatePage(
        email: string,
        otp: string,
    ): Promise<boolean> {
    
        // Verify the OTP provided by the user from the database
        const isOtpVerified = await userOtpService.verifyOtp(
          email,
          email,
          otp
        );
    
        // If OTP is not verified then return false, indicating verification failed
        if (!isOtpVerified){
          return false;
        }
        
        // As the OTP is verified, indicating verification successful
        return true;
    }

    /**
     * getCorporateRequestById
     *
     * Retrieves a corporate request by its ID.
     *
     * @param {string} requestId - The ID of the corporate request to retrieve.
     * @returns {Promise<QueryResponse<DbUserCorporateRequestDto>>} - A Promise that resolves to the corporate request.
     */
    async getCorporateRequestById(
        requestId: string
    ): Promise<QueryResponse<DbUserCorporateRequestDto>> {
        // Call the DAO method to retrieve corporate request by ID
        return userCorporateRequestDao.getCorporateRequestById(requestId);
    }
}

// Export an instance of the UserCorporateRequestService class
export default new UserCorporateRequestService();
