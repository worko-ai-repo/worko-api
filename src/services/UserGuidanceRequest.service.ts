// Import luxon
import { DateTime } from "luxon";

// Import dynamoose
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import constants
import APP_CONSTANTS from "../configs/constants.config";

// Import dtos
import {
  UserGuidanceRequestCreateApiDTO,
  UserGuidanceRequestFilterOptions,
} from "../dtos/UserGuidanceRequest.dto";
import { EmailTemplatePlaceholder_USER_GUIDANCE_REQUEST, EmailTemplatePlaceholderADMIN_USER_GUIDANCE_REQUEST_CANCELLED_UPDATE_STATUS, EmailTemplatePlaceholderADMIN_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_REQUESTED_BY_CAND, EmailTemplatePlaceholderADMIN_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_REQUESTED_BY_EMP, EmailTemplatePlaceholderCAND_USER_GUIDANCE_REQUEST_CANCELLED_UPDATE_STATUS, EmailTemplatePlaceholderCAND_USER_GUIDANCE_REQUEST_MEETING_CONFIRMED_UPDATE_STATUS, EmailTemplatePlaceholderCAND_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_CONFIRMED, EmailTemplatePlaceholderCAND_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_REQUESTED_BY_CAND, EmailTemplatePlaceholderCAND_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_REQUESTED_BY_EMP, EmailTemplatePlaceholderCAND_USER_GUIDANCE_REQUEST_MENTOR_ASSIGNED_UPDATE_STATUS, EmailTemplatePlaceholderCAND_USER_GUIDANCE_REQUEST_PAYMENT_CONFIRMATION_DONE, EmailTemplatePlaceholderCAND_USER_GUIDANCE_REQUEST_PROJECT_COMPLETED, EmailTemplatePlaceholderCAND_USER_GUIDANCE_REQUEST_REJECTED_UPDATE_STATUS, EmailTemplatePlaceholderMENTOR_USER_GUIDANCE_REQUEST_CANCELLED_UPDATE_STATUS, EmailTemplatePlaceholderMENTOR_USER_GUIDANCE_REQUEST_MEETING_CONFIRMED_UPDATE_STATUS, EmailTemplatePlaceholderMENTOR_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_CONFIRMED, EmailTemplatePlaceholderMENTOR_USER_GUIDANCE_REQUEST_MENTOR_ASSIGNED_UPDATE_STATUS } from "../dtos/EmailTemplatePlaceholder.dto";
import {
  PaginatedResultsWithMatchingConditionsInternalResponse,
  PaginatedResultsWithMatchingConditionsResponse,
} from "../dtos/Common.dto";
import { UserGuidanceRequestCommonUpdateDto, UserGuidanceRequestStatusTrackerDto, UserGuidanceRequestUpdateByCandidateApiDto, UserGuidanceRequestUpdateByMentorApiDto, UserGuidanceRequestUpdateByWorkoAdminApiDto } from "../dtos/UserGuidanceRequest.dto";

// Import daos
import { userGuidanceRequestDaoObj } from "../daos/UserGuidanceRequest.dao";

// Import enums
import { EmailTemplateEnum } from "../enums/EmailTemplate.enum";
import { UserGuidanceRequestStatusEnum } from "../enums/UserGuidanceRequest.enum";
import { AdminRoleEnum } from "../enums/Common.enum";
import { UserType } from "../enums/User.enum";

// Import helpers
import { getEmailFromPK } from "../helpers/user.helper";
import { injectEntityDetailsHelperObj } from "../helpers/injectEntityDetails.helper";

// Import models
import { DbCompanyDetailDto } from "../db/models/CompanyDetail.model";
import { DbUserDetailDto } from "../db/models/UserDetail.model";
import { DbUserExperienceDto } from "../db/models/UserExperience.model";

