// Import Local Packages
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import DAOs
import userSupportDao from "../daos/UserSupport.dao";

// Import DTOs
import {
  UserSupportCreateDto,
  UserSupportFilterDto,
  UserSupportUpdateApiDto,
  UserSupportUpdateDto
} from "../dtos/UserSupport.dto";

// Import Models 
import { DbUserSupportDto } from "../db/models/UserSupport.model";

// Import Enums
import {
  UserContextTypeEnum,
  UserSupportStatusEnum,
  UserType
} from "../enums/User.enum";
import { EmailTemplateEnum } from "../enums/EmailTemplate.enum";

// Import Services
import UserReferralService from "./UserReferral.service";
import UserDetailService from "./UserDetail.service";
import CompanyService from "./Company.service";

// Import DTOs for Templates
import {
  EmailTemplatePlaceholderEMP_QUERY_FOR_REFERRAL_BY_CAND
} from "../dtos/EmailTemplatePlaceholder.dto";
import {
  WhatsappTemplatePlaceholderCAND_REFERRAL_QUERY_BY_EMP,
  WhatsappTemplatePlaceholderEMP_REFERRAL_QUERY_BY_CAND
} from "../dtos/WhatsappTemplatePlaceholder.dto";

// Import Libraries
import { EmailSourceDestinationAddress, emailLibrary } from "../libraries/email.library";
import { whatsappLibraryObj } from "../libraries/Whatsapp.library";

