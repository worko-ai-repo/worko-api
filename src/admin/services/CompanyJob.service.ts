// Load Base Error from Utils
import { BaseError } from "../../utils/errors.util";

// Load Dao
import { companyJobDaoObj } from "../../daos/CompanyJob.dao";

//Load Dto
import { CompanyJobCreateDto, CompanyJobUpdateDto, JobListingFilterOptions, JobsWithCompanyResDto } from "../dtos/CompanyJob.dto";

//Import HttpStatusCode from Utils
import HttpStatusCode from "../../utils/http-codes.util";

// Load Model 
import { DbCompanyJobDto } from "../../db/models/CompanyJob.model";

// Load Services
import { companyServiceObj } from "./Company.service";

// Load QueryResponse from dynamoose
import { QueryResponse } from "dynamoose/dist/ItemRetriever";
import CompanyService from "../../services/Company.service";
import { DbCompanyDetailDto } from "../../db/models/CompanyDetail.model";

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
     * getAllJobs
     * 
     * Fetch All Company Jobs and apply filter for coreSkills and softSkills explicitly if provided
     * 
     * @param {JobListingFilterOptions} jobFilterOptions - Tells about the kind of query applied to the params
     * 
     * @returns {Promise<QueryResponse<DbCompanyJobDto>>}
     */
    async getAllJobs(jobFilterOptions: JobListingFilterOptions): Promise<QueryResponse<DbCompanyJobDto>> {
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

        // Get jobs with company details
        const jobsWithCompanyDetails = await this.prepareJobsWithCompanyDetails(jobDetails);

        return {
            data: jobsWithCompanyDetails,
            lastKeyVal: jobDetails.lastKey,
            count: jobDetails.count,
            queriedCount: jobDetails.queriedCount,
        };
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
     * @returns {Promise<JobsWithCompanyResDto[]>}
     */
    async getJobByIdWithCompanyDetails(jobId: string): Promise<JobsWithCompanyResDto[]> {
        // Global Logger for the service
        global.logger.info(`Fetching Job by ID: ${jobId} [service]`, {
            filePath: __filename,
            methodName: this.getJobById.name,
        });

        // Fetch Job by Id
        const jobDetails = await this.getJobById(jobId);

        // Map the Job with Company
        return this.prepareJobsWithCompanyDetails(jobDetails);
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

    /**
     * prepareJobsWithCompanyDetails
     * 
     * Retrieves a list of jobs with their corresponding company details.
     *
     * This function takes a list of jobs as input and returns a new list of jobs with
     * their company details added. The company details are retrieved from the
     * companyServiceObj.getCompanyDetailById method.
     *
     * The method works by mapping over the input list of jobs and for each job, it
     * fetches the company details using the getCompanyDetailById method. The job
     * object is then extended with a new property called companyDetails, which
     * contains the company details for that job.
     *
     * Finally, the method returns the new list of jobs with their company details
     * added.
     *
     * @param {QueryResponse<DbCompanyJobDto>} jobsData - The list of jobs to retrieve company details for.
     * 
     * @return {Promise<JobsWithCompanyResDto[]>} A promise that resolves to a list of jobs with their company details.
     * 
     * @see companyServiceObj.getCompanyDetailById to retrieve company details for each job.
     */
    async prepareJobsWithCompanyDetails(jobsData: QueryResponse<DbCompanyJobDto>): Promise<JobsWithCompanyResDto[]> {
        // Check if jobsData is empty and return an empty array if true
        if (!jobsData || jobsData.length === 0) {
            return [];
        }

        // Get unique company IDs from jobsData
        const uniqueCompanyIds = Array.from(new Set(jobsData.map(job => job.companyId)));

        // Fetch company details for all unique IDs using the batch method
        const companiesDetails = await CompanyService.getCompanyDetailsByIds(uniqueCompanyIds);

        // Convert array of company details to a map for quick access
        const companiesMap = new Map(companiesDetails.map(company => [company.id, company]));

        //  Map over the jobs and add company details
        const jobsWithCompanyDetails = jobsData.map(job => {
            const companyDetails = companiesMap.get(job.companyId) || null;

            return {
                ...job,
                companyDetails
            };
        });

        return jobsWithCompanyDetails;
    }
}

const companyJobServiceObj = new CompanyJobService();

export {
    companyJobServiceObj,
    CompanyJobService
};