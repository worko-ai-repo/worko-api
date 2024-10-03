// Load BaseError from utils
import { BaseError } from "../utils/errors.util";

//Load Dtos
import { CompanyJobCreateDto, CompanyJobUpdateDto, JobListingFilterOptions } from "../admin/dtos/CompanyJob.dto";

// Import the enums
import { CompanyJobStatusEnum } from "../enums/CompanyJob.enum";
import { SortOrderTypeEnum } from "../enums/Common.enum";

// Load Model 
import { DbCompanyJobDto, CompanyJobModel } from "../db/models/CompanyJob.model";

// Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";

// Load QueryResponse from dynamoose
import { QueryResponse } from "dynamoose/dist/ItemRetriever";
import dynamoose from 'dynamoose';

class CompanyJobDao {
    // Define the model name, partitian key and sort keys for CompanyJob
    modelName: string = "CompanyJob";
    partitianKey: string = "COMP#ID#{companyId}#";
    sortKeys: { SK_INIT: string } = { SK_INIT: "JOBS#ID#{id}" };
    GSI1PK: string = "JOBS#";
    GSI1SK = "ID#{id}";

    /**
     * getJob
     * 
     * Fetches a Job by its KEYS.
     * 
     * @todo This must only return the job details not the input key, 
     * if you would like to validate input key, then use this function to get the job details by passing input key,
     * if job is found then use already prepared/passed input key instead of expecting the input key from the function.
     */
    async getJobByPkAndSk(PK: string, SK: string): Promise<{ PK: string; SK: string; }> {
        // Construct the input key for the Job
        const inputKey = {
            PK: this.partitianKey.strtr({
                "{companyId}": PK
            }),
            SK: this.sortKeys.SK_INIT.strtr({
                "{id}": SK
            })
        }

        // Check if the document exists in the database
        const existingJob = await CompanyJobModel.get(inputKey);

        // If the job does not exist, throw an error
        if (!existingJob) {
            throw new BaseError(`No Job found`, 404);
        }

        return inputKey;
    }

    /**
     * createJob
     * 
     * Creates a new Job request.
     * 
     * @param {CompanyJobCreateDto} JobDetailsData - Data for the CompanyJob to be created.
     * 
     * @returns {Promise<DbCompanyJobDto>} - Return the type of DbCompanyJobDto Response.
     * 
     * @see {CompanyJobModel} - The model used to interact with the database
     */
    async createJob(JobDetailsData: CompanyJobCreateDto): Promise<DbCompanyJobDto> {
        // Global Logger for the Doa
        global.logger.info("Creating  Job !. [dao]", {
            filePath: __filename,
            methodName: this.createJob.name
        });

        // Unique id of the entry
        let id = UlidService.getUlidId();

        // Construct the data to be saved in the database
        const companyJobDbDetails = {
            ...JobDetailsData,
            PK: this.partitianKey.strtr({
                "{companyId}": JobDetailsData.companyId,
            }),
            SK: this.sortKeys.SK_INIT.strtr({
                "{id}": id
            }),
            GSI1PK: this.GSI1PK,
            GSI1SK: this.GSI1SK.strtr({
                "{id}": id
            }),
            id: id,
        };

        // return the result of the created Job
        return CompanyJobModel.create(companyJobDbDetails);;
    }

