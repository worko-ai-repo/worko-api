// import dynamoose types
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// import luxon
import { DateTime } from "luxon";

// import constants
import APP_CONSTANTS from "../configs/constants.config";

// import daos
import { userJobApplicationDao } from "../daos/UserJobApplication.dao";

// import dtos
import { UserJobApplicationCreateApiDTO, UserJobApplicationInternalUpdateDto, UserJobApplicationListingFilterOptions, UserJobApplicationRequestFeedbackApiDTO, UserJobApplicationUpdateApiDTO } from "../dtos/UserJobApplication.dto";
import { PaginatedResultsWithMatchingConditionsInternalResponse, PaginatedResultsWithMatchingConditionsResponse } from "../dtos/Common.dto";
import { EmailTemplatePlaceholderCAND_RECEIVED_JOB_APPLICATION_CV_DOWNLOADED_STATUS_UPDATE, EmailTemplatePlaceholderCAND_RECEIVED_JOB_APPLICATION_HIRED_STATUS_UPDATE, EmailTemplatePlaceholderCAND_RECEIVED_JOB_APPLICATION_NOTIFICATION, EmailTemplatePlaceholderCAND_RECEIVED_JOB_APPLICATION_REJECTED_STATUS_UPDATE, EmailTemplatePlaceholderCAND_RECEIVED_JOB_APPLICATION_UNDER_EVALUATION_STATUS_UPDATE, EmailTemplatePlaceholderCORP_RECEIVED_JOB_APPLICATION_NOTIFICATION, EmailTemplatePlaceholderCORP_RECEIVED_JOB_APPLICATION_STATUS_UPDATE_NOTIFICATION, EmailTemplatePlaceholderCORP_REQUEST_FEEDBACK_NOTIFICATION } from "../dtos/EmailTemplatePlaceholder.dto";

// import enums
import { JobApplicationStatus } from "../enums/UserJobApplication.enum";
import { EmailTemplateEnum } from "../enums/EmailTemplate.enum";
import { UserType } from "../enums/User.enum";
import { CompanyJobStatusEnum } from "../enums/CompanyJob.enum";

// import libraries
import { emailLibrary, EmailSourceDestinationAddress } from "../libraries/email.library";

// import models
import { DbUserJobApplicationDto } from "../db/models/UserJobApplication.model";
import { DbUserDetailDto } from "../db/models/UserDetail.model";
import { DbCorporateUserDto } from "../db/models/CorporateUser.model";
import { DbCompanyJobDto } from "../db/models/CompanyJob.model";

// import services
import UserDetailService from "./UserDetail.service";
import { companyJobServiceObj } from "../admin/services/CompanyJob.service";
import userDetailServiceObj from "../services/UserDetail.service"
import { corporateUserServiceObj } from "./CorporateUser.service";

// import types
import { UserDetailProfileInfoType } from "../types/UserDetail.type";
import { JobApplicationStatusTrackerType, JobApplicationStatusType, JobApplicationWithUserDetailsType } from "../types/UserJobApplication.type";
import { EmailPlaceholderDetailsToJobPosterType } from "../types/EmailTemplatePlaceholder.type";

// import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 * UserJobApplicationService
 * 
 * Service for handling user job application-related operations
 */
class UserJobApplicationService {
  /**
   * createJobApplication
   *
   * Creates a new job application for a candidate
   *
   * @param {UserJobApplicationCreateApiDTO} jobApplicationRequestBody - The job application request body
   * @param {string} emailId - The email id of the user applying for the job
   * @throws {BaseError} If the user has already applied for the job
   * @returns {Promise<DbUserJobApplicationDto>} The job application request id
   */
  async createJobApplication(
    jobApplicationRequestBody: UserJobApplicationCreateApiDTO,
    emailId: string,
    userId: string
  ): Promise<DbUserJobApplicationDto> {
    global.logger.info("Create Job Application [Service]", {
      filePath: __filename,
      methodName: this.createJobApplication.name,
    });

    // Fetch job details based on job ID
    const jobDetails: DbCompanyJobDto = (
      await companyJobServiceObj.getJobById(jobApplicationRequestBody.jobId)
    )[0];

    // Throw error if job is not published
    if (jobDetails.status !== CompanyJobStatusEnum.PUBLISHED) {
      throw new BaseError(
        `Applications for this job are currently closed.`,
        HttpStatusCode.FORBIDDEN_403
      );
    }

    // Decode job url
    let decodedJobUrl: string = decodeURIComponent(
      jobApplicationRequestBody.jobUrl
    ).trim();

    // check if the user has already applied for the job and throw error if already applied for the job
    let existingJobApplication: QueryResponse<DbUserJobApplicationDto> =
      await userJobApplicationDao.getJobApplicationForCandByjobUrl(
        emailId,
        decodedJobUrl
      );
    if (existingJobApplication.count) {
      throw new BaseError(
        `You have already applied for this job. Check your dashboard for reference.`,
        HttpStatusCode.FORBIDDEN_403
      );
    }

    // return job application request id
    return userJobApplicationDao.createJobApplication(
      jobApplicationRequestBody,
      emailId,
      userId
    );
  }

