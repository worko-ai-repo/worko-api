//Import Common express functions
import { Request, Response, NextFunction } from "express";

//Load Common Dto
import { RecordListingResponseDTO } from "../../dtos/Common.dto"

//Load Common Enums
import { SortOrderTypeEnum } from "../../enums/Common.enum"

// Load dtos
import {
    CompanyJobCreateApiDto,
    CompanyJobCreateDto,
    CompanyJobUpdateApiDto,
    CompanyJobUpdateDto,
    JobListingFilterOptions,
    JobListingFilterRequestDTO,
    JobsWithCompanyResDto,
} from "../dtos/CompanyJob.dto";

// Load the dynamoose helper for lastKeyToBase64EncodeStr
import { lastKeyToBase64EncodeStr } from "../../helpers/dynamoose.helper"

// Load joiSchema
import {
    companyJobCreateApiDtoValidation,
    jobsFilterDtoValidation,
    updateCompanyJobApiDtoValidation
} from "../schemas/CompanyJob.schema";

// Load Services
import { companyJobServiceObj } from "../services/CompanyJob.service";

// Load Request helper
import { RequestHelper } from "../../helpers/request.helper"

// Load utils
import { RequestValidationError } from "../../utils/errors.util";
import HttpStatusCode from "../../utils/http-codes.util";

class CompanyJobController {
    /**
     * createJob 
     * 
     * Creates new Job by ADMIN
     * 
     * Creates a new job by taking companyId as req body and checking if the company exists or not if not  then throw error.
     * 
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     * @param {NextFunction} next - The next middleware function.
     * 
     * @throws {RequestValidationError} - If the job data is not valid.
     * @throws {Error} - If an error occurs while creating the job.
     * 
     * @see {CompanyJobCreateApiDto} - The DTO used as requestDTO to create a new job for the company.
     * @see {CompanyJobCreateDto} - The DTO used as responseDTO to create a new job for the company.
     * @see {companyJobCreateApiDtoValidation} - The JOI schema used to validate the request body.
     */
    createJob = async (req: Request, res: Response, next: NextFunction) => {
        // Global logger for Logging create Job controller 
        global.logger.info("Creating Job. [admin controller]", {
            filePath: __filename,
            methodName: this.createJob.name,
        });

        try {
            // Read the "userId" of the user from the token
            const tokenUserId = res.locals.userId;
            global.logger.info("Token User ID: ", tokenUserId);

            // Store the request body according to the dto.
            const requestBody: CompanyJobCreateApiDto = req.body;

            // Validate the user input and throw a validation error if necessary using the Joi schema
            const { error, value: companyJobCreateApiDto } = companyJobCreateApiDtoValidation.validate(requestBody, { abortEarly: false });
            if (error) {
                // Throw the validation error with details
                throw new RequestValidationError(error);
            }

            // Create ResponseDTO 
            const companyJobCreateDto: CompanyJobCreateDto = {
                ...companyJobCreateApiDto,
                createdByUserId: tokenUserId ?? "0"
            };

            // Create the job using the service.[Service Call]
            const createdcompanyJob = await companyJobServiceObj.createJob(companyJobCreateDto);
            return res.status(HttpStatusCode.CREATED_201).json(createdcompanyJob);
        } catch (error) {
            // Handle errors by passing the error message to the next middleware
            next(error);
        }
    }

    /**
     * getAllJobs 
     * 
     * Fetches all the jobs for the company based on the filter options provided in the query parameters.
     * 
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     * @param {NextFunction} next - The next middleware function.
     * 
     * @throws {RequestValidationError} - If the filter options are not valid.
     * @throws {Error} - If an error occurs while fetching the jobs.
     * 
     * @see {JobListingFilterRequestDTO} - The request DTO Body.
     * @see {JobListingFilterOptions} - The response DTO Body.
     * @see {jobsFilterDtoValidation} - The JOI schema used to validate the request body.
     */
    getAllJobs = async (req: Request, res: Response, next: NextFunction) => {
        // Global Logger for the Get All Jobs Controller
        global.logger.info("Fetching All Jobs. [admin controller]", {
            filePath: __filename,
            methodName: this.getAllJobs.name,
        });

        try {
            // Create JobListingFilterRequest var to store the filter options and parse the lastKey
            const jobListingFilterRequest: JobListingFilterOptions = RequestHelper.parseFilterOptions<
                JobListingFilterRequestDTO,
                JobListingFilterOptions>(req.query as unknown as JobListingFilterRequestDTO);

            // Determine userType based on your application logic
            const userType = (req.baseUrl.indexOf('admin') !== -1) ? 'admin' : 'user';

            // Validate the request using the appropriate schema
            let { error, value: jobFilterOptions } = jobsFilterDtoValidation(userType)
                .validate(
                    jobListingFilterRequest,
                    { abortEarly: false }
                );
            if (error) {
                throw new RequestValidationError(error);
            }

            // Call the service to fetch all jobs [Service Call]
            const companyJob = await companyJobServiceObj.getJobsWithCompanyDetails(jobFilterOptions);

            // Response Building by adding the pagination details
            let companyJobResponse: RecordListingResponseDTO<JobsWithCompanyResDto[]>;
            companyJobResponse = {
                data: companyJob.data,
                pagination: {
                    count: companyJob.count,
                    queriedCount: companyJob.queriedCount,
                    pageSize: jobListingFilterRequest.pageSize,
                    lastKey: lastKeyToBase64EncodeStr(companyJob.lastKeyVal),
                    sortOrder: jobListingFilterRequest.sortOrder ?? SortOrderTypeEnum.ASCENDING,
                },
            };
            return res.status(HttpStatusCode.OK_200).json(companyJobResponse);
        } catch (error) {
            // Handle errors by passing the error message to the next middleware
            next(error);
        }
    }

