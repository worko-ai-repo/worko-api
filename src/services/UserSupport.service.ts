// Import Local Packages
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import DAOs
import userSupportDao from "../daos/UserSupport.dao";

// Import Constants
import { GROWAASAN_APP_CONSTANTS } from "../configs/constants/Growaasan.constant";

// Import DTOs
import {
  UserSupportCreateDto,
  UserSupportFilterDto,
  UserSupportUpdateApiDto,
  UserSupportUpdateDto
} from "../dtos/UserSupport.dto";

// Import Models 
import { DbUserSupportDto } from "../db/models/UserSupport.model";
import { DbUserReferralDto } from "../db/models/UserReferral.model";
import { DbUserDetailDto } from "../db/models/UserDetail.model";
import { DbCompanyDetailDto } from "../db/models/CompanyDetail.model";

// Import Enums
import {
  UserContextTypeEnum,
  UserSupportStatusEnum,
  UserType
} from "../enums/User.enum";
import { EmailTemplateEnum } from "../enums/EmailTemplate.enum";
import { GrowaasanTemplateNameEnum } from "../enums/GrowaasanTemplate.enum";

// Import Services
import UserReferralService from "./UserReferral.service";
import UserDetailService from "./UserDetail.service";
import CompanyService from "./Company.service";

// Import DTOs for Templates
import {
  EmailTemplatePlaceholderEMP_QUERY_FOR_REFERRAL_BY_CAND
} from "../dtos/EmailTemplatePlaceholder.dto";
import { GrowaasanTemplatePlaceholderCAND_REFEREE_RAISE_DISPUTE_CANDIDATE, GrowaasanTemplatePlaceholderEMP_CANDIDATE_RAISE_DISPUTE_EMPLOYEE } from "../dtos/GrowaasanTemplatePlaceholder.dto";
import { GrowaasanPhoneNumberDto } from "../dtos/Growaasan.dto";

// Import Libraries
import { EmailSourceDestinationAddress, emailLibrary } from "../libraries/email.library";
import { growaasanLibraryObj } from "../libraries/Growaasan.library";

