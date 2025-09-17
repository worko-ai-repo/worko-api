// Import luxon
import { DateTime } from "luxon";

// Import constants
import APP_CONSTANTS from "../configs/constants.config";

// Import dtos
import {
  UserGuidanceRequestCreateApiDTO,
  UserGuidanceRequestFilterOptions,
} from "../dtos/User.dto";
import { EmailTemplatePlaceholder_USER_GUIDANCE_REQUEST } from "../dtos/EmailTemplatePlaceholder.dto";

// Import daos
import { userGuidanceRequestDaoObj } from "../daos/UserGuidanceRequest.dao";

// Import enums
import { EmailTemplateEnum } from "../enums/EmailTemplate.enum";

// Import libraries
import {
  emailLibrary,
  EmailSourceDestinationAddress,
} from "../libraries/email.library";

// Import models
import { DbUserGuidanceRequestDto } from "../db/models/UserGuidanceRequest.model";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";
import {
  PaginatedResultsWithMatchingConditionsInternalResponse,
  PaginatedResultsWithMatchingConditionsResponse,
} from "../dtos/Common.dto";

/**
 * UserGuidanceRequestService
 */
class UserGuidanceRequestService {
  /**
   * Creates a new user guidance request and sends email notifications.
   *
   * This function logs the creation of a user guidance request and sends emails
   * to both the corporate user and the requesting user. It constructs email
   * placeholders and utilizes the email library to send notifications.
   *
   * @param {string} cognitoUserId - The ID of the user initiating the request.
   * @param {string} userEmail - The email of the user making the request.
   * @param {string} userName - The name of the user making the request.
   * @param {UserGuidanceRequestCreateApiDTO} validatedRequestBody - The validated data
   *        required to create the guidance request.
   * @returns {Promise<DbUserGuidanceRequestDto>} - A promise resolving to the newly
   *          created user guidance request.
   * @throws {BaseError} - Throws an error if email sending fails.
   */
  async createUserGuidanceRequest(
    cognitoUserId: string,
    userEmail: string,
    userName: string,
    userPhoneNumber: string,
    validatedRequestBody: UserGuidanceRequestCreateApiDTO
  ): Promise<DbUserGuidanceRequestDto> {
    // logger
    global.logger.info("Create User Guidance Request [service]", {
      methodName: this.createUserGuidanceRequest.name,
    });

    const userGuidanceRequestDetails: DbUserGuidanceRequestDto =
      await userGuidanceRequestDaoObj.createUserGuidanceRequest(
        cognitoUserId,
        userEmail,
        validatedRequestBody
      );
    if (!userGuidanceRequestDetails) {
      throw new BaseError(
        "Failed to Create Guidance Request, Please try again after some time.",
        HttpStatusCode.BAD_REQUEST_400
      );
    }

    // Construct the common email placeholders object for sending email to `worko admin` and `user`
    const userGuidanceRequestPlaceholders: EmailTemplatePlaceholder_USER_GUIDANCE_REQUEST =
      {
        userName: userName.toTitleCase(),
        companyName: validatedRequestBody.companyName.toTitleCase(),
        dateOfGuidanceRequest: DateTime.fromISO(
          validatedRequestBody.guidanceRequestDeadline
        ).toFormat("d'th' MMMM yyyy"),
        guidanceRequestType: validatedRequestBody.guidanceRequestType
          .toTitleCase()
          .split("_")
          .join(" "),
        jobUrl: validatedRequestBody.jobUrl,
        userPhoneNumber: userPhoneNumber,
      };

    // ================================
    // == Send email to worko admin
    // ================================

    // Prepare the email address object for the admin
    const adminToAddress: EmailSourceDestinationAddress = {
      email: APP_CONSTANTS.SOURCE_EMAIL_ADDRESS.GUIDANCE_EMAIL.email,
      fullName:
        APP_CONSTANTS.SOURCE_EMAIL_ADDRESS.GUIDANCE_EMAIL.fullName.toTitleCase(),
    };

    // Send email to the admin user
    const emailResponseForAdmin: {
      awsMessageId: string | null;
      systemLogId: string | null;
    } = await emailLibrary.sendEmail(
      EmailTemplateEnum.USER_GUIDANCE_REQUEST,
      adminToAddress,
      userGuidanceRequestPlaceholders
    );

    // Check if email was sent to admin and if not throw an error
    if (!emailResponseForAdmin.awsMessageId) {
      global.logger.error("Failed to send an email to worko admin", {
        email: APP_CONSTANTS.SOURCE_EMAIL_ADDRESS.GUIDANCE_EMAIL.email,
        methodName: this.createUserGuidanceRequest.name,
      });
    }

    // =================================================
    // == Send email to user who made the guidance request
    // =================================================

    // Prepare the email address object for the user
    const userToAddress: EmailSourceDestinationAddress = {
      email: userEmail,
      fullName: userName.toTitleCase(),
    };

    // Send email to the user
    const emailResponseForUser: {
      awsMessageId: string | null;
      systemLogId: string | null;
    } = await emailLibrary.sendEmail(
      EmailTemplateEnum.USER_GUIDANCE_REQUEST,
      userToAddress,
      userGuidanceRequestPlaceholders
    );

    // Check if email was sent to user and if not throw an error
    if (!emailResponseForUser.awsMessageId) {
      global.logger.error("Failed to send email to user", {
        methodName: this.createUserGuidanceRequest.name,
        userEmail,
      });
    }

    // Return the newly created user guidance request
    return userGuidanceRequestDetails;
  }

  /**
   * getAllUserGuidanceRequestByFilterOptions
   *
   * Retrieves all user guidance requests based on the provided filter options.
   *
   * @param {UserGuidanceRequestFilterOptions} userGuidanceRequestBody - The filter options for retrieving user guidance requests.
   * @returns {Promise<PaginatedResultsWithMatchingConditionsInternalResponse<DbUserGuidanceRequestDto[]>>} A promise that resolves to a paginated response containing an array of
   *          user guidance request DTOs and matching conditions.
   */
  async getAllUserGuidanceRequestByFilterOptions(
    userGuidanceRequestBody: UserGuidanceRequestFilterOptions
  ): Promise<
    PaginatedResultsWithMatchingConditionsInternalResponse<
      DbUserGuidanceRequestDto[]
    >
  > {
    global.logger.info("Get user guidance request [service]", {
      methodName: this.getAllUserGuidanceRequestByFilterOptions.name,
    });

    // Fetch guidance requests
    const guidanceRequestDetails: PaginatedResultsWithMatchingConditionsResponse<DbUserGuidanceRequestDto> =
      await userGuidanceRequestDaoObj.getAllUserGuidanceRequestByFilterOptions(
        userGuidanceRequestBody
      );

    // Extract guidance request data
    const {
      lastKey,
      count,
      timesQueried,
      queriedCount,
      ...guidanceRequestData
    } = guidanceRequestDetails;

    // Convert to array
    const guidanceRequestDataArray: DbUserGuidanceRequestDto[] =
      Object.values(guidanceRequestData);

    // If no guidance requests found, return empty results
    if (guidanceRequestDataArray.length === 0) {
      return {
        data: [],
        lastKey,
        count,
        timesQueried,
        queriedCount,
      };
    }

    // Build paginated response
    return {
      data: guidanceRequestDataArray,
      lastKey,
      count,
      timesQueried,
      queriedCount,
    };
  }
}

const userGuidanceRequestServiceObj = new UserGuidanceRequestService();

export { userGuidanceRequestServiceObj, UserGuidanceRequestService };