    /**
     * getAllJobs
     * 
     * Fetches all the Jobs for the company.
     * 
     * @param {JobListingFilterOptions} jobFilterOptions - The filter options to apply on the Jobs.
     * 
     * @returns {Promise<QueryResponse<DbCompanyJobDto>>} - Returns the list of all Jobs.
     * 
     * @see {CompanyJobModel} - The model used to interact with the database
     */
    async getAllJobs(jobFilterOptions: JobListingFilterOptions): Promise<QueryResponse<DbCompanyJobDto>> {
        // Logger message
        global.logger.info("Fetching All Jobs. [dao]", {
            filePath: __filename,
            methodName: this.getAllJobs.name,
        });

        // Get query for fetching all jobs
        let query = CompanyJobModel.query("GSI1PK")
            .eq(this.GSI1PK)
            .where("GSI1SK")
            .beginsWith("ID#");

        // Apply status filter
        if (jobFilterOptions.status) {
            query = query.and().where("status").eq(jobFilterOptions.status);
        }

        // Apply search options on the jobs
        if (jobFilterOptions.searchText) {
            // Logger message
            global.logger.info("Fetching All Jobs With Search. [dao]", {
                filePath: __filename,
                methodName: this.getAllJobs.name,
                searchTextValue: jobFilterOptions.searchText,
            });

            // Remove trailing and leading spaces
            let searchTextValue = jobFilterOptions.searchText.toLowerCase().trim();

            query = query.and().parenthesis((condition) => {
                condition
                    .where("jobTitle")
                    .contains(searchTextValue)
                    .or()
                    .where("jobDescription")
                    .contains(searchTextValue);

                return condition;
            });
        }

        // Apply company ID filter to filterByCompanyId
        if (jobFilterOptions.companyId?.length) {
            query = query.and().where('companyId').in(jobFilterOptions.companyId);
        }

        // Apply location filter 
        if (jobFilterOptions.location?.length) {
            query = query.and().where('location').in(jobFilterOptions.location);
        }

        // Apply department filter
        if (jobFilterOptions.department?.length) {
            query = query.and().where('department').in(jobFilterOptions.department);
        }

        // Apply softSkills filter
        if (jobFilterOptions.softSkills?.length) {
            jobFilterOptions.softSkills.forEach(skill => {
                query = query.and().where("softSkills").contains(skill);
            });
        }

        // Apply coreSkills filter
        if (jobFilterOptions.coreSkills?.length) {
            jobFilterOptions.coreSkills.forEach(skill => {
                query = query.and().where("coreSkills").contains(skill);
            });
        }

        // Apply technicalSkills filter
        if (jobFilterOptions.technicalSkills?.length) {
            jobFilterOptions.technicalSkills.forEach(skill => {
                query = query.and().where("technicalSkills").contains(skill);
            });
        }


        // Filter by experience range
        if (jobFilterOptions.minExperience !== undefined || jobFilterOptions.maxExperience !== undefined) {
            query = query.and().parenthesis(
                new dynamoose.Condition()
                    .where("experienceRange.min").le(jobFilterOptions.maxExperience)  // To include jobs with maxExperience in the range
                    .and()
                    .where("experienceRange.max").ge(jobFilterOptions.minExperience)  // To include jobs with minExperience in the range

            );
        }

        // Filter options for salary 
        if (jobFilterOptions.minSalary !== undefined || jobFilterOptions.maxSalary !== undefined) {
            query = query.and().parenthesis(
                new dynamoose.Condition()
                    .where("salaryRange.min").le(jobFilterOptions.maxSalary)  // To include jobs with maxSalary in the range
                    .and()
                    .where("salaryRange.max").ge(jobFilterOptions.minSalary)  // To include jobs with maxSalary in the range

            );
        }
        // Apply work mode filter
        if (jobFilterOptions.workMode?.length) {
            query = query.and().where('workMode').in(jobFilterOptions.workMode);
        }

        // When you use the sort() method in Dynamoose, it sorts the items based on the sort key of the index you're querying.
        query = query.sort(
            jobFilterOptions.sortOrder as SortOrderTypeEnum
        );

        // Apply Pagination
        if (jobFilterOptions.lastKey) {
            query = query.startAt(jobFilterOptions.lastKey);
        }

        // Apply pageSize conditions
        if (jobFilterOptions.pageSize) {
            console.log("pageSize", jobFilterOptions.pageSize);
            query = query.limit(jobFilterOptions.pageSize);
        }

        // Execute the query and return the result
        return query.exec();
    }

    /**
    * getJobById
    * 
    * Fetches a Job by its ID.
    * 
    * @param {string} jobId - The ID of the Job to fetch
    * 
    * @returns {Promise<QueryResponse<DbCompanyJobDto>>} - Promise resolving to the fetched Job object
    * 
    * @see {CompanyJobModel} - The model used to interact with the database 
    */
    async getJobById(jobId: string): Promise<QueryResponse<DbCompanyJobDto>> {
        // Logger message
        global.logger.info("Fetching Job by ID. [dao]", {
            filePath: __filename,
            methodName: this.getJobById.name,
            jobId: jobId,
        });

        // Return the final combined data
        return CompanyJobModel.query("GSI1PK")
            .eq(this.GSI1PK)
            .where("GSI1SK")
            .eq(this.GSI1SK.replace("{id}", jobId))
            .exec();
    }

    /**
     * updateJobById
     * 
     * Updates a Job by its ID.
     * 
     * @param {string} jobId - The ID of the Job to update
     * @param {CompanyJobUpdateDto} jobModifiedDetails - The updated Job data
     * 
     * @returns {Promise<DbCompanyJobDto>} - Promise resolving to the updated Job object
     * 
     * @see {CompanyJobModel} - The model used to interact with the database
     */
    async updateJobById(jobId: string, jobModifiedDetails: Partial<CompanyJobUpdateDto>, companyId: string): Promise<DbCompanyJobDto> {
        // Logger message
        global.logger.info("Job Updating !. [dao]", {
            filePath: __filename,
            methodName: this.updateJobById.name,
            jobId: jobId,
            companyJobUpdateApieDto: jobModifiedDetails,
        });

        // Check if the Job exists if exsit then you will get the IDs to proceed further
        const inputKey = await this.getJobByPkAndSk(companyId, jobId);

        // Find and update the Job
        return CompanyJobModel.update(inputKey, jobModifiedDetails)
    }

    /**
     * softDeleteJobById
     * 
     * Deletes a Job by its ID.
     * 
     * @param {string} jobId - The ID of the Job to delete
     * @param {string} companyId - The ID of
     * 
     * @returns {Promise<DbCompanyJobDto>} - Promise resolving to the deleted Job object
     * 
     * @see {CompanyJobModel} - The model used to interact with the database
     */
    async softDeleteJobById(jobId: string, companyId: string): Promise<DbCompanyJobDto> {
        // Logger message
        global.logger.info("Job Deleting !. [dao]", {
            filePath: __filename,
            methodName: this.softDeleteJobById.name,
            jobId: jobId,
            companyId: companyId,
        });

        // Check if the Job exists if exsit then you will get the IDs to proceed further
        const inputKey = await this.getJobByPkAndSk(companyId, jobId);

        // Find and delete the Job
        return CompanyJobModel.update(inputKey, {
            "isDeleted": true,
            "status": CompanyJobStatusEnum.CLOSED
        });
    }
}

// Define Instance of the CompanyDao class
const companyJobDaoObj = new CompanyJobDao();

export {
    CompanyJobDao,
    companyJobDaoObj
};