// Import Utilities
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

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
  async createSupport(
    emailAddress: string,
    userSupportCreateDto: UserSupportCreateDto
  ): Promise<DbUserSupportDto> {
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
        let userReferralDetails: QueryResponse<DbUserReferralDto> = await UserReferralService.getReferralById(
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
        let userDetails: QueryResponse<DbUserDetailDto> =
          await UserDetailService.get(candEmail);
        if (!userDetails.count) {
          throw new BaseError(
            `Candidate with email ${candEmail} not found.`,
            HttpStatusCode.NOT_FOUND_404
          );
        }

        // Retrieve company details using company ID
        let companyDetails: QueryResponse<DbCompanyDetailDto> =
          await CompanyService.getCompanyDetailById(
            userReferralDetails[0].companyId
          );
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
         * - If isWhatsappNotificationEnabled is `undefined` then Send whatsapp message
         * - If isWhatsappNotificationEnabled is `true` then Send whatsapp message
         * - If isWhatsappNotificationEnabled is `false` then Don't Send whatsapp message
         */
        if (
          GROWAASAN_APP_CONSTANTS.ENABLED &&
          userDetails[0].isWhatsappNotificationEnabled !== false
        ) {
          // Prepare Growaasan placeholders for the message to candidate
          const growaasanPlaceholders: GrowaasanTemplatePlaceholderCAND_REFEREE_RAISE_DISPUTE_CANDIDATE =
            {
              candidateName: candName.toTitleCase(),
              employeeName: refereeName.toTitleCase(),
              referralStatus: userReferralDetails[0].status,
              companyName: companyName,
            };

          // Send WhatsApp message to candidate
          await this.sendGrowaasanWhatsappMessageToCandAboutEmpReferralQuery(
            growaasanPlaceholders,
            {
              countryCode: GROWAASAN_APP_CONSTANTS.COUNTRY_CODE,
              phoneNumber: parseInt(
                userDetails[0].number.replace(
                  GROWAASAN_APP_CONSTANTS.COUNTRY_CODE_WITH_PLUS_SIGN,
                  ""
                )
              ),
            },
            candEmail
          );
        } else {
          global.logger.info(
            `Candidate with email ${candEmail} does not have whatsapp notifications enabled, so no whatsapp message will be sent.`
          );
        }
      }
    } else if (userSupportCreateDto.userRole === UserType.CAND) {
      // If candidate is raising a support/dispute
      if (userSupportCreateDto.contextType === UserContextTypeEnum.REFERRAL) {
        // Retrieve referral details using referral ID
        let referralId = userSupportCreateDto.contextId;
        let userReferralDetails: QueryResponse<DbUserReferralDto> =
          await UserReferralService.getReferralById(referralId);
        if (!userReferralDetails.count) {
          throw new BaseError(
            `Referral with ID ${referralId} not found.`,
            HttpStatusCode.NOT_FOUND_404
          );
        }

        // Extract employee user ID from referral details
        const employeeUserId: string | undefined = userReferralDetails[0].acceptedByUserId || userReferralDetails[0].doneByUserId;

        let employeeDetails;
        if(employeeUserId){
          employeeDetails = await UserDetailService.getUserById(employeeUserId);
          if (!employeeDetails.count) {
            throw new BaseError(
              `Employee not found.`,
              HttpStatusCode.NOT_FOUND_404
            );
          }          

          // Extract candidate name and referee name
          let refereeName = employeeDetails[0].name;
          let candName= userSupportCreateDto.userFirstName;
          let empEmail = employeeDetails[0].PK.split("#")[2];

          /**
           * - If isWhatsappNotificationEnabled is `undefined` then Send whatsapp message
           * - If isWhatsappNotificationEnabled is `true` then Send whatsapp message
           * - If isWhatsappNotificationEnabled is `false` then Don't Send whatsapp message
           */
          if (
            GROWAASAN_APP_CONSTANTS.ENABLED &&
            employeeDetails[0].isWhatsappNotificationEnabled !== false
          ) {
            // Prepare WhatsApp placeholders for the message to employee
            const growaasanPlaceholders: GrowaasanTemplatePlaceholderEMP_CANDIDATE_RAISE_DISPUTE_EMPLOYEE =
              {
                employeeName: refereeName.toTitleCase(),
                candidateName: candName.toTitleCase(),
                referralStatus: userReferralDetails[0].status
              };
  
            // Send WhatsApp message to employee
            await this.sendGrowaasanWhatsappMessageToEmpAboutCandReferralQuery(
              growaasanPlaceholders,
              {
                countryCode: GROWAASAN_APP_CONSTANTS.COUNTRY_CODE,
                phoneNumber: parseInt(
                  employeeDetails[0].number.replace(
                    GROWAASAN_APP_CONSTANTS.COUNTRY_CODE_WITH_PLUS_SIGN,
                    ""
                  )
                ),
              },
              empEmail
            );
          } else {
            global.logger.info(
              `Employee with email ${empEmail} does not have whatsapp notifications enabled, so no whatsapp message will be sent.`
            );
          }
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
  async updateSupportById(
    userEmail: string,
    supportId: string,
    updateRequestBody: UserSupportUpdateApiDto
  ): Promise<DbUserSupportDto> {
    // Determine if the status is RESOLVED
    const isResolved =
      updateRequestBody.status === UserSupportStatusEnum.RESOLVED;

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
  async getUserSupportList(
    filterOptions: UserSupportFilterDto
  ): Promise<QueryResponse<DbUserSupportDto>> {
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
  async sendEmailToEmpAboutCandReferralQuery(
    referralId: string,
    query: string
  ): Promise<boolean> {
    // Get referral data using referralId
    const referralData = await UserReferralService.getByGSI1(referralId);
    if (!referralData) {
      throw new Error(
        "No valid referral exists for employee to process this query."
      );
    }

    // Extract employee ID from referral data
    const empId =
      referralData[0].acceptedByUserId || referralData[0].doneByUserId;

    // Retrieve employee details using employee ID
    const empDetails = await UserDetailService.getUserById(empId);
    if (!empDetails.count) {
      throw new BaseError(
        "Employee with given ID doesn't exist",
        HttpStatusCode.NOT_FOUND_404
      );
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
        empName: refereeName.toTitleCase(),
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
      emailPlaceholders
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
  async getSupportById(
    supportId: string
  ): Promise<QueryResponse<DbUserSupportDto>> {
    // Call the DAO method to retrieve the support request by ID
    return userSupportDao.getSupportById(supportId);
  }

  /**
   * sendGrowaasanWhatsappMessageToCandAboutEmpReferralQuery
   *
   * Sends a WhatsApp message to a candidate about an employee referral query.
   *
   * This method sends a WhatsApp message to a candidate regarding an employee referral query.
   * The message is sent using the Growaasan cloud API integration.
   *
   * @param {GrowaasanTemplatePlaceholderCAND_REFEREE_RAISE_DISPUTE_CANDIDATE} placeholders - The placeholders for the WhatsApp message template.
   * @param {GrowaasanPhoneNumberDto} toPhoneNumber - The phone number to send the message to.
   * @param {string} userEmail - The email address of the candidate.
   * @returns {Promise<boolean>} - A promise that resolves when the message is successfully sent.
   */
  async sendGrowaasanWhatsappMessageToCandAboutEmpReferralQuery(
    placeholders: GrowaasanTemplatePlaceholderCAND_REFEREE_RAISE_DISPUTE_CANDIDATE,
    toPhoneNumber: GrowaasanPhoneNumberDto,
    userEmail: string
  ): Promise<boolean> {
    // Send the whatsapp message using the growaasan library
    await growaasanLibraryObj.sendGrowaasanWhatsappMessage(
      GrowaasanTemplateNameEnum.CAND_REFEREE_RAISE_DISPUTE_CANDIDATE,
      userEmail,
      toPhoneNumber,
      placeholders
    );

    // log the details
    global.logger.info(
      "WhatsApp Message For Referral Query to Candidate sent successfully",
      {
        filePath: __filename,
        methodName:
          this.sendGrowaasanWhatsappMessageToCandAboutEmpReferralQuery.name,
        userEmail: userEmail,
      }
    );
    return true;
  }

  /**
   * sendGrowaasanWhatsappMessageToEmpAboutCandReferralQuery
   *
   * Sends a WhatsApp message to an employee about a candidate referral query.
   *
   * This method sends a WhatsApp message to an employee about a candidate referral query.
   * The message is sent using the Growaasan cloud API integration.
   *
   * @param {GrowaasanTemplatePlaceholderEMP_CANDIDATE_RAISE_DISPUTE_EMPLOYEE} placeholders - The placeholders for the WhatsApp message template.
   * @param {GrowaasanPhoneNumberDto} toPhoneNumber - The phone number to send the message to.
   * @param {string} userEmail - The email address of the employee.
   * @returns {Promise<boolean>} - A promise that resolves when the message is successfully sent.
   */
  async sendGrowaasanWhatsappMessageToEmpAboutCandReferralQuery(
    placeholders: GrowaasanTemplatePlaceholderEMP_CANDIDATE_RAISE_DISPUTE_EMPLOYEE,
    toPhoneNumber: GrowaasanPhoneNumberDto,
    userEmail: string
  ) {
    await growaasanLibraryObj.sendGrowaasanWhatsappMessage(
      GrowaasanTemplateNameEnum.EMP_CANDIDATE_RAISE_DISPUTE_EMPLOYEE,
      userEmail,
      toPhoneNumber,
      placeholders
    );

    global.logger.info(
      "WhatsApp Message For Referral Query to Employee sent successfully",
      {
        filePath: __filename,
        methodName:
          this.sendGrowaasanWhatsappMessageToEmpAboutCandReferralQuery.name,
        userEmail: userEmail,
      }
    );
  }
}

// Export an instance of the UserSupportService class
export default new UserSupportService();