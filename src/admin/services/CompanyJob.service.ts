// Load QueryResponse from dynamoose
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Load the npm packages
import { APIGatewayProxyResult } from "aws-lambda";

// Load Dao
import { companyJobDaoObj } from "../../daos/CompanyJob.dao";

// Load Dto
import { PaginatedResultsWithMatchingConditionsResponse } from "../../dtos/Common.dto";
import { CompanyJobCreateDto, CompanyJobUpdateDto, JobListingFilterOptions, ParsedJobDescriptionApiDto, ParsedJobDescriptionResponseDto } from "../dtos/CompanyJob.dto";

// import helpers
import { attachCompanyDetails } from "../../helpers/companyDetailsInjector.helper";

// import models
import { DbCompanyDetailDto } from "../../db/models/CompanyDetail.model";
import { DbCompanyJobDto } from "../../db/models/CompanyJob.model";

// Load Services
import { companyServiceObj } from "./Company.service";
import InvokeLambdaService from "../../services/InvokeLambda.service";

// import utils
import { BaseError } from "../../utils/errors.util";
import HttpStatusCode from "../../utils/http-codes.util";

class CompanyJobService {
    /**
    * createJob
    * 
    * It will be responsible for creating a new job for the company, by verifying if the company exist or not and then calling the Dao for the job creatiion.
    * 
    * @param {CompanyJobCreateDto} JobDetailsData
    * 
    * @returns {Promise<DbCompanyJobDto>} 
    */
    async createJob(JobDetailsData: CompanyJobCreateDto): Promise<DbCompanyJobDto> {
        // Global Logger for the service
        global.logger.info(`Creating Job for Company: ${JobDetailsData.jobTitle} [service]`, {
            filePath: __filename,
            methodName: this.createJob.name,
        });

        // Call the service to check if the company exists from the Business Layer.[Service Call]
        let companyDetails = await companyServiceObj.getCompanyDetailById(JobDetailsData.companyId);

        // Check if the CompanyId is an empty array
        if (!companyDetails.count) {
            // Throw an error if the CompanyId is not found
            throw new BaseError(`Requested Company Id: ${JobDetailsData.companyId} not found`, HttpStatusCode.NOT_FOUND_404);
        }

        return companyJobDaoObj.createJob(JobDetailsData);
    }