  /**
   * getJobApplicationById
   *
   * Retrieves and parses the job application details by job application ID.
   *
   * This method fetches the job application details using the provided ID,
   * parses the details, and returns the parsed job application data. If the
   * job application details are not found, it throws a `BaseError`.
   *
   * @param {string} jobApplicationId - The job application ID.
   * @throws {BaseError} If the job application details are not found.
   * @returns {Promise<DbUserJobApplicationDto>} A promise that resolves to the parsed job application data.
   */
  async getJobApplicationById(
    jobApplicationId: string
  ): Promise<DbUserJobApplicationDto> {
    global.logger.info(
      "Get Job Application By Id with Parsing Details and throw error if not found [Service]",
      {
        filePath: __filename,
        methodName: this.getJobApplicationById.name,
        jobApplicationId,
      }
    );

    // Fetch job application details using job application ID
    const jobAppliactionDetails: QueryResponse<DbUserJobApplicationDto> =
      await userJobApplicationDao.getJobApplicationById(jobApplicationId);

    // If job application details are not found, throw an error
    if (!jobAppliactionDetails.count) {
      throw new BaseError(
        `The job application details not found".`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    return jobAppliactionDetails[0];
  }

  /**
   * getJobApplicationScore
   *
   * Retrieves the matching score for the job application with the specified
   * job application ID.
   *
   * @param {string} jobApplicationId - The job application ID.
   * @returns {Promise<QueryResponse<DbUserJobApplicationDto>>} A promise that resolves to the matching score of the job application
   */
  async getJobApplicationScore(
    jobApplicationId: string
  ): Promise<DbUserJobApplicationDto> {
    global.logger.info("Get Job Application Score [Service]", {
      filePath: __filename,
      methodName: this.getJobApplicationScore.name,
    });

    // Fetch job application details using job application ID
    const jobAppliactionDetails: QueryResponse<DbUserJobApplicationDto> =
      await userJobApplicationDao.getJobApplicationScore(jobApplicationId);

    // If job application details are not found, throw an error
    if (!jobAppliactionDetails.count) {
      throw new BaseError(
        `The job application details not found".`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    return jobAppliactionDetails[0];
  }

  /**
   * prepareJobApplicationsWithUserDetails
   *
   * Prepares job applications by attaching user details to each job application.
   *
   * @param {PaginatedResultsWithMatchingConditionsResponse<DbUserJobApplicationDto>} jobApplications - The job applications to prepare.
   * @returns {Promise<PaginatedResultsWithMatchingConditionsInternalResponse<JobApplicationWithUserDetailsType[]>>} A promise that resolves to the prepared job applications with user details.
   */
  async prepareJobApplicationsWithUserDetails(
    jobApplications: PaginatedResultsWithMatchingConditionsResponse<DbUserJobApplicationDto>
  ): Promise<
    PaginatedResultsWithMatchingConditionsInternalResponse<
      JobApplicationWithUserDetailsType[]
    >
  > {
    global.logger.info("Prepare job applications with user details [Service]", {
      filePath: __filename,
      methodName: this.prepareJobApplicationsWithUserDetails.name,
    });

    const {
      count,
      lastKey,
      timesQueried,
      queriedCount,
      ...restJobApplications
    } = jobApplications;

    const jobApplicationsArray: DbUserJobApplicationDto[] =
      Object.values(restJobApplications);

    // get unique user email ids
    const uniqueUserEmailIds: string[] = Array.from(
      new Set(jobApplicationsArray.map((item) => item.PK.split("#")[2]))
    );

    // get user details by unique user email ids
    const userDetailsArray: UserDetailProfileInfoType[] =
      await userDetailServiceObj.getUserDetailsByEmailIds(uniqueUserEmailIds);

    // Covert user details to map for easy access
    const userDetailsMap: Map<string, UserDetailProfileInfoType> = new Map(
      userDetailsArray.map((userProfileDetail: UserDetailProfileInfoType) => [
        userProfileDetail.userDetails.PK.split("#")[2],
        userProfileDetail,
      ])
    );

    // attach user details to job applications
    const jobApplicationsWithUserDetails: JobApplicationWithUserDetailsType[] =
      await Promise.all(
        jobApplicationsArray.map(
          async (eachJobApplication: DbUserJobApplicationDto) => {
            // get user details for each job application
            const userDetails: UserDetailProfileInfoType | undefined =
              userDetailsMap.get(eachJobApplication.PK.split("#")[2]);

            // if user details not found, return job application without applicant details
            if (!userDetails) {
              return {
                ...eachJobApplication,
                applicantDetails: undefined,
              };
            }

            const jobAppliactionDetailWithUserDetail: JobApplicationWithUserDetailsType =
              {
                ...eachJobApplication,
                applicantDetails: {
                  ...userDetails.userDetails,
                  profileImageAwsS3SignedUrl:
                    userDetails.profileImageAwsS3SignedUrl,
                  cvAwsS3SignedUrl: userDetails.cvAwsS3SignedUrl,
                },
              };

            return jobAppliactionDetailWithUserDetail;
          }
        )
      );

    // attach user details to job applications with pagination
    const paginatedJobApplicationsWithUserDetails: PaginatedResultsWithMatchingConditionsInternalResponse<
      JobApplicationWithUserDetailsType[]
    > = {
      data: jobApplicationsWithUserDetails,
      lastKey,
      count,
      timesQueried,
      queriedCount,
    };

    return paginatedJobApplicationsWithUserDetails;
  }

  /**
   * getJobApplicationsByFilterOptions
   *
   * Retrieves job applications that match the provided filter options. If the
   * user type is "CAND", then it returns job applications without attaching user
   * details. Otherwise, it will attach user details to each job application.
   *
   * @param {UserJobApplicationListingFilterOptions} jobApplicationRequestBody - The filter options for querying job applications.
   * @returns {Promise<PaginatedResultsWithMatchingConditionsResponse<DbUserJobApplicationDto> | Promise<PaginatedResultsWithMatchingConditionsInternalResponse<JobApplicationWithUserDetailsType[]>>>} A promise that resolves to the paginated results of job applications matching the filter conditions, with or without user details.
   */
  async getJobApplicationsByFilterOptions(
    jobApplicationRequestBody: UserJobApplicationListingFilterOptions
  ): Promise<
    | PaginatedResultsWithMatchingConditionsResponse<DbUserJobApplicationDto>
    | Promise<
        PaginatedResultsWithMatchingConditionsInternalResponse<
          JobApplicationWithUserDetailsType[]
        >
      >
  > {
    global.logger.info("Get Job Applications By filter options [Service]", {
      filePath: __filename,
      methodName: this.getJobApplicationsByFilterOptions.name,
    });

    // If the user is a candidate then return job applications without attaching user details
    if (jobApplicationRequestBody.userType === UserType.CAND) {
      const jobApplicationsWithoutUserDetails: Promise<
        PaginatedResultsWithMatchingConditionsResponse<DbUserJobApplicationDto>
      > = userJobApplicationDao.getJobApplicationsByFilterOptions(
        jobApplicationRequestBody
      );

      return jobApplicationsWithoutUserDetails;
    }

    // Fetch job applications
    const jobApplications: PaginatedResultsWithMatchingConditionsResponse<DbUserJobApplicationDto> =
      await userJobApplicationDao.getJobApplicationsByFilterOptions(
        jobApplicationRequestBody
      );

    // Prepare job applications
    const jobApplicationsWithUserDetails: Promise<
      PaginatedResultsWithMatchingConditionsInternalResponse<
        JobApplicationWithUserDetailsType[]
      >
    > = this.prepareJobApplicationsWithUserDetails(jobApplications);

    return jobApplicationsWithUserDetails;
  }

  /**
   * sendEmailToCandidateOnJobApplicationUpdate
   *
   * Sends an email to the candidate when their job application status is updated.
   *
   * @param {DbUserJobApplicationDto} updatedJobApplication - The updated job application data.
   * @param {DbUserDetailDto} candidateDetails - The parsed candidate details.
   * @returns {Promise<boolean>} A promise that resolves to true if the email was sent successfully.
   */
  async sendEmailToCandidateOnJobApplicationUpdate(
    updatedJobApplication: DbUserJobApplicationDto,
    candidateDetails: DbUserDetailDto
  ): Promise<boolean> {
    const toAddress: EmailSourceDestinationAddress = {
      email: updatedJobApplication.PK.split("#")[2],
      fullName: candidateDetails.name,
    };

    switch (updatedJobApplication.status) {
      case JobApplicationStatus.CV_DOWNLOADED:
        // Construct the email placeholders object
        const cvDownloadedEmailPlaceholders: EmailTemplatePlaceholderCAND_RECEIVED_JOB_APPLICATION_CV_DOWNLOADED_STATUS_UPDATE =
          {
            candName: candidateDetails.name.toTitleCase(),
            companyName: updatedJobApplication.companyName.toTitleCase(),
            jobTitle: updatedJobApplication.jobTitle.toTitleCase(),
            workoAppUrl: APP_CONSTANTS.WORKO_APP_DOMAIN,
            guidanceEmail: APP_CONSTANTS.GUIDANCE_EMAIL,
          };

        // Send email to the corporate user
        await emailLibrary.sendEmail(
          EmailTemplateEnum.CAND_RECEIVED_JOB_APPLICATION_CV_DOWNLOADED_STATUS_UPDATE,
          toAddress,
          cvDownloadedEmailPlaceholders
        );
        break;
      case JobApplicationStatus.UNDER_EVALUATION:
        // Construct the email placeholders object
        const underEvaluationEmailPlaceholders: EmailTemplatePlaceholderCAND_RECEIVED_JOB_APPLICATION_UNDER_EVALUATION_STATUS_UPDATE =
          {
            candName: candidateDetails.name.toTitleCase(),
            companyName: updatedJobApplication.companyName.toTitleCase(),
            jobTitle: updatedJobApplication.jobTitle.toTitleCase(),
            workoAppUrl: APP_CONSTANTS.WORKO_APP_DOMAIN,
            guidanceEmail: APP_CONSTANTS.GUIDANCE_EMAIL,
          };

        // Send email to the corporate user
        await emailLibrary.sendEmail(
          EmailTemplateEnum.CAND_RECEIVED_JOB_APPLICATION_UNDER_EVALUATION_STATUS_UPDATE,
          toAddress,
          underEvaluationEmailPlaceholders
        );
        break;
      case JobApplicationStatus.HIRED:
        // Construct the email placeholders object
        const hiredEmailPlaceholders: EmailTemplatePlaceholderCAND_RECEIVED_JOB_APPLICATION_HIRED_STATUS_UPDATE =
          {
            candName: candidateDetails.name.toTitleCase(),
            companyName: updatedJobApplication.companyName.toTitleCase(),
            jobTitle: updatedJobApplication.jobTitle.toTitleCase(),
            workoAppUrl: APP_CONSTANTS.WORKO_APP_DOMAIN,
          };

        // Send email to the corporate user
        await emailLibrary.sendEmail(
          EmailTemplateEnum.CAND_RECEIVED_JOB_APPLICATION_HIRED_STATUS_UPDATE,
          toAddress,
          hiredEmailPlaceholders
        );
        break;
      case JobApplicationStatus.REJECTED:
        // Construct the email placeholders object
        const rejectedEmailPlaceholders: EmailTemplatePlaceholderCAND_RECEIVED_JOB_APPLICATION_REJECTED_STATUS_UPDATE =
          {
            candName: candidateDetails.name.toTitleCase(),
            companyName: updatedJobApplication.companyName.toTitleCase(),
            jobTitle: updatedJobApplication.jobTitle.toTitleCase(),
            hrFeedback:
              updatedJobApplication.rejectedByUserId?.reason ??
              "Hiring manager has not provided any feedback",
            workoAppUrl: APP_CONSTANTS.WORKO_APP_DOMAIN,
          };

        // Send email to the corporate user
        await emailLibrary.sendEmail(
          EmailTemplateEnum.CAND_RECEIVED_JOB_APPLICATION_REJECTED_STATUS_UPDATE,
          toAddress,
          rejectedEmailPlaceholders
        );
        break;
      default:
        return false;
    }

    return true;
  }

  /**
   * formatJobApplicationStatus
   *
   * Formats the job application status to a human-readable string.
   * As of now we are formatting to send emails to the end users.
   *
   * @param {JobApplicationStatusType} status - The job application status.
   * @returns {string} The formatted job application status.
   */
  formatJobApplicationStatus(status: JobApplicationStatusType): string {
    global.logger.info("Format Job Application Status [Service]", {
      filePath: __filename,
      methodName: this.formatJobApplicationStatus.name,
      status,
    });

    /**
     * Record<JobApplicationStatus, string> creates an object type where:
     *    1. The keys must be one of the JobApplicationStatus enum values ("APPLIED", "REJECTED", etc.).
     *    2. The values must be strings.
     */
    const formattedStatuses: Record<JobApplicationStatus, string> = {
      [JobApplicationStatus.APPLIED]:
        APP_CONSTANTS.JOB_APPLICATION_READABLE_STATUS.APPLIED,
      [JobApplicationStatus.REJECTED]:
        APP_CONSTANTS.JOB_APPLICATION_READABLE_STATUS.REJECTED,
      [JobApplicationStatus.CV_DOWNLOADED]:
        APP_CONSTANTS.JOB_APPLICATION_READABLE_STATUS.CV_DOWNLOADED,
      [JobApplicationStatus.UNDER_EVALUATION]:
        APP_CONSTANTS.JOB_APPLICATION_READABLE_STATUS.UNDER_EVALUATION,
      [JobApplicationStatus.PROCESSING_INTERVIEW]:
        APP_CONSTANTS.JOB_APPLICATION_READABLE_STATUS.PROCESSING_INTERVIEW,
      [JobApplicationStatus.INTERVIEW_DONE]:
        APP_CONSTANTS.JOB_APPLICATION_READABLE_STATUS.INTERVIEW_DONE,
      [JobApplicationStatus.HIRED]:
        APP_CONSTANTS.JOB_APPLICATION_READABLE_STATUS.HIRED,
    };

    // Return the formatted status or default to "Applied"
    return (
      formattedStatuses[status] ||
      formattedStatuses[JobApplicationStatus.APPLIED]
    );
  }

  /**
   * sendEmailToJobPosterOnJobApplicationUpdate
   *
   * Sends an email to the job poster when a candidate's job application status is updated.
   *
   * @param {DbUserJobApplicationDto} updatedJobApplication - The updated job application data.
   * @returns {Promise<boolean>} A promise that resolves to true if the email was sent successfully.
   */
  async sendEmailToJobPosterOnJobApplicationUpdate(
    updatedJobApplication: DbUserJobApplicationDto
  ): Promise<boolean> {
    global.logger.info(
      "Send Email To Job Poster On Job Application Update [Service]",
      {
        filePath: __filename,
        methodName: this.sendEmailToJobPosterOnJobApplicationUpdate.name,
        updatedJobApplicationId: updatedJobApplication.id,
      }
    );

    // Send email to the job poster placeholder details
    const sendEmailPlaceholderDetailsToJobPoster: EmailPlaceholderDetailsToJobPosterType =
      await this.preparePlaceholdersToSendEmailToJobPoster(updatedJobApplication);

    const {
      jobPosterName,
      jobTitle,
      candidateName,
      status,
      jobPosterSendingEmail,
    } = sendEmailPlaceholderDetailsToJobPoster;

    const toAddress: EmailSourceDestinationAddress = {
      email: jobPosterSendingEmail,
      fullName: jobPosterName,
    };

    // Construct the email placeholders object
    const emailPlaceholders: EmailTemplatePlaceholderCORP_RECEIVED_JOB_APPLICATION_STATUS_UPDATE_NOTIFICATION =
      {
        jobPosterName,
        jobTitle,
        candidateName,
        updatedStatus: this.formatJobApplicationStatus(
          status as JobApplicationStatusType
        ),
      };

    // Send email to the corporate user
    await emailLibrary.sendEmail(
      EmailTemplateEnum.CORP_RECEIVED_JOB_APPLICATION_STATUS_UPDATE_NOTIFICATION,
      toAddress,
      emailPlaceholders
    );

    return true;
  }

  /**
   * preparePlaceholdersToSendEmailToJobPoster
   *
   * Sends job application status update email to job poster. If job poster is a corporate user,
   * send email to the corporate user's email address. Otherwise, send email to the user's email address.
   *
   * @param {DbUserJobApplicationDto} parsedJobApplicationDetails - The parsed job application details.
   * @returns {Promise<EmailPlaceholderDetailsToJobPosterType>} - A promise that resolves to the placeholders for the email template.
   */
  async preparePlaceholdersToSendEmailToJobPoster(
    parsedJobApplicationDetails: DbUserJobApplicationDto
  ): Promise<EmailPlaceholderDetailsToJobPosterType> {
    // get candidate details by email
    const candidateDetails: DbUserDetailDto =
      await userDetailServiceObj.getUserDetailsByEmail(
        parsedJobApplicationDetails.PK.split("#")[2]
      );

    // get job id from jobApplicationDetails
    const jobId: string = parsedJobApplicationDetails.jobId;

    // get posted job details by jobId
    const postedJobDetails: DbCompanyJobDto = (
      await companyJobServiceObj.getJobById(jobId)
    )[0];

    let jobPosterSendingEmail: string;
    let jobPosterName: string;

    // check if job poster is a corporate user
    if (postedJobDetails.createdByCorporateUserId) {
      // get job poster details by userId
      const jobPosterDetails: DbCorporateUserDto =
        await corporateUserServiceObj.getCorpUserByIdWithParsing(
          postedJobDetails.createdByCorporateUserId
        );

      // assign job poster sending email
      jobPosterSendingEmail = jobPosterDetails.email;

      // assign job poster name
      jobPosterName = `${jobPosterDetails.firstName.toTitleCase()} ${jobPosterDetails.lastName.toTitleCase()}`;
    } else {
      // get job poster details by userId
      const jobPosterDetails: DbUserDetailDto =
        await userDetailServiceObj.getUserByIdOne(
          postedJobDetails.createdByUserId as string
        );

      // assign job poster sending email
      jobPosterSendingEmail = jobPosterDetails.PK.split("#")[2];

      // assign job poster name
      jobPosterName = jobPosterDetails.name.toTitleCase();
    }

    const placeholderDetails: EmailPlaceholderDetailsToJobPosterType = {
      jobPosterSendingEmail,
      jobPosterName,
      jobTitle: parsedJobApplicationDetails.jobTitle.toTitleCase(),
      status: parsedJobApplicationDetails.status,
      candidateName: candidateDetails.name.toTitleCase(),
      candidateEmailId: candidateDetails.PK.split("#")[2],
    };

    global.logger.debug(
      `placeholder details to job poster - jobPosterSendingEmail:`,
      {
        filePath: __filename,
        methodName: this.preparePlaceholdersToSendEmailToJobPoster.name,
        placeholderDetails,
      }
    );

    return placeholderDetails;
  }

  /**
   * updateJobApplicationByCorpUser
   *
   * Updates a job application by corporate user.
   *
   * This method updates a job application with the provided status and
   * reason. It also sends an email notification to the candidate of the
   * job application status update.
   *
   * @param {string} jobApplicationId - The ID of the job application to be updated.
   * @param {UserJobApplicationUpdateApiDTO} jobApplicationRequestBody - The update data for the job application.
   * @returns {Promise<DbUserJobApplicationDto>} A promise that resolves to the updated job application data.
   */
  async updateJobApplicationByCorpUser(
    jobApplicationId: string,
    jobApplicationRequestBody: UserJobApplicationUpdateApiDTO
  ): Promise<DbUserJobApplicationDto> {
    global.logger.info(`Update Job Application By Corp User [Service]`, {
      filePath: __filename,
      methodName: this.updateJobApplicationByCorpUser.name,
      jobApplicationId,
      jobApplicationRequestBody,
    });

    // Fetch job application details
    const parsedJobApplication: DbUserJobApplicationDto =
      await this.getJobApplicationById(jobApplicationId);

    // Prepare update data
    let updateData: UserJobApplicationInternalUpdateDto;

    // Prepare update data based on job application status
    if (jobApplicationRequestBody.status === JobApplicationStatus.REJECTED) {
      const statusTrackerData: JobApplicationStatusTrackerType = [
        ...parsedJobApplication.statusTracker,
        {
          oldStatus: parsedJobApplication.status,
          newStatus: jobApplicationRequestBody.status,
          actionDate: DateTime.now().toISO(),
          userId: jobApplicationRequestBody.userId,
          userType: jobApplicationRequestBody.userType,
        },
      ];

      updateData = {
        status: jobApplicationRequestBody.status,
        rejectedByUserId: {
          userId: jobApplicationRequestBody.userId,
          actionDate: DateTime.now().toISO(),
          reason:
            jobApplicationRequestBody.reason ?? "Reason not provided by User",
          userComment:
            jobApplicationRequestBody.userComment ??
            "Comment not provided by User",
        },
        statusTracker: statusTrackerData,
      };
    } else {
      const statusTrackerData: JobApplicationStatusTrackerType = [
        ...parsedJobApplication.statusTracker,
        {
          oldStatus: parsedJobApplication.status,
          newStatus: jobApplicationRequestBody.status,
          actionDate: DateTime.now().toISO(),
          userId: jobApplicationRequestBody.userId,
          userType: jobApplicationRequestBody.userType,
        },
      ];

      updateData = {
        status: jobApplicationRequestBody.status,
        statusTracker: statusTrackerData,
      };
    }

    // Update job application by corp user
    let updatedJobApplication: DbUserJobApplicationDto =
      await userJobApplicationDao.updateJobApplicationStatus(
        parsedJobApplication.PK,
        parsedJobApplication.SK,
        updateData
      );

    // Send email to candidate on job application update
    if (updatedJobApplication) {
      const candidateEmail: string = updatedJobApplication.PK.split("#")[2];

      // parse candidate details
      const candidateDetails: DbUserDetailDto =
        await userDetailServiceObj.getUserDetailsByEmail(candidateEmail);

      // send email to candidate
      const sendEmailToCandidateOnJobApplicationUpdate: boolean =
        await this.sendEmailToCandidateOnJobApplicationUpdate(
          updatedJobApplication,
          candidateDetails
        );
      global.logger.debug(`Send Email To Candidate On Job Application Update`, {
        filePath: __filename,
        methodName: this.updateJobApplicationByCorpUser.name,
        status: updatedJobApplication.status,
        sendEmailToCandidateOnJobApplicationUpdate:
          sendEmailToCandidateOnJobApplicationUpdate,
        email: candidateEmail,
      });

      // send email to job poster on job application update
      const sendEmailToJobPosterOnJobApplicationUpdate: boolean =
        await this.sendEmailToJobPosterOnJobApplicationUpdate(
          updatedJobApplication
        );
      global.logger.debug(
        `Send Email To Job Poster On Job Application Update`,
        {
          filePath: __filename,
          methodName: this.updateJobApplicationByCorpUser.name,
          status: updatedJobApplication.status,
          sendEmailToJobPosterOnJobApplicationUpdate:
            sendEmailToJobPosterOnJobApplicationUpdate,
        }
      );
    }

    return updatedJobApplication;
  }

  /**
   * sendEmailToCorporateUsersOnNewJobApplication
   *
   * Sends an email to all corporate users for a company when a job application is created.
   *
   * @param {DbUserJobApplicationDto} parsedJobApplication - The parsed job application data.
   * @param {DbUserDetailDto} candidateDetails - The parsed candidate details.
   * @returns {Promise<boolean>} A promise that resolves to true if the email was sent successfully.
   */
  async sendEmailToCorporateUsersOnNewJobApplication(
    parsedJobApplication: DbUserJobApplicationDto,
    candidateDetails: DbUserDetailDto
  ): Promise<boolean> {
    global.logger.info(
      `Send Email To Corporate Users On New Job Application [Service]`,
      {
        filePath: __filename,
        methodName: this.sendEmailToCorporateUsersOnNewJobApplication.name,
        jobApplicationId: parsedJobApplication.id,
        candidateEmail: candidateDetails.PK.split("#")[2],
      }
    );

    // Get all corporate users without pagination
    const corporateUsersData: DbCorporateUserDto[] =
      await corporateUserServiceObj.getAllCorporateUsersWithoutPagination(
        parsedJobApplication.companyId
      );

    // Check if there are any corporate users and if not return false
    if (corporateUsersData.length === 0) {
      return false;
    }

    // Send email to each corporate user
    const corporateUsersEmailPromises = Object.values(corporateUsersData).map(
      (corporateUser: DbCorporateUserDto) => {
        // Retrieve email and first name from the corporate user
        const { email, firstName, lastName } = corporateUser;

        // Construct the corporate user full name
        const corporateUserFullName: string =
          `${firstName} ${lastName}`.toTitleCase();

        // Construct the email address object
        const toAddress: EmailSourceDestinationAddress = {
          email,
          fullName: corporateUserFullName,
        };

        // Construct the email placeholders object
        const emailPlaceholders: EmailTemplatePlaceholderCORP_RECEIVED_JOB_APPLICATION_NOTIFICATION =
          {
            corporateUserFullName: corporateUserFullName,
            candidateName: candidateDetails.name.toTitleCase(),
            jobTitle: parsedJobApplication.jobTitle.toTitleCase(),
            matchingScore: parsedJobApplication.matchingScore,
            scoreDetails:
              parsedJobApplication.scoreDetails ??
              `Overall Matching Score: ${parsedJobApplication.matchingScore}`,
          };

        // Send email to the corporate user
        return emailLibrary.sendEmail(
          EmailTemplateEnum.CORP_RECEIVED_JOB_APPLICATION_NOTIFICATION,
          toAddress,
          emailPlaceholders
        );
      }
    );

    // Wait for all send email promises to resolve
    await Promise.all(corporateUsersEmailPromises);

    return true;
  }

  /**
   * sendEmailToCandidateOnNewJobApplication
   *
   * Sends an email notification to the candidate upon the creation of their job application.
   *
   * @param {DbUserJobApplicationDto} parsedJobApplication - The parsed job application details.
   * @param {DbUserDetailDto} candidateDetails - The details of the candidate.
   * @returns {Promise<boolean>} A promise that resolves to true if the email was sent successfully.
   */
  async sendEmailToCandidateOnNewJobApplication(
    parsedJobApplication: DbUserJobApplicationDto,
    candidateDetails: DbUserDetailDto
  ): Promise<boolean> {
    global.logger.info(
      `Send Email To Candidate On Job Application Creation [Service]`,
      {
        filePath: __filename,
        methodName: this.sendEmailToCandidateOnNewJobApplication.name,
        parsedJobApplication,
        candidateDetails,
      }
    );

    // Construct the email address object
    const toAddress: EmailSourceDestinationAddress = {
      email: candidateDetails.PK.split("#")[2],
      fullName: candidateDetails.name,
    };

    // Construct the email placeholders object
    const emailPlaceholders: EmailTemplatePlaceholderCAND_RECEIVED_JOB_APPLICATION_NOTIFICATION =
      {
        candidateName: candidateDetails.name.toTitleCase(),
        jobTitle: parsedJobApplication.jobTitle.toTitleCase(),
        companyName: parsedJobApplication.companyName,
      };

    await emailLibrary.sendEmail(
      EmailTemplateEnum.CAND_RECEIVED_JOB_APPLICATION_NOTIFICATION,
      toAddress,
      emailPlaceholders
    );

    return true;
  }

  /**
   * validateUserJobApplicationMatchingScore
   *
   * Validates the job application matching score and updates the job application status if necessary.
   *
   * @param {string} jobApplicationRequestId - The job application request ID
   * @param {string} userEmail - The email id of the user who created the job application request
   * @param {string} userId - The user id of the user who created the job application request
   * @returns {Promise<boolean>} A promise that resolves to true if the job application matching score is validated successfully, otherwise throws an error
   */
  async validateUserJobApplicationMatchingScore(
    jobApplicationRequestId: string,
    userEmail: string,
    userId: string
  ): Promise<boolean> {
    // Log the attempt to validate job application matching score
    logger.info(
      `Attempting to validate job application matching score for job application ID: ${jobApplicationRequestId}, user email: ${userEmail} [Service]`
    );

    // Get the job application details
    const jobApplicationDetails: DbUserJobApplicationDto =
      await this.getJobApplicationById(jobApplicationRequestId);

    // Retrieve the matching score from user job application details
    const matchingScore: number = jobApplicationDetails.matchingScore;

    // Update job application status to `REJECTED` if matching score is less than the specified value in `APP_CONSTANTS`
    if (matchingScore < APP_CONSTANTS.JOB_APPLICATION_MINIMUM_MATCHING_SCORE) {
      await userJobApplicationDao.updateJobApplicationStatus(
        jobApplicationDetails.PK,
        jobApplicationDetails.SK,
        {
          status: JobApplicationStatus.REJECTED,
          statusTracker: [
            ...jobApplicationDetails.statusTracker,
            {
              oldStatus: jobApplicationDetails.status,
              newStatus: JobApplicationStatus.REJECTED,
              actionDate: DateTime.now().toISO(),
              userId: undefined,
              userType: undefined,
            },
          ],
        }
      );

      global.logger.info(`Job application rejected due to low matching score`, {
        filePath: __filename,
        methodName: this.validateUserJobApplicationMatchingScore.name,
        jobApplicationRequestId: jobApplicationRequestId,
      });
    } else {
      // @todo: Implement reminders using scheduler

      // ===========================================================================
      // ===== SEND EMAIL TO CORPORATE USERS ON SUCCESSFUL JOB APPLICATION CREATION/REQUEST =====
      // ===========================================================================

      // Fetch candidate details using user ID
      const candidateDetails: DbUserDetailDto =
        await UserDetailService.getUserByIdOne(userId);

      // Send email notifications to respective users
      await Promise.all([
        // Send email notification to all corporate users who is currently working on that particular company about the new job application
        this.sendEmailToCorporateUsersOnNewJobApplication(
          jobApplicationDetails,
          candidateDetails
        ),

        // Send email notification to the candidate about the new job application
        this.sendEmailToCandidateOnNewJobApplication(
          jobApplicationDetails,
          candidateDetails
        ),
      ]);
    }

    return true;
  }

  /**
   * updateJobApplicationRequestFeedback
   *
   * @param {UserJobApplicationRequestFeedbackApiDTO} requestBody - The request body containing the application date and additional comments.
   * @param {string} jobApplicationId - The ID of the job application to be updated.
   * @returns {Promise<boolean>} A promise that resolves to true if the job application request feedback was updated successfully.
   */
  async updateJobApplicationRequestFeedback(
    requestBody: UserJobApplicationRequestFeedbackApiDTO,
    jobApplicationId: string
  ): Promise<boolean> {
    // get job application details by jobApplicationId
    const jobApplicationDetails: DbUserJobApplicationDto =
      await this.getJobApplicationById(jobApplicationId);

    const sendEmailPlaceholderDetailsToJobPoster: EmailPlaceholderDetailsToJobPosterType =
      await this.preparePlaceholdersToSendEmailToJobPoster(
        jobApplicationDetails
      );

    const {
      jobPosterName,
      jobTitle,
      candidateName,
      status,
      jobPosterSendingEmail,
    } = sendEmailPlaceholderDetailsToJobPoster;

    // Construct the email address object
    const toAddress: EmailSourceDestinationAddress = {
      email: jobPosterSendingEmail,
      fullName: jobPosterName,
    };

    // Construct the email placeholders object
    const emailPlaceholders: EmailTemplatePlaceholderCORP_REQUEST_FEEDBACK_NOTIFICATION =
      {
        jobPosterName: jobPosterName.toTitleCase(),
        candidateName: candidateName.toTitleCase(),
        jobTitle: jobTitle.toTitleCase(),

        /**
         * Convert application date to required format
         *
         * If `requestBody.applicationDate` is `2024-12-09T05:19:11.312Z`
         * then `formattedDate` will be `9th December 2024`
         */
        applicationDate: DateTime.fromISO(requestBody.applicationDate).toFormat(
          "d'th' MMMM yyyy"
        ),

        status: this.formatJobApplicationStatus(
          status as JobApplicationStatusType
        ),
      };

    // Send email to the corporate user
    const sendEmailDetails: {
      awsMessageId: string | null;
      systemLogId: string | null;
    } = await emailLibrary.sendEmail(
      EmailTemplateEnum.CORP_REQUEST_FEEDBACK_NOTIFICATION,
      toAddress,
      emailPlaceholders
    );

    if (!sendEmailDetails.awsMessageId) {
      return false;
    }

    // Update the job application request feedback
    await userJobApplicationDao.updateJobApplicationRequestFeedback(
      jobApplicationDetails.PK.split("#")[2], // email
      jobApplicationDetails.id // job Application Id
    );

    return true;
  }
}

// Create an instance of the UserJobApplicationService class and export it
const userJobApplicationServiceObj = new UserJobApplicationService();
export { userJobApplicationServiceObj, UserJobApplicationService };