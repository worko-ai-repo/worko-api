// import dynamoose types 
import { Query, QueryResponse } from "dynamoose/dist/ItemRetriever";

// import luxon
import { DateTime } from "luxon";

// import daos
import BaseDao from "./Base.dao";

// import dtos
import { UserJobApplicationCreateApiDTO, UserJobApplicationInternalUpdateDto, UserJobApplicationListingFilterOptions, UserJobApplicationRequestFeedbackApiDTO } from "../dtos/UserJobApplication.dto";
import { PaginatedResultsWithMatchingConditionsResponse } from "../dtos/Common.dto";

// import enums
import { JobApplicationStatus } from "../enums/UserJobApplication.enum";
import { SortOrderTypeEnum } from "../enums/Common.enum";
import { UserType } from "../enums/User.enum";
import { CorporateUserTypeEnum } from "../enums/CorporateUser.enum";

// import helpers
import { getPaginatedResultsWithMatchingConditions } from "../helpers/dynamoose.helper";

// import models
import { DbUserJobApplicationDto, UserJobApplicationModel } from "../db/models/UserJobApplication.model";

// import services
import UlidService from "../services/Ulid.service";

/**
 * UserJobApplicationDao
 * 
 * Dao for handling user job application-related operations
 */
class UserJobApplicationDao implements BaseDao {
  modelName = "UserJobApplication"; // The model name used for user job applications
  partitianKey = "USR#EML#{primaryEmail}"; // Partition key format for user job applications
  sortKeys = { SK_JOB_APP_ID: "JOB#APP#ID#{id}" }; // Sort key format for user job applications
  GSI1PK = "COMP#ID#{companyId}#JOB#APP#"; // `companyID` is the `id` of the company
  GSI1SK = "ID#{id}"; // `id` is the `job application id` which is generated when a job application is created
  GSI2PK = "JOB#APP#";
  GSI2SK = "ID#{id}"; // `id` is the `job application id` which is generated when a job application is created

  /**
   * createJobApplication
   *
   * Creates a new job application for a candidate.
   *
   * @param {UserJobApplicationCreateApiDTO} jobApplicationRequestBody - The data required to create a new job application.
   * @param {string} emailId - The email ID of the user applying for the job.
   * @returns {Promise<DbUserJobApplicationDto>} - A promise that resolves to an object representing the created job application.
   */
  async createJobApplication(
    jobApplicationRequestBody: UserJobApplicationCreateApiDTO,
    emailId: string,
    userId: string
  ): Promise<DbUserJobApplicationDto> {
    global.logger.info(`Create Job Application By Cand [DAO]`, {
      filePath: __filename,
      methodName: this.createJobApplication.name,
      userId,
      emailId,
      jobApplicationRequestBody,
    });

    // Generate a unique ID
    const id: string = UlidService.getUlidId();

    // Prepare the data required to create a new job application
    const newJobApplication = {
      ...jobApplicationRequestBody,
      id: id,
      PK: this.partitianKey.strtr({
        "{primaryEmail}": emailId,
      }),
      SK: this.sortKeys.SK_JOB_APP_ID.strtr({
        "{id}": id,
      }),
      GSI1PK: this.GSI1PK.strtr({
        "{companyId}": jobApplicationRequestBody.companyId,
      }),
      GSI1SK: this.GSI1SK.strtr({
        "{id}": id,
      }),
      GSI2PK: this.GSI2PK,
      GSI2SK: this.GSI2SK.strtr({
        "{id}": id,
      }),
      status: JobApplicationStatus.APPLIED,
      statusTracker: [
        {
          oldStatus: JobApplicationStatus.APPLIED,
          newStatus: JobApplicationStatus.APPLIED,
          actionDate: DateTime.now().toISO(),
          userId: userId,
          userType: UserType.CAND,
        },
      ],
      matchingScore: 0,
    };

    // Create the job application in the database
    return UserJobApplicationModel.create(newJobApplication);
  }

  /**
   * getJobApplicationForCandByjobUrl
   *
   * Retrieves a job application by job URL for a candidate.
   *
   * @param {string} emailId - The email of the user.
   * @param {string} jobUrl - The job URL.
   * @return {Promise<QueryResponse<DbUserJobApplicationDto>>} A promise that resolves to the job application data.
   */
  async getJobApplicationForCandByjobUrl(
    emailId: string,
    jobUrl: string
  ): Promise<QueryResponse<DbUserJobApplicationDto>> {
    global.logger.info(`Get Job Application By jobUrl [DAO]`, {
      filePath: __filename,
      methodName: this.getJobApplicationForCandByjobUrl.name,
      emailId,
      jobUrl,
    });

    // Generate the PK using the user's email
    let PK: string = this.partitianKey.strtr({ "{primaryEmail}": emailId });

    // Retrieve the job application data from the database and return
    return UserJobApplicationModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith("JOB#APP#ID#")
      .where("jobUrl")
      .eq(jobUrl)
      .exec();
  }

