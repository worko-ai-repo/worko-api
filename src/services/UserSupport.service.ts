// Import Local Packages
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import DAOs
import userSupportDao from "../daos/UserSupport.dao";

// Import DTOs
import { UserSupportCreateDto, UserSupportFilterDto, UserSupportUpdateApiDto, UserSupportUpdateDto } from "../dtos/UserSupport.dto";

// Import Models 
import { DbUserSupportDto } from "../db/models/UserSupport.model";
import { UserSupportStatusEnum } from "../enums/User.enum";
import UserReferralService from "./UserReferral.service";
import UserDetailService from "./UserDetail.service";
import { EmailTemplatePlaceholderEMP_QUERY_FOR_REFERRAL_BY_CAND } from "../dtos/EmailTemplatePlaceholder.dto";
import { EmailSourceDestinationAddress, emailLibrary } from "../libraries/email.library";
import { EmailTemplateEnum } from "../enums/EmailTemplate.enum";

/**
 * UserSupportService
 * 
 * Class responsible for managing user support related operations.
 */
class UserSupportService {
    /**
     * createSupport
     * 
     * Creates a new support request for a user.
     *
     * @param {string} emailAddress - Email of the user for whom the support is being created.
     * @param {UserSupportCreateDto} userSupportCreateDto - Support request data.
     * @returns {Promise<DbUserSupportDto>} - A Promise that resolves to the created support request object.
     */
    async createSupport(emailAddress: string, userSupportCreateDto: UserSupportCreateDto): Promise<DbUserSupportDto> {
        // Log the creation of the support request
        global.logger.info("Creating support request entry", {
            filePath: __filename,
            methodName: this.createSupport.name,
            userEmail: emailAddress,
            supportData: userSupportCreateDto.userEmail,
        });

        // Return the created support request details
        return userSupportDao.createSupport(emailAddress, userSupportCreateDto);
    }

    /**
     * updateSupportById
     * 
     * Updates an existing support request by its ID.
     *
     * @param {string} userEmail - The email address of the user.
     * @param {string} supportId - The ID of the support request to update.
     * @param {UserSupportUpdateApiDto} updateRequestBody - The updated data for the support request.
     * @returns {Promise<DbUserSupportDto>} - A Promise that resolves to the updated support request object.
     */
    async updateSupportById(userEmail: string, supportId: string, updateRequestBody: UserSupportUpdateApiDto): Promise<DbUserSupportDto> {
        // Determine if the status is RESOLVED
        const isResolved = updateRequestBody.status === UserSupportStatusEnum.RESOLVED;

        // Prepare the update data
        let updateData: UserSupportUpdateDto = {
            ...updateRequestBody,
            updatedByUserId: updateRequestBody.actionByUserId,
        };

        // Update resolvedByUserId and resolvedAt if status is RESOLVED
        if (isResolved) {
            updateData.resolvedByUserId = updateRequestBody.assignedToUserId;
            updateData.resolvedAt = new Date();
        }

        // Update the support request through the DAO
        return userSupportDao.updateSupportById(userEmail, supportId, updateData);
    }

    /**
    * getSupportList
    * 
    * Retrieves a list of support requests based on filter options.
    *
    * @param {UserSupportFilterDto} filterOptions - Filter options for retrieving support requests.
    * @returns {Promise<QueryResponse<DbUserSupportDto>>} - A Promise that resolves to the list of support requests.
    */
    async getUserSupportList(filterOptions: UserSupportFilterDto): Promise<QueryResponse<DbUserSupportDto>> {
        // Call the DAO method to retrieve support list
        return userSupportDao.getUserSupportList(filterOptions);
    }

    /**
     * sendEmailToEmpAboutCandReferralQuery - Function to send an email notification to an employee about a candidate query
     * 
     * @param {string} referralId - Referral ID
     * @param {string} query - Query from the candidate
     * @returns {Promise<boolean>} - Promise resolving to true if email sent successfully, otherwise false
     */
    async sendEmailToEmpAboutCandReferralQuery(referralId: string, query: string): Promise<boolean> {

        // Get referral data using referralId
        const referralData = await UserReferralService.getByGSI1(referralId);
        if(!referralData) {
            throw new Error("No valid referral exists for employee to process this query.");
        }
        const empId = referralData[0].doneByUserId;

        // Extract the Employee Details from the employee ID 
        // const employeeId = empId.split("ID#")[1]; 
        const empDetails = await UserDetailService.getUserById(empId)
        const refereeName = empDetails[0].name;
        const refereeEmail = empDetails[0].emailList.primary;

        // Prepare email destination
        const toAddress: EmailSourceDestinationAddress = {
            email: refereeEmail,
            fullName: refereeName
        };

        // Prepare email placeholders for the referral query notification
        const emailPlaceholders: EmailTemplatePlaceholderEMP_QUERY_FOR_REFERRAL_BY_CAND = {
            empName: refereeName,
            query: query
        }

        // Send email to notify the employee about the candidate query
        const sendEmailResponse = await this.sendEmailForCandReferralQueryToEmp(emailPlaceholders,toAddress);

        return true;
    }

    /**
     * sendEmailForCandReferralQueryToEmp - Function to send an email notification to an employee about a candidate query
     * 
     * @param {EmailTemplatePlaceholderEMP_QUERY_FOR_REFERRAL_BY_CAND} emailPlaceholders - Placeholders for email content
     * @param {EmailSourceDestinationAddress} toAddress - Email address and full name of the recipient
     * @returns {Promise<{ awsMessageId: string | null }>} - Promise resolving to AWS message ID or null
     */
    async sendEmailForCandReferralQueryToEmp(
        emailPlaceholders: EmailTemplatePlaceholderEMP_QUERY_FOR_REFERRAL_BY_CAND,
        toAddress: EmailSourceDestinationAddress
      ): Promise<{ awsMessageId: string | null }> {
        // Send email using the email library with the specified template, recipient, and placeholders
        return emailLibrary.sendEmail(
          EmailTemplateEnum.EMP_QUERY_FOR_REFERRAL_BY_CAND,
          toAddress,
          emailPlaceholders,
        );
      }

    /**
    * getSupportById
    * 
    * Retrieves a support request by its ID.
    *
    * @param {string} supportId - The ID of the support request to retrieve.
    * @returns {Promise<QueryResponse<DbUserSupportDto>>} - A Promise that resolves to the support request.
    */
    async getSupportById(supportId: string): Promise<QueryResponse<DbUserSupportDto>> {
        // Call the DAO method to retrieve support by ID
        return userSupportDao.getSupportById(supportId);
    }
}

// Export an instance of the UserSupportService class
export default new UserSupportService();