    /**
     * getJobById
     * 
     * Fetches a job by its ID.
     * 
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     * @param {NextFunction} next - The next middleware function.
     * 
     * @throws {Error} - If an error occurs while fetching the job.'
     */
    getJobById = async (req: Request, res: Response, next: NextFunction) => {
        // Global Logger for the Get Job By Id Controller
        global.logger.info("Fetching Job by ID. [admin controller]", {
            filePath: __filename,
            methodName: this.getJobById.name,
        });

        try {
             // Determine userType based on your application logic
             const userType = (req.baseUrl.indexOf('admin') !== -1) ? 'admin' : 'user';

            // Extract the Job ID from the request parameters
            const jobId = req.params.jobId;

            // Call the service to fetch the Job by ID [Service Call]
            const jobDetailsById = await companyJobServiceObj.getJobByIdWithCompanyDetails(jobId,userType);

            //Return the final data structure in abstracted form
            return res.status(HttpStatusCode.OK_200).json(jobDetailsById);
        } catch (error) {
            // Handle errors by passing the error message to the next middleware
            next(error);
        }
    }

    /**
     * updateJobById
     * 
     * Updates a current Job using the JobId.
     * 
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     * @param {NextFunction} next - The next middleware function.
     * 
     * @throws {RequestValidationError} - If the job data is not valid.
     * @throws {Error} - If an error occurs while updating the job.
     * 
     * @see {CompanyJobUpdateApiDto} - The DTO used as requestDTO to update a job for the company.
     * @see {CompanyJobUpdateDto} - The DTO used as responseDTO to update a job for the company.
     * @see {updateCompanyJobApiDtoValidation} - The JOI schema used to validate the request body.
     */
    updateJobById = async (req: Request, res: Response, next: NextFunction) => {
        // Global Logger for the Update Job Controller
        global.logger.info("Updating Job. [admin controller]", {
            filePath: __filename,
            methodName: this.updateJobById.name,
        });

        try {
            // Read the "userId" of the user from the token
            const tokenUserId = res.locals.userId;

            // Extract the Job ID from the request parameters
            const jobId = req.params.jobId;

            // Extract the updated Job data from the request body
            const requestBody: CompanyJobUpdateApiDto = req.body;

            // Validate the user input
            const { error, value: companyJobUpdateApiDto } = updateCompanyJobApiDtoValidation.validate(requestBody, { abortEarly: false });
            if (error) {
                throw new RequestValidationError(error);
            }

            // Prepare the update data
            const companyJobUpdateDto: CompanyJobUpdateDto = {
                ...companyJobUpdateApiDto,
                updatedByUserId: tokenUserId ?? "0",
            }

            // Call the service to update the Job
            const updatedJob = await companyJobServiceObj.updateJobById(jobId, companyJobUpdateDto);
            return res.status(HttpStatusCode.OK_200).json(updatedJob);
        } catch (error) {
            // Handle errors by passing the error message to the next middleware
            next(error);
        }
    }

    /** 
     * deleteJobById
     * 
     * Soft Deletes a job by its ID.
     * 
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     * @param {NextFunction} next - The next middleware function.
     * 
     * @throws {Error} - If an error occurs while deleting the job.
     */
    softDeleteJobById = async (req: Request, res: Response, next: NextFunction) => {
        // Global Logger for the Delete Job Controller
        global.logger.info("Deleting Job. [admin controller]", {
            filePath: __filename,
            methodName: this.softDeleteJobById.name,
        });

        try {
            // Extract the Job ID from the request parameters
            const { jobId } = req.params;

            // Extract the updated Job data from the request body
            const { companyId } = req.body;

            // Validate the user input
            if (!companyId) {
                throw new global.Error("CompanyId is required.");
            }

            // Call the service to update the Job
            const updatedJob = await companyJobServiceObj.softDeleteJobById(jobId, companyId);
            return res.status(HttpStatusCode.OK_200).json(updatedJob);
        } catch (error) {
            // Handle errors by passing the error message to the next middleware
            next(error);
        }
    }
};

export default CompanyJobController;