  /**
   * getJobApplicationById
   *
   * Retrieves the job application by job application ID.
   *
   * @param {string} jobApplicationId - The job application ID.
   * @returns {Promise<QueryResponse<DbUserJobApplicationDto>>} A promise that resolves to the job application data.
   */
  async getJobApplicationById(
    jobApplicationId: string
  ): Promise<QueryResponse<DbUserJobApplicationDto>> {
    global.logger.info("Get Job Application By Id [DAO]", {
      filePath: __filename,
      methodName: this.getJobApplicationById.name,
      jobApplicationId,
    });

    // Retrieve the job application data from the database and return
    return UserJobApplicationModel.query("GSI2PK")
      .eq(this.GSI2PK)
      .where("GSI2SK")
      .eq(this.GSI2SK.strtr({ "{id}": jobApplicationId }))
      .exec();
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
  ): Promise<QueryResponse<DbUserJobApplicationDto>> {
    global.logger.info(`Get Job Application Score For Cand [DAO]`, {
      filePath: __filename,
      methodName: this.getJobApplicationScore.name,
      jobApplicationId,
    });

    // Generate GSI2SK
    let GSI2SK: string = this.GSI2SK.strtr({ "{id}": jobApplicationId });

    // Query score details for the job application
    return UserJobApplicationModel.query("GSI2PK")
      .eq(this.GSI2PK)
      .where("GSI2SK")
      .eq(GSI2SK)
      .attributes([
        "matchingScore",
        "jdMatchErrorCode",
        "jdMatchErrorDesc",
        "rejectionFeedbackBySystem",
      ])
      .exec();
  }

  /**
   * getJobApplicationsByFilterOptions
   *
   * Retrieves job applications based on the provided filter options.
   *
   * This method allows for the querying of job applications using various
   * filter criteria such as company ID, user email, status, and job ID.
   * The results are sorted according to the specified sort order and
   * paginated using the provided pagination helper.
   *
   * @param {UserJobApplicationListingFilterOptions} jobApplicationRequestBody - The filter options for querying job applications.
   * @returns {Promise<PaginatedResultsWithMatchingConditionsResponse<DbUserJobApplicationDto>>} A promise that resolves to the paginated results of job applications matching the filter conditions.
   */
  async getJobApplicationsByFilterOptions(
    jobApplicationRequestBody: UserJobApplicationListingFilterOptions
  ): Promise<
    PaginatedResultsWithMatchingConditionsResponse<DbUserJobApplicationDto>
  > {
    global.logger.info(
      `Get Job Applications By filter options For Corp User [DAO]`,
      {
        filePath: __filename,
        methodName: this.getJobApplicationsByFilterOptions.name,
        jobApplicationRequestBody,
      }
    );

    // Initialize the query
    let query: Query<DbUserJobApplicationDto>;

    /**
     * If `companyId` is provided, then use GSI1PK and GSI1SK
     * when `companyId` is provided then we are assuming that the user is a corporate admin
     * or corporate recruiter who requesting the data
     */
    if (jobApplicationRequestBody.companyId) {
      let GSI1PK: string = this.GSI1PK.strtr({
        "{companyId}": jobApplicationRequestBody.companyId,
      });

      query = UserJobApplicationModel.query("GSI1PK")
        .eq(GSI1PK)
        .where("GSI1SK")
        .beginsWith("ID#");
    } else if (jobApplicationRequestBody.userEmail) {
      /**
       * If `userEmail` is provided, then use PK and SK
       * when `userEmail` is provided then we are assuming that the user is a candidate who requesting the data
       */
      query = UserJobApplicationModel.query("PK")
        .eq(
          this.partitianKey.strtr({
            "{primaryEmail}": jobApplicationRequestBody.userEmail,
          })
        )
        .where("SK")
        .beginsWith("JOB#APP#ID#");
    } else {
      /**
       * If neither `companyId` nor `userEmail` is provided, then use `GSI2PK` and `GSI2SK`
       * when neither `companyId` nor `userEmail` is provided then we are assuming that the user is a worko admin who requesting the data
       */
      query = UserJobApplicationModel.query("GSI2PK")
        .eq(this.GSI2PK)
        .where("GSI2SK")
        .beginsWith("ID#");
    }

    // Sort the results based on the provided sort order
    query = query.sort(
      jobApplicationRequestBody.sortOrder as SortOrderTypeEnum
    );

    // If `userType` is provided, then filter the results based on the user type
    if (
      jobApplicationRequestBody.userType ===
        CorporateUserTypeEnum.CORPORATE_ADMIN ||
      jobApplicationRequestBody.userType ===
        CorporateUserTypeEnum.CORPORATE_RECRUITER
    ) {
      query = query.where("rejectionFeedbackBySystem").eq("");
    }

    // Apply status filter if provided
    if (jobApplicationRequestBody.status) {
      query = query.where("status").eq(jobApplicationRequestBody.status);
    }

    // Apply jobId filter if provided
    if (jobApplicationRequestBody.jobId) {
      query = query.where("jobId").eq(jobApplicationRequestBody.jobId);
    }

    // Apply date range filter if provided
    if (
      jobApplicationRequestBody.fromDate ||
      jobApplicationRequestBody.toDate
    ) {
      query = query.and().parenthesis((condition) => {
        if (jobApplicationRequestBody.fromDate) {
          condition.where("createdAt").ge(jobApplicationRequestBody.fromDate);
        }
        if (jobApplicationRequestBody.toDate) {
          condition.where("createdAt").le(jobApplicationRequestBody.toDate);
        }
        return condition;
      });
    }

    // search by searchText if provided
    if (jobApplicationRequestBody.searchText) {
      // remove trailing and leading spaces from the search text
      let searchTextValue = jobApplicationRequestBody.searchText;

      /* 
      The and() method initiates a condition block where all conditions within it must be satisfied.
      The parenthesis() method allows grouping of conditions for complex queries.
      */
      query = query.and().parenthesis((condition) => {
        condition
          .where("status")
          .contains(searchTextValue.toUpperCase())
          .or()
          .where("PK")
          .contains(`USR#EML#${searchTextValue.toLowerCase()}`)
          .or()
          // NOTE: `companyName` search will not work when the `companyName` is changed in `CompanyDetail` model and 
          // if the `companyName` is changed in `CompanyDetail` model, then the `companyName` will not be updated in `UserJobApplication` model
          .where("companyName")
          .contains(searchTextValue.toUpperCase());

        // Return the built condition
        return condition;
      });
    }

    // Execute the query by applying the pagination helper and return the results
    return getPaginatedResultsWithMatchingConditions<
      DbUserJobApplicationDto,
      UserJobApplicationListingFilterOptions
    >(query, jobApplicationRequestBody);
  }