// Import Utilities
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";
import { WhatsappTemplateNameEnum } from "../enums/WhatsappTemplate.enum";

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

    // Check if the user role is Employee
    if (userSupportCreateDto.userRole === UserType.EMP) {
      // Check if the context type is REFERRAL
      if (userSupportCreateDto.contextType === UserContextTypeEnum.REFERRAL) {
        // Retrieve referral details using referral ID
        let referralId = userSupportCreateDto.contextId;
        let userReferralDetails = await UserReferralService.getReferralById(
          referralId
        );
        if (!userReferralDetails.count) {
          throw new BaseError(
            `Referral with ID ${referralId} not found.`,
            HttpStatusCode.NOT_FOUND_404
          );
        }

        // Extract candidate email and details
        let candEmail = userReferralDetails[0].PK.split("#")[2];
        let userDetails = await UserDetailService.get(candEmail);
        if (!userDetails.count) {
          throw new BaseError(
            `Candidate with email ${candEmail} not found.`,
            HttpStatusCode.NOT_FOUND_404
          );
        }

        // Retrieve company details using company ID
        let companyDetails = await CompanyService.getCompanyDetailsByIds([
          userReferralDetails[0].companyId,
        ]);
        if (!companyDetails) {
          throw new BaseError(
            `Company with ID ${userReferralDetails[0].companyId} not found.`,
            HttpStatusCode.NOT_FOUND_404
          );
        }

        // Extract company name, candidate name, and referee name
        let companyName = companyDetails[0].name;
        let candName = userDetails[0].name;
        let refereeName = userSupportCreateDto.userFirstName;

        /**
         * NOTE:- As of now we are verifying user "isEmailVerified" attribute to send whatsapp message to the user
         * but in near future we will verify user "isNumberVerified" attribute to send whatsapp message to the user
         *
         * Check if user has isEmailVerified true or false, if true then send whatsapp message to the user
         */
        if (userDetails[0].isEmailVerified) {
          // Prepare WhatsApp placeholders for the message to candidate
          const whatsappPlaceholders: WhatsappTemplatePlaceholderCAND_REFERRAL_QUERY_BY_EMP =
            {
              body1: { type: "text", value: candName },
              body2: { type: "text", value: refereeName },
              body3: { type: "text", value: companyName },
            };

          // Send WhatsApp message to candidate
          await this.sendWhatsappMessageToCandAboutEmpReferralQuery(
            whatsappPlaceholders,
            userDetails[0].number,
            candEmail
          );
        } else {
          global.logger.info(
            `Candidate's number for "${candEmail}" is not verified. WhatsApp message not sent.`
          );
        }
      }
    } else if (userSupportCreateDto.userRole === UserType.CAND) {
      // If candidate is raising a support/dispute
      if (userSupportCreateDto.contextType === UserContextTypeEnum.REFERRAL) {
        // Retrieve referral details using referral ID
        let referralId = userSupportCreateDto.contextId;
        let userReferralDetails = await UserReferralService.getReferralById(
          referralId
        );
        if (!userReferralDetails.count) {
          throw new BaseError(
            `Referral with ID ${referralId} not found.`,
            HttpStatusCode.NOT_FOUND_404
          );
        }

        // Extract candidate email and details
        let candEmail = userReferralDetails[0].PK.split("#")[2];
        let userDetails = await UserDetailService.get(candEmail);
        if (!userDetails.count) {
          throw new BaseError(
            `Candidate with email ${candEmail} not found.`,
            HttpStatusCode.NOT_FOUND_404
          );
        }

        // Extract candidate name and referee name
        let candName = userDetails[0].name;
        let refereeName = userSupportCreateDto.userFirstName;

        /**
         * NOTE:- As of now we are verifying user "isEmailVerified" attribute to send whatsapp message to the user
         * but in near future we will verify user "isNumberVerified" attribute to send whatsapp message to the user
         *
         * Check if user has isEmailVerified true or false, if true then send whatsapp message to the user
         */
        if (userDetails[0].isEmailVerified) {
          // Prepare WhatsApp placeholders for the message to employee
          const whatsappPlaceholders: WhatsappTemplatePlaceholderEMP_REFERRAL_QUERY_BY_CAND =
            {
              body1: { type: "text", value: refereeName },
              body2: { type: "text", value: candName },
            };

          // Send WhatsApp message to employee
          await this.sendWhatsappMessageToEmpAboutCandReferralQuery(
            whatsappPlaceholders,
            userDetails[0].number,
            candEmail
          );
        } else {
          global.logger.info(
            `Candidate's number for "${candEmail}" is not verified. WhatsApp message not sent.`
          );
        }
      }

    }

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

    // Prepare the update data with actionByUserId
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
  * getUserSupportList
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
   * sendEmailToEmpAboutCandReferralQuery
   * 
   * Sends an email notification to an employee about a candidate query.
   * 
   * @param {string} referralId - Referral ID
   * @param {string} query - Query from the candidate
   * @returns {Promise<boolean>} - Promise resolving to true if email sent successfully, otherwise false
   */
  async sendEmailToEmpAboutCandReferralQuery(referralId: string, query: string): Promise<boolean> {
    // Get referral data using referralId
    const referralData = await UserReferralService.getByGSI1(referralId);
    if (!referralData) {
      throw new Error("No valid referral exists for employee to process this query.");
    }

    // Extract employee ID from referral data
    const empId = referralData[0].acceptedByUserId || referralData[0].doneByUserId;

    // Retrieve employee details using employee ID
    const empDetails = await UserDetailService.getUserById(empId);
    if (!empDetails.count) {
      throw new BaseError("Employee with given ID doesn't exist", HttpStatusCode.NOT_FOUND_404);
    }

    // Prepare name and email from employee details
    const refereeName = empDetails[0].name;
    const refereeEmail = empDetails[0].emailList.primary;

    // Prepare email destination
    const toAddress: EmailSourceDestinationAddress = {
      email: refereeEmail,
      fullName: refereeName,
    };

    // Prepare email placeholders for the referral query notification
    const emailPlaceholders: EmailTemplatePlaceholderEMP_QUERY_FOR_REFERRAL_BY_CAND =
    {
      empName: refereeName,
      query: query,
    };

    // Send email to notify the employee about the candidate query
    const sendEmailResponse = await this.sendEmailForCandReferralQueryToEmp(
      emailPlaceholders,
      toAddress
    );

    return true;
  }
  /**
   * sendEmailForCandReferralQueryToEmp - Sends an email notification to an employee about a candidate query.
   * 
   * This method uses a specified email template and placeholders to construct and send an email notification
   * to an employee regarding a referral query made by a candidate.
   * 
   * @param {EmailTemplatePlaceholderEMP_QUERY_FOR_REFERRAL_BY_CAND} emailPlaceholders - Placeholders for email content, such as candidate details and referral information.
   * @param {EmailSourceDestinationAddress} toAddress - Email address and full name of the recipient, specifying where to send the email.
   * @returns {Promise<{ awsMessageId: string | null }>} - A promise that resolves to the AWS message ID of the sent email, or null if the sending fails.
   */
  async sendEmailForCandReferralQueryToEmp(
    emailPlaceholders: EmailTemplatePlaceholderEMP_QUERY_FOR_REFERRAL_BY_CAND,
    toAddress: EmailSourceDestinationAddress
  ): Promise<{ awsMessageId: string | null }> {
    // Send the email using the email library with the specified template, recipient, and placeholders
    return emailLibrary.sendEmail(
      EmailTemplateEnum.EMP_QUERY_FOR_REFERRAL_BY_CAND,
      toAddress,
      emailPlaceholders,
    );
  }

  /**
   * getSupportById - Retrieves a support request by its ID.
   * 
   * This method calls the Data Access Object (DAO) method to fetch a support request from the database using its unique ID.
   * 
   * @param {string} supportId - The ID of the support request to retrieve.
   * @returns {Promise<QueryResponse<DbUserSupportDto>>} - A promise that resolves to the support request details wrapped in a QueryResponse object.
   */
  async getSupportById(supportId: string): Promise<QueryResponse<DbUserSupportDto>> {
    // Call the DAO method to retrieve the support request by ID
    return userSupportDao.getSupportById(supportId);
  }

  /**
   * sendWhatsappMessageToCandAboutEmpReferralQuery - Sends a WhatsApp message to a candidate about an employee referral query.
   * 
   * This method sends a WhatsApp message to a candidate using a specified template and placeholders to inform them
   * about a referral query made by an employee.
   * 
   * @param {WhatsappTemplatePlaceholderCAND_REFERRAL_QUERY_BY_EMP} placeholders - Placeholders for the WhatsApp message content, including candidate and referral details.
   * @param {string} toPhoneNumber - The phone number of the candidate to whom the message will be sent.
   * @param {string} userEmail - The email address of the user sending the message, used for logging purposes.
   */
  async sendWhatsappMessageToCandAboutEmpReferralQuery(
    placeholders: WhatsappTemplatePlaceholderCAND_REFERRAL_QUERY_BY_EMP,
    toPhoneNumber: string,
    userEmail: string
  ): Promise<boolean> {
    // Retrive template name and send the whatsapp messaage 
    const templateName = WhatsappTemplateNameEnum.CAND_QUERY_FOR_REFERRAL_BY_EMP;
    await whatsappLibraryObj.sendWhatsappMessage(
      userEmail,
      templateName,
      toPhoneNumber,
      placeholders,
    );

    // log the details
    global.logger.info("WhatsApp Message For Referral Query to Candidate sent successfully", {
      filePath: __filename,
      methodName: this.sendWhatsappMessageToCandAboutEmpReferralQuery.name,
      userEmail: userEmail
    });
    return true
  }

  /**
   * sendWhatsappMessageToEmpAboutCandReferralQuery - Sends a WhatsApp message to an employee about a candidate referral query.
   * 
   * This method sends a WhatsApp message to an employee using a specified template and placeholders to inform them
   * about a referral query made by a candidate.
   * 
   * @param {WhatsappTemplatePlaceholderEMP_REFERRAL_QUERY_BY_CAND} placeholders - Placeholders for the WhatsApp message content, including employee and referral details.
   * @param {string} toPhoneNumber - The phone number of the employee to whom the message will be sent.
   * @param {string} userEmail - The email address of the user sending the message, used for logging purposes.
   */
  async sendWhatsappMessageToEmpAboutCandReferralQuery(
    placeholders: WhatsappTemplatePlaceholderEMP_REFERRAL_QUERY_BY_CAND,
    toPhoneNumber: string,
    userEmail: string
  ) {
    const templateName = WhatsappTemplateNameEnum.EMP_QUERY_FOR_REFERRAL_BY_CAND; // This should be replaced with the actual template name from the enum.

    await whatsappLibraryObj.sendWhatsappMessage(
      userEmail,
      templateName,
      toPhoneNumber,
      placeholders,
    );

    global.logger.info("WhatsApp Message For Referral Query to Employee sent successfully", {
      filePath: __filename,
      methodName: this.sendWhatsappMessageToEmpAboutCandReferralQuery.name,
      userEmail: userEmail
    });
  }
}
// Export an instance of the UserSupportService class
export default new UserSupportService();