// Import services
import { companyServiceObj } from "../admin/services/Company.service";
import UserDetailService from "./UserDetail.service";
import UserExperienceService from "./UserExperience.service";

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
import { dateHelperObj } from "../helpers/date.helper";

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

    /**
     * If company id is provided, get company details
     */
    if (validatedRequestBody.companyId) {
      // Get company details
      const companyDetails: QueryResponse<DbCompanyDetailDto> =
        await companyServiceObj.getCompanyDetailById(
          validatedRequestBody.companyId
        );

      // Throw error if company details not found
      if (!companyDetails.count) {
        throw new BaseError(
          `The Company Details not found.`,
          HttpStatusCode.NOT_FOUND_404
        );
      }
    }

    const userGuidanceRequestDetails: DbUserGuidanceRequestDto =
      await userGuidanceRequestDaoObj.createUserGuidanceRequest(
        cognitoUserId,
        userEmail,
        validatedRequestBody
      );
    if (!userGuidanceRequestDetails.id) {
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
        ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
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

  async getAllUserGuidanceRequestByFilterOptions(
    userGuidanceRequestBody: UserGuidanceRequestFilterOptions
  ): Promise<
    PaginatedResultsWithMatchingConditionsInternalResponse<
      (DbUserGuidanceRequestDto & {
        userDetails?: DbUserDetailDto;
        employeeDetails?: DbUserDetailDto;
      })[]
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

    // Attach candidate(who raised guidance) details to the response
    if (
      [AdminRoleEnum.ADMIN, UserType.EMP].includes(
        userGuidanceRequestBody.actionByUserType
      )
    ) {
      global.logger.info(
        "Injecting candidate details to guidance request [service]",
        {
          methodName: this.getAllUserGuidanceRequestByFilterOptions.name,
        }
      );
      const userGuidanceRequestWithCandidateDetails: (DbUserGuidanceRequestDto & {
        userDetails?: DbUserDetailDto;
        employeeDetails?: DbUserDetailDto;
      })[] =
        await injectEntityDetailsHelperObj.injectEntityWithUserDetails<DbUserGuidanceRequestDto>(
          guidanceRequestDataArray,
          true,
          false,
        );

      return {
        data: userGuidanceRequestWithCandidateDetails,
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

  async getUserGuidanceRequestById(
    userGuidanceRequestId: string
  ): Promise<QueryResponse<DbUserGuidanceRequestDto>> {
    global.logger.info("Get user guidance request [service]", {
      methodName: this.getUserGuidanceRequestById.name,
    });

    return userGuidanceRequestDaoObj.getUserGuidanceRequestById(
      userGuidanceRequestId
    );
  }

  async updateUserGuidanceRequestByIdAndEmail(
    id: string,
    email: string,
    updateData: Partial<UserGuidanceRequestCommonUpdateDto>
  ): Promise<DbUserGuidanceRequestDto> {
    global.logger.info("Update user guidance request [service]", {
      id,
      email,
      methodName: this.updateUserGuidanceRequestByIdAndEmail.name,
    });

    return userGuidanceRequestDaoObj.updateUserGuidanceRequestByIdAndEmail(
      id,
      email,
      updateData
    );
  }

  private async updateUserGuidanceRequestByActorPreRequisites(
    userGuidanceRequestId: string
  ): Promise<{
    existingUserGuidanceRequestData: DbUserGuidanceRequestDto;
    currentActionDateTime: string;
  }> {
    const existingGuidanceRequestQueryResponse: QueryResponse<DbUserGuidanceRequestDto> =
      await this.getUserGuidanceRequestById(userGuidanceRequestId);

    if (!existingGuidanceRequestQueryResponse.count) {
      throw new BaseError(
        "Guidance request not found.",
        HttpStatusCode.NOT_FOUND_404
      );
    }

    const existingUserGuidanceRequestData: DbUserGuidanceRequestDto =
      existingGuidanceRequestQueryResponse[0];

    const currentActionDateTime: string = DateTime.now().toISO();

    return {
      existingUserGuidanceRequestData,
      currentActionDateTime,
    };
  }

  async updateUserGuidanceRequestByWorkoAdmin(
    userGuidanceRequestId: string,
    validatedRequestBody: UserGuidanceRequestUpdateByWorkoAdminApiDto
  ): Promise<DbUserGuidanceRequestDto> {
    global.logger.info(
      "Update user guidance request by worko admin [service]",
      {
        methodName: this.updateUserGuidanceRequestByWorkoAdmin.name,
      }
    );

    const { existingUserGuidanceRequestData, currentActionDateTime } =
      await this.updateUserGuidanceRequestByActorPreRequisites(
        userGuidanceRequestId
      );

    if (
      existingUserGuidanceRequestData.status ===
        UserGuidanceRequestStatusEnum.REJECTED &&
      validatedRequestBody.newStatus === UserGuidanceRequestStatusEnum.REJECTED
    ) {
      throw new BaseError(
        "Guidance request already rejected.",
        HttpStatusCode.BAD_REQUEST_400
      );
    }

    let updateData: Partial<UserGuidanceRequestCommonUpdateDto>;

    const { newStatus, actionByUserId, actionByUserType } =
      validatedRequestBody;

    switch (newStatus) {
      case UserGuidanceRequestStatusEnum.MENTOR_ASSIGNED: {
        const {
          mentorDetails,
          mentorAssignedRemarks,
          scheduleMeetingDetails,
          currency,
          totalAmount,
          linkForPayment,
        } = validatedRequestBody;

        if (
          !mentorDetails ||
          !mentorAssignedRemarks ||
          !scheduleMeetingDetails ||
          !currency ||
          !totalAmount ||
          !linkForPayment
        ) {
          global.logger.error("Missing required fields", {
            methodName: this.updateUserGuidanceRequestByWorkoAdmin.name,
            updateStatus: newStatus,
            requiredFields: [
              "mentorDetails",
              "mentorAssignedRemarks",
              "scheduleMeetingDetails",
              "currency",
              "totalAmount",
              "linkForPayment",
            ],
          });
          throw new BaseError(
            "Missing required fields",
            HttpStatusCode.BAD_REQUEST_400
          );
        }

        const statusTrackerData: UserGuidanceRequestStatusTrackerDto[] = [
          ...existingUserGuidanceRequestData.statusTracker,
          {
            oldStatus: existingUserGuidanceRequestData.status,
            newStatus: newStatus,
            actionDate: currentActionDateTime,
            actionByUserId: actionByUserId,
            actionByUserType: actionByUserType,
          },
        ];

        updateData = {
          status: newStatus,
          statusTracker: statusTrackerData,
          mentorDetails: mentorDetails,
          mentorAssignedRemarks: mentorAssignedRemarks,
          scheduleMeetingDetails: scheduleMeetingDetails,
          paymentRequestDetails: {
            currency: currency,
            totalAmount: totalAmount,
            platformFee: Math.round(totalAmount * 0.2),
            guidanceFee: Math.round(totalAmount * 0.8),
            linkForPayment: linkForPayment,
            actionByUserId: actionByUserId,
            actionByUserType: actionByUserType,
            actionDate: currentActionDateTime,
          },
          updatedByUserId: actionByUserId,
        };

        break;
      }

      case UserGuidanceRequestStatusEnum.REJECTED: {
        const { rejectionReason } = validatedRequestBody;
        if (!rejectionReason) {
          global.logger.error("Missing required fields", {
            methodName: this.updateUserGuidanceRequestByWorkoAdmin.name,
            updateStatus: newStatus,
            requiredFields: ["rejectionReason"],
          });
          throw new BaseError(
            "Missing required fields",
            HttpStatusCode.BAD_REQUEST_400
          );
        }

        const statusTrackerData: UserGuidanceRequestStatusTrackerDto[] = [
          ...existingUserGuidanceRequestData.statusTracker,
          {
            oldStatus: existingUserGuidanceRequestData.status,
            newStatus: newStatus,
            actionDate: currentActionDateTime,
            actionByUserId: actionByUserId,
            actionByUserType: actionByUserType,
          },
        ];

        updateData = {
          status: newStatus,
          statusTracker: statusTrackerData,
          rejectedByDetails: {
            actionByUserId: actionByUserId,
            actionByUserType: actionByUserType,
            actionDate: currentActionDateTime,
            reason: rejectionReason,
          },
          updatedByUserId: actionByUserId,
        };

        break;
      }

      case UserGuidanceRequestStatusEnum.PAYMENT_CONFIRMATION_DONE: {
        const { uniqueTransactionReference } = validatedRequestBody;
        if (!uniqueTransactionReference) {
          global.logger.error("Missing required fields", {
            methodName: this.updateUserGuidanceRequestByWorkoAdmin.name,
            updateStatus: newStatus,
            requiredFields: ["uniqueTransactionReference"],
          });
          throw new BaseError(
            "Missing required fields",
            HttpStatusCode.BAD_REQUEST_400
          );
        }

        const statusTrackerData: UserGuidanceRequestStatusTrackerDto[] = [
          ...existingUserGuidanceRequestData.statusTracker,
          {
            oldStatus: existingUserGuidanceRequestData.status,
            newStatus: newStatus,
            actionDate: currentActionDateTime,
            actionByUserId: actionByUserId,
            actionByUserType: actionByUserType,
          },
        ];

        updateData = {
          status: newStatus,
          statusTracker: statusTrackerData,
          paymentConfirmationDoneDetails: {
            actionByUserId: actionByUserId,
            actionByUserType: actionByUserType,
            actionDate: currentActionDateTime,
            uniqueTransactionReference: uniqueTransactionReference,
          },
          updatedByUserId: actionByUserId,
        };

        break;
      }

      case UserGuidanceRequestStatusEnum.MEETING_CONFIRMED: {
        const { meetingLink } = validatedRequestBody;
        if (!meetingLink) {
          global.logger.error("Missing required fields", {
            methodName: this.updateUserGuidanceRequestByWorkoAdmin.name,
            updateStatus: newStatus,
            requiredFields: ["meetingLink"],
          });
          throw new BaseError(
            "Missing required fields",
            HttpStatusCode.BAD_REQUEST_400
          );
        }

        const statusTrackerData: UserGuidanceRequestStatusTrackerDto[] = [
          ...existingUserGuidanceRequestData.statusTracker,
          {
            oldStatus: existingUserGuidanceRequestData.status,
            newStatus: newStatus,
            actionDate: currentActionDateTime,
            actionByUserId: actionByUserId,
            actionByUserType: actionByUserType,
          },
        ];

        if (!existingUserGuidanceRequestData.scheduleMeetingDetails) {
          global.logger.error(
            "Schedule meeting details not found in existing guidance request",
            {
              methodName: this.updateUserGuidanceRequestByWorkoAdmin.name,
              updateStatus: newStatus,
            }
          );
          throw new BaseError(
            "You should assign mentor before submitting meeting link",
            HttpStatusCode.BAD_REQUEST_400
          );
        }

        updateData = {
          status: newStatus,
          statusTracker: statusTrackerData,
          scheduleMeetingDetails: {
            ...existingUserGuidanceRequestData.scheduleMeetingDetails,
            meetingLink: meetingLink,
          },
          updatedByUserId: actionByUserId,
        };

        break;
      }

      case UserGuidanceRequestStatusEnum.MEETING_RESCHEDULE_CONFIRMED: {
        const { meetingLink, scheduleMeetingDetails } = validatedRequestBody;
        if (!meetingLink || !scheduleMeetingDetails) {
          global.logger.error("Missing required fields", {
            methodName: this.updateUserGuidanceRequestByWorkoAdmin.name,
            updateStatus: newStatus,
            requiredFields: ["meetingLink", "scheduleMeetingDetails"],
          });
          throw new BaseError(
            "Missing required fields",
            HttpStatusCode.BAD_REQUEST_400
          );
        }

        const statusTrackerData: UserGuidanceRequestStatusTrackerDto[] = [
          ...existingUserGuidanceRequestData.statusTracker,
          {
            oldStatus: existingUserGuidanceRequestData.status,
            newStatus: newStatus,
            actionDate: currentActionDateTime,
            actionByUserId: actionByUserId,
            actionByUserType: actionByUserType,
          },
        ];

        if (!existingUserGuidanceRequestData.scheduleMeetingDetails) {
          global.logger.error(
            "Schedule meeting details not found in existing guidance request",
            {
              methodName: this.updateUserGuidanceRequestByWorkoAdmin.name,
              updateStatus: newStatus,
            }
          );
          throw new BaseError(
            "You should assign mentor before submitting meeting link",
            HttpStatusCode.BAD_REQUEST_400
          );
        }

        updateData = {
          status: newStatus,
          statusTracker: statusTrackerData,
          scheduleMeetingDetails: {
            ...scheduleMeetingDetails,
            meetingLink: meetingLink,
          },
          updatedByUserId: actionByUserId,
        };

        break;
      }

      case UserGuidanceRequestStatusEnum.PROJECT_COMPLETED: {
        const statusTrackerData: UserGuidanceRequestStatusTrackerDto[] = [
          ...existingUserGuidanceRequestData.statusTracker,
          {
            oldStatus: existingUserGuidanceRequestData.status,
            newStatus: newStatus,
            actionDate: currentActionDateTime,
            actionByUserId: actionByUserId,
            actionByUserType: actionByUserType,
          },
        ];

        updateData = {
          status: newStatus,
          statusTracker: statusTrackerData,
          updatedByUserId: actionByUserId,
        };

        break;
      }

      default: {
        throw new BaseError("Invalid status", HttpStatusCode.BAD_REQUEST_400);
      }
    }

    // Update guidance request
    let updatedGuidanceRequest: DbUserGuidanceRequestDto =
      await this.updateUserGuidanceRequestByIdAndEmail(
        existingUserGuidanceRequestData.id,
        getEmailFromPK(existingUserGuidanceRequestData.PK),
        updateData
      );

    // Send email to candidate
    await this.sendEmailToCandidateUserGuidanceRequest(updatedGuidanceRequest);

    // Send email to mentor
    await this.sendEmailToMentorUserGuidanceRequest(updatedGuidanceRequest);

    // Send email to worko-admin
    await this.sendEmailToWorkoAdminUserGuidanceRequest(updatedGuidanceRequest);

    return updatedGuidanceRequest;
  }

  async sendEmailToCandidateUserGuidanceRequest(
    updatedUserGuidanceRequest: DbUserGuidanceRequestDto
  ) {
    const candidateDetails: DbUserDetailDto =
      await UserDetailService.getUserByIdOne(
        updatedUserGuidanceRequest.createdByUserId
      );

    const { name: candidateName } = candidateDetails;
    const titleCaseCandidateName: string = candidateName.toTitleCase();

    const toAddress: EmailSourceDestinationAddress = {
      email: updatedUserGuidanceRequest.PK.split("#")[2],
      fullName: titleCaseCandidateName,
    };

    switch (updatedUserGuidanceRequest.status) {
      case UserGuidanceRequestStatusEnum.CANCELLED: {
        // Construct the email placeholders object
        const cancelledEmailPlaceholdersToCandidate: EmailTemplatePlaceholderCAND_USER_GUIDANCE_REQUEST_CANCELLED_UPDATE_STATUS =
          {
            candidateName: titleCaseCandidateName,
            ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
          };

        // Send email to the corporate user
        await emailLibrary.sendEmail(
          EmailTemplateEnum.CAND_USER_GUIDANCE_REQUEST_CANCELLED_UPDATE_STATUS,
          toAddress,
          cancelledEmailPlaceholdersToCandidate
        );
        break;
      }

      case UserGuidanceRequestStatusEnum.MENTOR_ASSIGNED: {
        if (!updatedUserGuidanceRequest.mentorDetails) {
          throw new BaseError(
            "Mentor details should be in system when status is 'Mentor Assigned'",
            HttpStatusCode.BAD_REQUEST_400
          );
        }

        const { userId, userEmail } = updatedUserGuidanceRequest.mentorDetails;

        const mentorCurrentExperience: QueryResponse<DbUserExperienceDto> =
          await UserExperienceService.get(userEmail);
        
        if(mentorCurrentExperience.count) {
          const mentorCurrentExperienceData: DbUserExperienceDto =
            mentorCurrentExperience[0];

          const { companyName: mentorCompanyName } = mentorCurrentExperienceData;

          const mentorDetails: DbUserDetailDto =
            await UserDetailService.getUserByIdOne(userId);

          const { name: mentorName } = mentorDetails;
          const titleCaseMentorName: string = mentorName.toTitleCase();

          // Construct the email placeholders object
          const mentorAssignedEmailPlaceholdersToCandidate: EmailTemplatePlaceholderCAND_USER_GUIDANCE_REQUEST_MENTOR_ASSIGNED_UPDATE_STATUS =
            {
              candidateName: titleCaseCandidateName,
              mentorName: titleCaseMentorName,
              mentorCompanyName: mentorCompanyName.toTitleCase(),
              ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
            };

          // Send email to the corporate user
          await emailLibrary.sendEmail(
            EmailTemplateEnum.CAND_USER_GUIDANCE_REQUEST_MENTOR_ASSIGNED_UPDATE_STATUS,
            toAddress,
            mentorAssignedEmailPlaceholdersToCandidate,
          );
        }

        break;
      }

      case UserGuidanceRequestStatusEnum.REJECTED: {
        // Construct the email placeholders object
        const rejectedEmailPlaceholdersToCandidate: EmailTemplatePlaceholderCAND_USER_GUIDANCE_REQUEST_REJECTED_UPDATE_STATUS =
          {
            candidateName: titleCaseCandidateName,
            ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
          };

        // Send email to the corporate user
        await emailLibrary.sendEmail(
          EmailTemplateEnum.CAND_USER_GUIDANCE_REQUEST_REJECTED_UPDATE_STATUS,
          toAddress,
          rejectedEmailPlaceholdersToCandidate
        );
        break;
      }

      case UserGuidanceRequestStatusEnum.PAYMENT_CONFIRMATION_DONE: {
        if (!updatedUserGuidanceRequest.mentorDetails) {
          throw new BaseError(
            "Mentor details should be in system when status is 'Payment Confirmation Done'",
            HttpStatusCode.BAD_REQUEST_400
          );
        }
        const paymentConfirmationDoneEmailPlaceholdersToCandidate: EmailTemplatePlaceholderCAND_USER_GUIDANCE_REQUEST_PAYMENT_CONFIRMATION_DONE =
          {
            candidateName: titleCaseCandidateName,
            mentorName:
              updatedUserGuidanceRequest.mentorDetails.name.toTitleCase(),
            ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
          };

        await emailLibrary.sendEmail(
          EmailTemplateEnum.CAND_USER_GUIDANCE_REQUEST_PAYMENT_CONFIRMATION_DONE,
          toAddress,
          paymentConfirmationDoneEmailPlaceholdersToCandidate
        );
        break;
      }

      case UserGuidanceRequestStatusEnum.MEETING_CONFIRMED: {
        const { mentorDetails, scheduleMeetingDetails } =
          updatedUserGuidanceRequest;
        if (
          !mentorDetails ||
          !scheduleMeetingDetails ||
          !scheduleMeetingDetails.meetingLink
        ) {
          throw new BaseError(
            "Required details are missing in system when status is 'Meeting Confirmed'",
            HttpStatusCode.BAD_REQUEST_400
          );
        }

        const meetingConfirmedEmailPlaceholdersToCandidate: EmailTemplatePlaceholderCAND_USER_GUIDANCE_REQUEST_MEETING_CONFIRMED_UPDATE_STATUS =
          {
            candidateName: titleCaseCandidateName,
            mentorName: mentorDetails.name.toTitleCase(),
            date: dateHelperObj.formatDateToDayMonthYear(
              scheduleMeetingDetails.date
            ),
            time: scheduleMeetingDetails.time,
            duration: scheduleMeetingDetails.duration,
            videoCallLink: scheduleMeetingDetails.meetingLink,
            ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
          };

        await emailLibrary.sendEmail(
          EmailTemplateEnum.CAND_USER_GUIDANCE_REQUEST_MEETING_CONFIRMED_UPDATE_STATUS,
          toAddress,
          meetingConfirmedEmailPlaceholdersToCandidate
        );
        break;
      }

      case UserGuidanceRequestStatusEnum.MEETING_RESCHEDULE_REQUESTED_BY_CANDIDATE: {
        const { mentorDetails } = updatedUserGuidanceRequest;
        if (!mentorDetails) {
          throw new BaseError(
            "Mentor details are missing in system when status is 'Meeting Reschedule Requested By Candidate'",
            HttpStatusCode.BAD_REQUEST_400
          );
        }

        const meetingRescheduleRequestedByEmailPlaceholdersToCandidate: EmailTemplatePlaceholderCAND_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_REQUESTED_BY_CAND =
          {
            candidateName: titleCaseCandidateName,
            mentorName: mentorDetails.name.toTitleCase(),
            ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
          };

        await emailLibrary.sendEmail(
          EmailTemplateEnum.CAND_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_REQUESTED_BY_CAND,
          toAddress,
          meetingRescheduleRequestedByEmailPlaceholdersToCandidate
        );
        break;
      }

      case UserGuidanceRequestStatusEnum.MEETING_RESCHEDULE_REQUESTED_BY_MENTOR: {
        const { mentorDetails } = updatedUserGuidanceRequest;
        if (!mentorDetails) {
          throw new BaseError(
            "Mentor details are missing in system when status is 'Meeting Reschedule Requested By Mentor'",
            HttpStatusCode.BAD_REQUEST_400
          );
        }

        const meetingRescheduleRequestedByMentorEmailPlaceholdersToCandidate: EmailTemplatePlaceholderCAND_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_REQUESTED_BY_EMP =
          {
            candidateName: titleCaseCandidateName,
            mentorName: mentorDetails.name.toTitleCase(),
            workoAppUrl: APP_CONSTANTS.FRONTEND_URLS.WORKO_APP_URL,
            ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
          };

        await emailLibrary.sendEmail(
          EmailTemplateEnum.CAND_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_REQUESTED_BY_EMP,
          toAddress,
          meetingRescheduleRequestedByMentorEmailPlaceholdersToCandidate
        );
        break;
      }

      case UserGuidanceRequestStatusEnum.MEETING_RESCHEDULE_CONFIRMED: {
        const { mentorDetails, scheduleMeetingDetails } =
          updatedUserGuidanceRequest;
        if (
          !mentorDetails ||
          !scheduleMeetingDetails ||
          !scheduleMeetingDetails.meetingLink
        ) {
          throw new BaseError(
            "Required details are missing in system when status is 'Meeting Confirmed'",
            HttpStatusCode.BAD_REQUEST_400
          );
        }

        const meetingRescheduleConfirmedEmailPlaceholdersToCandidate: EmailTemplatePlaceholderCAND_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_CONFIRMED =
          {
            candidateName: titleCaseCandidateName,
            mentorName: mentorDetails.name.toTitleCase(),
            date: dateHelperObj.formatDateToDayMonthYear(
              scheduleMeetingDetails.date
            ),
            time: scheduleMeetingDetails.time,
            duration: scheduleMeetingDetails.duration,
            videoCallLink: scheduleMeetingDetails.meetingLink,
            ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
          };

        await emailLibrary.sendEmail(
          EmailTemplateEnum.CAND_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_CONFIRMED,
          toAddress,
          meetingRescheduleConfirmedEmailPlaceholdersToCandidate
        );
        break;
      }

      case UserGuidanceRequestStatusEnum.PROJECT_COMPLETED: {
        const { mentorDetails } = updatedUserGuidanceRequest;
        if (!mentorDetails) {
          throw new BaseError(
            "Mentor details are missing in system when status is 'Project Completed'",
            HttpStatusCode.BAD_REQUEST_400
          );
        }

        const projectCompletedEmailPlaceholdersToCandidate: EmailTemplatePlaceholderCAND_USER_GUIDANCE_REQUEST_PROJECT_COMPLETED =
          {
            candidateName: titleCaseCandidateName,
            mentorName: mentorDetails.name.toTitleCase(),
            ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
          };

        await emailLibrary.sendEmail(
          EmailTemplateEnum.CAND_USER_GUIDANCE_REQUEST_PROJECT_COMPLETED,
          toAddress,
          projectCompletedEmailPlaceholdersToCandidate
        );

        break;
      }

      default: {
        break;
      }
    }
  }

  async sendEmailToMentorUserGuidanceRequest(
    updatedUserGuidanceRequest: DbUserGuidanceRequestDto
  ) {
    const candidateDetails: DbUserDetailDto =
      await UserDetailService.getUserByIdOne(
        updatedUserGuidanceRequest.createdByUserId
      );

    const { name: candidateName } = candidateDetails;
    const titleCaseCandidateName: string = candidateName.toTitleCase();

    const toAddress: EmailSourceDestinationAddress = {
      email: updatedUserGuidanceRequest.PK.split("#")[2],
      fullName: titleCaseCandidateName,
    };

    switch (updatedUserGuidanceRequest.status) {
      case UserGuidanceRequestStatusEnum.MENTOR_ASSIGNED: {
        if (!updatedUserGuidanceRequest.mentorDetails) {
          throw new BaseError(
            "Mentor details are missing in system when status is 'Mentor Assigned'",
            HttpStatusCode.BAD_REQUEST_400
          );
        }

        const emailMentorAssignedPlaceholdersToMentor: EmailTemplatePlaceholderMENTOR_USER_GUIDANCE_REQUEST_MENTOR_ASSIGNED_UPDATE_STATUS =
          {
            candidateName: titleCaseCandidateName,
            mentorName:
              updatedUserGuidanceRequest.mentorDetails.name.toTitleCase(),
            companyName: updatedUserGuidanceRequest.companyName.toTitleCase(),
            jobUrl: updatedUserGuidanceRequest.jobUrl,
            guidanceRequestType: updatedUserGuidanceRequest.guidanceRequestType,
            ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
          };

        await emailLibrary.sendEmail(
          EmailTemplateEnum.MENTOR_USER_GUIDANCE_REQUEST_MENTOR_ASSIGNED_UPDATE_STATUS,
          toAddress,
          emailMentorAssignedPlaceholdersToMentor
        );
        break;
      }

      case UserGuidanceRequestStatusEnum.CANCELLED: {
        if (!updatedUserGuidanceRequest.mentorDetails) {
          throw new BaseError(
            "Mentor details are missing in system when status is 'Cancelled'",
            HttpStatusCode.BAD_REQUEST_400
          );
        }
        const emailCancelledPlaceholdersToMentor: EmailTemplatePlaceholderMENTOR_USER_GUIDANCE_REQUEST_CANCELLED_UPDATE_STATUS =
          {
            candidateName: titleCaseCandidateName,
            mentorName:
              updatedUserGuidanceRequest.mentorDetails.name.toTitleCase(),
            ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
          };

        await emailLibrary.sendEmail(
          EmailTemplateEnum.MENTOR_USER_GUIDANCE_REQUEST_CANCELLED_UPDATE_STATUS,
          toAddress,
          emailCancelledPlaceholdersToMentor
        );
        break;
      }

      case UserGuidanceRequestStatusEnum.MEETING_CONFIRMED: {
        const { mentorDetails, scheduleMeetingDetails } =
          updatedUserGuidanceRequest;
        if (
          !mentorDetails ||
          !scheduleMeetingDetails ||
          !scheduleMeetingDetails.meetingLink
        ) {
          throw new BaseError(
            "Required details are missing in system when status is 'Meeting Confirmed'",
            HttpStatusCode.BAD_REQUEST_400
          );
        }

        const meetingConfirmedEmailPlaceholderToCandidate: EmailTemplatePlaceholderMENTOR_USER_GUIDANCE_REQUEST_MEETING_CONFIRMED_UPDATE_STATUS =
          {
            candidateName: titleCaseCandidateName,
            mentorName: mentorDetails.name.toTitleCase(),
            date: dateHelperObj.formatDateToDayMonthYear(
              scheduleMeetingDetails.date
            ),
            time: scheduleMeetingDetails.time,
            guidanceRequestType: updatedUserGuidanceRequest.guidanceRequestType,
            workoAppUrl: APP_CONSTANTS.FRONTEND_URLS.WORKO_APP_URL,
            ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
          };

        await emailLibrary.sendEmail(
          EmailTemplateEnum.MENTOR_USER_GUIDANCE_REQUEST_MEETING_CONFIRMED_UPDATE_STATUS,
          toAddress,
          meetingConfirmedEmailPlaceholderToCandidate
        );
        break;
      }

      case UserGuidanceRequestStatusEnum.MEETING_RESCHEDULE_CONFIRMED: {
        const { mentorDetails, scheduleMeetingDetails } =
          updatedUserGuidanceRequest;
        if (
          !mentorDetails ||
          !scheduleMeetingDetails ||
          !scheduleMeetingDetails.meetingLink
        ) {
          throw new BaseError(
            "Required details are missing in system when status is 'Meeting Confirmed'",
            HttpStatusCode.BAD_REQUEST_400
          );
        }

        const meetingRescheduleConfirmedEmailPlaceholders: EmailTemplatePlaceholderMENTOR_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_CONFIRMED =
          {
            candidateName: titleCaseCandidateName,
            mentorName: mentorDetails.name.toTitleCase(),
            date: dateHelperObj.formatDateToDayMonthYear(
              scheduleMeetingDetails.date
            ),
            time: scheduleMeetingDetails.time,
            workoAppUrl: APP_CONSTANTS.FRONTEND_URLS.WORKO_APP_URL,
            ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
          };

        await emailLibrary.sendEmail(
          EmailTemplateEnum.CAND_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_CONFIRMED,
          toAddress,
          meetingRescheduleConfirmedEmailPlaceholders
        );
        break;
      }
      default: {
        break;
      }
    }
  }

  async sendEmailToWorkoAdminUserGuidanceRequest(
    updatedUserGuidanceRequest: DbUserGuidanceRequestDto
  ) {
    const candidateDetails: DbUserDetailDto =
      await UserDetailService.getUserByIdOne(
        updatedUserGuidanceRequest.createdByUserId
      );

    const { name: candidateName } = candidateDetails;
    const titleCaseCandidateName: string = candidateName.toTitleCase();

    const toAddress: EmailSourceDestinationAddress = {
      email: updatedUserGuidanceRequest.PK.split("#")[2],
      fullName: titleCaseCandidateName,
    };

    switch (updatedUserGuidanceRequest.status) {
      case UserGuidanceRequestStatusEnum.CANCELLED: {
        if (!updatedUserGuidanceRequest.mentorDetails) {
          throw new BaseError(
            "Mentor details should be in system when status is 'Cancelled'",
            HttpStatusCode.BAD_REQUEST_400
          );
        }

        // Construct the email placeholders object
        const cancelledEmailPlaceholders: EmailTemplatePlaceholderADMIN_USER_GUIDANCE_REQUEST_CANCELLED_UPDATE_STATUS =
          {
            candidateName: titleCaseCandidateName,
            mentorName: updatedUserGuidanceRequest.mentorDetails.name.toTitleCase(),
            guidanceRequestType: updatedUserGuidanceRequest.guidanceRequestType.toTitleCase(),
            workoAppUrl: APP_CONSTANTS.FRONTEND_URLS.WORKO_APP_URL,
            ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
          };

        await emailLibrary.sendEmail(
          EmailTemplateEnum.CAND_USER_GUIDANCE_REQUEST_CANCELLED_UPDATE_STATUS,
          toAddress,
          cancelledEmailPlaceholders
        );
        break;
      }

      case UserGuidanceRequestStatusEnum.MEETING_RESCHEDULE_REQUESTED_BY_CANDIDATE: {
        const { mentorDetails } = updatedUserGuidanceRequest;
        if (!mentorDetails) {
          throw new BaseError(
            "Mentor details are missing in system when status is 'Meeting Reschedule Requested By Candidate'",
            HttpStatusCode.BAD_REQUEST_400
          );
        }

        const meetingRescheduleRequestedByEmailPlaceholders: EmailTemplatePlaceholderADMIN_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_REQUESTED_BY_CAND =
          {
            candidateName: titleCaseCandidateName,
            mentorName: mentorDetails.name.toTitleCase(),
            workoAppUrl: APP_CONSTANTS.FRONTEND_URLS.WORKO_APP_URL,
            ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
          };

        await emailLibrary.sendEmail(
          EmailTemplateEnum.CAND_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_REQUESTED_BY_CAND,
          toAddress,
          meetingRescheduleRequestedByEmailPlaceholders
        );
        break;
      }

      case UserGuidanceRequestStatusEnum.MEETING_RESCHEDULE_REQUESTED_BY_MENTOR: {
        const { mentorDetails } = updatedUserGuidanceRequest;
        if (!mentorDetails) {
          throw new BaseError(
            "Mentor details are missing in system when status is 'Meeting Reschedule Requested By Mentor'",
            HttpStatusCode.BAD_REQUEST_400
          );
        }

        const meetingRescheduleRequestedByMentorEmailPlaceholders: EmailTemplatePlaceholderADMIN_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_REQUESTED_BY_EMP =
          {
            candidateName: titleCaseCandidateName,
            mentorName: mentorDetails.name.toTitleCase(),
            workoAppUrl: APP_CONSTANTS.FRONTEND_URLS.WORKO_APP_URL,
            ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
          };

        await emailLibrary.sendEmail(
          EmailTemplateEnum.CAND_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_REQUESTED_BY_EMP,
          toAddress,
          meetingRescheduleRequestedByMentorEmailPlaceholders
        );
        break;
      }

      default: {
        break;
      }
    }
  }

  async updateUserGuidanceRequestByCandidate(
    userGuidanceRequestId: string,
    validatedRequestBody: UserGuidanceRequestUpdateByCandidateApiDto
  ): Promise<DbUserGuidanceRequestDto> {
    global.logger.info("Update user guidance request by candidate [service]", {
      methodName: this.updateUserGuidanceRequestByCandidate.name,
    });

    const { existingUserGuidanceRequestData, currentActionDateTime } =
      await this.updateUserGuidanceRequestByActorPreRequisites(
        userGuidanceRequestId
      );

    if (
      existingUserGuidanceRequestData.status ===
        UserGuidanceRequestStatusEnum.CANCELLED &&
      validatedRequestBody.newStatus === UserGuidanceRequestStatusEnum.CANCELLED
    ) {
      throw new BaseError(
        "Guidance request is already cancelled",
        HttpStatusCode.BAD_REQUEST_400
      );
    }

    let updateData: Partial<UserGuidanceRequestCommonUpdateDto>;

    const { newStatus, actionByUserId, actionByUserType } =
      validatedRequestBody;

    switch (newStatus) {
      case UserGuidanceRequestStatusEnum.CANCELLED: {
        const { cancelReason } = validatedRequestBody;

        if (!cancelReason) {
          global.logger.error("Missing required fields", {
            methodName: this.updateUserGuidanceRequestByWorkoAdmin.name,
            updateStatus: newStatus,
            requiredFields: ["cancelReason"],
          });
          throw new BaseError(
            "Missing required fields",
            HttpStatusCode.BAD_REQUEST_400
          );
        }

        const statusTrackerData: UserGuidanceRequestStatusTrackerDto[] = [
          ...existingUserGuidanceRequestData.statusTracker,
          {
            oldStatus: existingUserGuidanceRequestData.status,
            newStatus: newStatus,
            actionDate: currentActionDateTime,
            actionByUserId: actionByUserId,
            actionByUserType: actionByUserType,
          },
        ];

        updateData = {
          status: newStatus,
          statusTracker: statusTrackerData,
          cancelledByDetails: {
            actionByUserId: actionByUserId,
            actionByUserType: actionByUserType,
            actionDate: currentActionDateTime,
            reason: cancelReason,
          },
          updatedByUserId: actionByUserId,
        };

        break;
      }

      case UserGuidanceRequestStatusEnum.PAYMENT_CONFIRMATION_PENDING: {
        const statusTrackerData: UserGuidanceRequestStatusTrackerDto[] = [
          ...existingUserGuidanceRequestData.statusTracker,
          {
            oldStatus: existingUserGuidanceRequestData.status,
            newStatus: newStatus,
            actionDate: currentActionDateTime,
            actionByUserId: actionByUserId,
            actionByUserType: actionByUserType,
          },
        ];

        updateData = {
          status: newStatus,
          statusTracker: statusTrackerData,
          paymentConfirmationPendingDetails: {
            actionByUserId: actionByUserId,
            actionByUserType: actionByUserType,
            actionDate: currentActionDateTime,
          },
          updatedByUserId: actionByUserId,
        };

        break;
      }

      case UserGuidanceRequestStatusEnum.MEETING_RESCHEDULE_REQUESTED_BY_CANDIDATE: {
        const { reScheduleRequestDate, reScheduleRequestTime } =
          validatedRequestBody;

        if (
          !reScheduleRequestDate ||
          !reScheduleRequestTime ||
          reScheduleRequestDate === "" ||
          reScheduleRequestTime === ""
        ) {
          global.logger.error("Missing required fields", {
            methodName: this.updateUserGuidanceRequestByWorkoAdmin.name,
            updateStatus: newStatus,
            requiredFields: ["reScheduleRequestDate", "reScheduleRequestTime"],
          });
          throw new BaseError(
            "Missing required fields",
            HttpStatusCode.BAD_REQUEST_400
          );
        }

        const statusTrackerData: UserGuidanceRequestStatusTrackerDto[] = [
          ...existingUserGuidanceRequestData.statusTracker,
          {
            oldStatus: existingUserGuidanceRequestData.status,
            newStatus: newStatus,
            actionDate: currentActionDateTime,
            actionByUserId: actionByUserId,
            actionByUserType: actionByUserType,
          },
        ];

        updateData = {
          status: newStatus,
          statusTracker: statusTrackerData,
          rescheduleMeetingDetails: [
            ...(existingUserGuidanceRequestData.rescheduleMeetingDetails ?? []),
            {
              date: reScheduleRequestDate,
              time: reScheduleRequestTime,
              actionByUserId: actionByUserId,
              actionByUserType: actionByUserType,
              actionDate: currentActionDateTime,
            },
          ],
          updatedByUserId: actionByUserId,
        };

        break;
      }

      default: {
        throw new BaseError("Invalid status", HttpStatusCode.BAD_REQUEST_400);
      }
    }

    // Update guidance request
    let updatedGuidanceRequest: DbUserGuidanceRequestDto =
      await this.updateUserGuidanceRequestByIdAndEmail(
        existingUserGuidanceRequestData.id,
        getEmailFromPK(existingUserGuidanceRequestData.PK),
        updateData
      );

    // Send email to candidate
    await this.sendEmailToCandidateUserGuidanceRequest(updatedGuidanceRequest);

    // Send email to mentor
    await this.sendEmailToMentorUserGuidanceRequest(updatedGuidanceRequest);

    // Send email to worko-admin
    await this.sendEmailToWorkoAdminUserGuidanceRequest(updatedGuidanceRequest);

    return updatedGuidanceRequest;
  }

  async updateUserGuidanceRequestByMentor(
    userGuidanceRequestId: string,
    validatedRequestBody: UserGuidanceRequestUpdateByMentorApiDto
  ) {
    global.logger.info("Update user guidance request by mentor [service]", {
      methodName: this.updateUserGuidanceRequestByMentor.name,
    });

    const { existingUserGuidanceRequestData, currentActionDateTime } =
      await this.updateUserGuidanceRequestByActorPreRequisites(
        userGuidanceRequestId
      );

    let updateData: Partial<UserGuidanceRequestCommonUpdateDto>;

    const { newStatus, actionByUserId, actionByUserType } =
      validatedRequestBody;

    switch (newStatus) {
      case UserGuidanceRequestStatusEnum.MEETING_RESCHEDULE_REQUESTED_BY_MENTOR: {
        const { reScheduleRequestDate, reScheduleRequestTime } =
          validatedRequestBody;

        if (
          !reScheduleRequestDate ||
          !reScheduleRequestTime ||
          reScheduleRequestDate === "" ||
          reScheduleRequestTime === ""
        ) {
          global.logger.error("Missing required fields", {
            methodName: this.updateUserGuidanceRequestByMentor.name,
            updateStatus: newStatus,
            requiredFields: ["reScheduleRequestDate", "reScheduleRequestTime"],
          });
          throw new BaseError(
            "Missing required fields",
            HttpStatusCode.BAD_REQUEST_400
          );
        }

        const statusTrackerData: UserGuidanceRequestStatusTrackerDto[] = [
          ...existingUserGuidanceRequestData.statusTracker,
          {
            oldStatus: existingUserGuidanceRequestData.status,
            newStatus: newStatus,
            actionDate: currentActionDateTime,
            actionByUserId: actionByUserId,
            actionByUserType: actionByUserType,
          },
        ];

        updateData = {
          status: newStatus,
          statusTracker: statusTrackerData,
          rescheduleMeetingDetails: [
            ...(existingUserGuidanceRequestData.rescheduleMeetingDetails ?? []),
            {
              date: reScheduleRequestDate,
              time: reScheduleRequestTime,
              actionByUserId: actionByUserId,
              actionByUserType: actionByUserType,
              actionDate: currentActionDateTime,
            },
          ],
          updatedByUserId: actionByUserId,
        };
        break;
      }

      default: {
        throw new BaseError("Invalid status", HttpStatusCode.BAD_REQUEST_400);
      }
    }

    // Update guidance request
    let updatedGuidanceRequest: DbUserGuidanceRequestDto =
      await this.updateUserGuidanceRequestByIdAndEmail(
        existingUserGuidanceRequestData.id,
        getEmailFromPK(existingUserGuidanceRequestData.PK),
        updateData
      );

    // Send email to candidate
    await this.sendEmailToCandidateUserGuidanceRequest(updatedGuidanceRequest);

    // Send email to mentor
    await this.sendEmailToMentorUserGuidanceRequest(updatedGuidanceRequest);

    // Send email to worko-admin
    await this.sendEmailToWorkoAdminUserGuidanceRequest(updatedGuidanceRequest);

    return updatedGuidanceRequest;
  }
}

const userGuidanceRequestServiceObj = new UserGuidanceRequestService();

export { userGuidanceRequestServiceObj, UserGuidanceRequestService };