  /**
   * updateJobApplicationStatus
   *
   * Updates a job application in the database using the provided update data.
   *
   * @param {string} partitianKey - The partition key of the job application.
   * @param {string} sortKey - The sort key of the job application.
   * @param {UserJobApplicationInternalUpdateDto} updateData - The data to be updated in the job application.
   * @returns {Promise<DbUserJobApplicationDto>} A promise that resolves to the updated job application data.
   */
  async updateJobApplicationStatus(
    partitianKey: string,
    sortKey: string,
    updateData: UserJobApplicationInternalUpdateDto
  ): Promise<DbUserJobApplicationDto> {
    global.logger.info(`Update Job Application By Corp User [DAO]`, {
      filePath: __filename,
      methodName: this.updateJobApplicationStatus.name,
      partitianKey,
      sortKey,
      updateData,
    });

    return UserJobApplicationModel.update(
      { PK: partitianKey, SK: sortKey },
      updateData
    );
  }

  /**
   * Updates the job application request feedback in the database.
   *
   * This method updates the follow-up request for a job application identified by the given email ID and job application ID.
   * It logs the update action and returns the updated job application data.
   *
   * @param {string} emailId - The email ID of the user associated with the job application.
   * @param {string} jobApplicationId - The ID of the job application to be updated.
   * @returns {Promise<DbUserJobApplicationDto>} A promise that resolves to the updated job application data.
   */
  async updateJobApplicationRequestFeedback(
    emailId: string,
    jobApplicationId: string,
  ): Promise<DbUserJobApplicationDto> {
    global.logger.info(`Update Job Application Request Feedback [DAO]`, {
      filePath: __filename,
      methodName: this.updateJobApplicationRequestFeedback.name,
      emailId: emailId,
      jobApplicationId: jobApplicationId,
    });

    // update job application request feedback and return
    return UserJobApplicationModel.update(
      {
        PK: this.partitianKey.strtr({ "{primaryEmail}": emailId }),
        SK: this.sortKeys.SK_JOB_APP_ID.strtr({ "{id}": jobApplicationId }),
      },
      {
        followUpRequest: [
          {
            actionDate: DateTime.now().toISO(),
          },
        ],
      }
    );
  }
}

// create an instance of UserJobApplicationDao and export instance object & class 
const userJobApplicationDao = new UserJobApplicationDao();
export {userJobApplicationDao, UserJobApplicationDao};