    /**
     * parseJobDescription
     *
     * Parses a given job description by invoking an AWS Lambda function.
     *
     * @param {ParsedJobDescriptionApiDto} parsedJobDescriptionApiDto - The DTO containing the job description to be parsed.
     * @throws {BaseError} If the Lambda function response status code is not 200.
     * @returns {Promise<ParsedJobDescriptionResponseDto>} The parsed job details as returned by the Lambda function.
     */
    async parseJobDescription(parsedJobDescriptionApiDto: ParsedJobDescriptionApiDto): Promise<ParsedJobDescriptionResponseDto> {
      // Global Logger for the Parse Job Description Controller
      global.logger.info("Parsing Job Description. [service]", {
        filePath: __filename,
        methodName: this.parseJobDescription.name,
      });

      // Invoke Lambda to parse job description
      const parseJobDescriptionResponse: APIGatewayProxyResult = await InvokeLambdaService.triggerParseJobDescription(parsedJobDescriptionApiDto)

      // If the response status code is not 200 then throw an error 
      if (parseJobDescriptionResponse.statusCode !== HttpStatusCode.OK_200) {
        throw new BaseError("Unable to parse job description, Please try again after some time.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
      }

      // Return the parsed response
      return JSON.parse(parseJobDescriptionResponse["body"]);
    }

    /**
     * getAllJobs
     * 
     * Fetch All Company Jobs and apply filter for coreSkills and softSkills explicitly if provided
     * 
     * @param {JobListingFilterOptions} jobFilterOptions - Tells about the kind of query applied to the params
     * 
     * @returns {Promise<PaginatedResultsWithMatchingConditionsResponse<DbCompanyJobDto>>}
     */
    async getAllJobs(jobFilterOptions: JobListingFilterOptions): Promise<PaginatedResultsWithMatchingConditionsResponse<DbCompanyJobDto>> {
        // Global logger 
        global.logger.info(`Fetching All Jobs [service]`, {
            filePath: __filename,
            methodName: this.getAllJobs.name,
        });

        return companyJobDaoObj.getAllJobs(jobFilterOptions);
    }

    /**
     * getJobsWithCompanyDetails
     * 
     * Fetch All Company Jobs with its company etails and apply filter for coreSkills and softSkills explicitly if provided
     * 
     * @param {JobListingFilterOptions} jobFilterOptions - Tells about the kind of query applied to the params
     */
    async getJobsWithCompanyDetails(jobFilterOptions: JobListingFilterOptions) {
        // Global logger 
        global.logger.info(`Fetching All Jobs with company details [service]`, {
            filePath: __filename,
            methodName: this.getJobsWithCompanyDetails.name,
        });

        // Get all jobs
        const jobDetails = await this.getAllJobs(jobFilterOptions);

        /**
         * Extract the array of job details from jobsWithCompanyDetails.
         * Since PaginatedResultsWithMatchingConditionsResponse is 
         * an object with both metadata (like lastKey, count) and data,
         * the data part is likely accessible through a known method 
         * (like iterating over keys or accessing a specific property).
         */
        const { lastKey, count, timesQueried, queriedCount, ...jobDetailsData } = jobDetails;

        // convert the object to an array
        const jobsArray : DbCompanyJobDto[] = Object.values(jobDetailsData);

        // Enrich the data with company details
        const jobsWithCompanyDetails: (DbCompanyJobDto & {
          companyDetails: DbCompanyDetailDto | undefined;
        })[] = await attachCompanyDetails<DbCompanyJobDto>(jobsArray);

        // Reconstruct the response and return
        return {
            jobsWithCompanyDetails: jobsWithCompanyDetails,
            lastKey: lastKey,
            count: count,
            timesQueried: timesQueried,
            queriedCount: queriedCount
        }
      
        // // Reconstruct the original response structure
        // const allJobsWithCompanyDetails: PaginatedResultsWithMatchingConditionsResponse<
        //     DbCompanyJobDto
        //     &
        //     { companyDetails: DbCompanyDetailDto }> = {
        //     ...jobDetails, // Keep metadata
        //     ...Object.fromEntries(enrichedJobs.map((job, index) => [index, job])), 
        // };

        // return allJobsWithCompanyDetails;
    }

    /**
     * getJobById
     * 
     * Get Company Job By Id
     * 
     * @param {string} jobId - Job Id 
     * 
     * @returns {Promise<QueryResponse<DbCompanyJobDto>>}
     */
    async getJobById(jobId: string): Promise<QueryResponse<DbCompanyJobDto>> {
        // Global Logger for the service
        global.logger.info(`Fetching Job by ID: ${jobId} [service]`, {
            filePath: __filename,
            methodName: this.getJobById.name,
        });

        // Fetch Job by Id and Check if the job exists
        const jobDetailById = await companyJobDaoObj.getJobById(jobId);
        if (!jobDetailById.length) {
            throw new BaseError(`No Job found with ID: ${jobId}`, 404);
        }

        return jobDetailById;
    }

    /**
     * getJobByIdWithCompanyDetails
     * 
     * Get Company Job By Id with company details
     * 
     * @param {string} jobId - Job Id 
     * 
     * @returns {Promise<(DbCompanyJobDto & { companyDetails: DbCompanyDetailDto | undefined })[]>}
     */
    async getJobByIdWithCompanyDetails(jobId: string): Promise<(DbCompanyJobDto & {
        companyDetails: DbCompanyDetailDto | undefined;
    })[]> {
        // Global Logger for the service
        global.logger.info(`Fetching Job by ID: ${jobId} [service]`, {
            filePath: __filename,
            methodName: this.getJobById.name,
        });
    
        // Fetch Job by Id
        const jobDetailById: QueryResponse<DbCompanyJobDto> = await this.getJobById(jobId);
    
        // Map the Job with Company
        return attachCompanyDetails<DbCompanyJobDto>(jobDetailById);
    }
    
    /**
     * updateJobById
     * 
     * Update Company Job
     * 
     * @param {string} jobId 
     * @param {CompanyJobUpdateDto} jobDetailsById
     * 
     * @returns {Promise<DbCompanyJobDto>} 
     */
    async updateJobById(jobId: string, jobDetailsById: CompanyJobUpdateDto): Promise<DbCompanyJobDto> {
        // Global Logger for the service
        global.logger.info(`Updating Job for Company: ${jobId} [service]`, {
            filePath: __filename,
            methodName: this.updateJobById.name,
        });

        // Check if the job exists
        const existingJobDetails = await this.getJobById(jobId);
        if (!existingJobDetails.count) {
            throw new BaseError(`Job with ID ${jobId} not found`, HttpStatusCode.NOT_FOUND_404);
        }

        // Destructure and exclude companyId from the update payload
        const { companyId, ...jobDetailsToUpdate } = jobDetailsById;

        // Log what is being updated (for debugging purposes)
        global.logger.info("Job details being updated:", {
            jobId: jobId,
            jobDetailsToUpdate,
        });

        // Call DAO method to update the job, passing only the fields that should be updated
        return companyJobDaoObj.updateJobById(jobId, jobDetailsToUpdate, companyId);
    }

    /**
     * softDeleteJobById
     * 
     * Delete Company Job
     * 
     * @param {string} jobId 
     * @param {string} companyId
     * 
     * @returns {Promise<DbCompanyJobDto>}
     */
    async softDeleteJobById(jobId: string, companyId: string): Promise<DbCompanyJobDto | null> {
        // Global Logger for the service
        global.logger.info(`Deleting Job for Company: ${jobId} [service]`, {
            filePath: __filename,
            methodName: this.softDeleteJobById.name,
        });

        // Return type Promise<DbCompanyJobDto> for the method delete
        return companyJobDaoObj.softDeleteJobById(jobId, companyId);
    }
}

const companyJobServiceObj = new CompanyJobService();

export {
    companyJobServiceObj,
    CompanyJobService
};