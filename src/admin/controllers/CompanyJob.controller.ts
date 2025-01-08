//Import Common express functions
import { Request, Response, NextFunction } from "express";

// Import Ulidx package
import { uuidToULID } from "ulidx";

// Import Constants
import APP_CONSTANTS from "../../configs/constants.config";

// Load dtos
import { RecordListingResponseDTO } from "../../dtos/Common.dto"
import {
    CompanyJobCreateApiDto,
    CompanyJobCreateDto,
    CompanyJobUpdateApiDto,
    CompanyJobUpdateDto,
    JobListingFilterOptions,
    JobListingFilterRequestDTO,
    JobsWithCompanyResDto,
    ParsedJobDescriptionApiDto,
    ParsedJobDescriptionResponseDto,
} from "../dtos/CompanyJob.dto";

// Load Enums
import { InternalUserRoleEnum } from "../../enums/Common.enum";

// Load helpers
import { RequestHelper } from "../../helpers/request.helper"
import { paginationResponseHelperObj } from "../../helpers/pagination-response.helper";

// import models
import { DbCompanyDetailDto } from "../../db/models/CompanyDetail.model";
import { DbCompanyJobDto } from "../../db/models/CompanyJob.model";

// Load Schemas
import {
    companyJobCreateApiDtoValidation,
    CompanyJobFilterDtoValidation,
    parsedJobDescriptionApiDtoValidation,
    updateCompanyJobApiDtoValidation
} from "../schemas/CompanyJob.schema";

// Load Services
import { companyJobServiceObj } from "../services/CompanyJob.service";

// Load utils
import { RequestValidationError } from "../../utils/errors.util";
import HttpStatusCode from "../../utils/http-codes.util";

/**
 * CompanyJobController
 */
class CompanyJobController {

    // class variable to store the admin groups
    adminGroups = [
        APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.ADMIN,
        APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.CORPORATE_ADMIN,
        APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.CORPORATE_RECRUITER,
    ];
    

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
        global.logger.info("Creating Job. [controller]", {
            filePath: __filename,
            methodName: this.createJob.name,
        });

        try {
            // Read the "userId" of the user from the global object
            const tokenUserId: string = global.requestLocalContext.userId;

            // Read the "cognitoUserGroups" of the user from the global object
            const cognitoUserGroups: string[] = global.requestLocalContext.cognitoUserGroups;

            // Store the request body according to the dto.
            const requestBody: CompanyJobCreateApiDto = req.body;

            // Validate the user input and throw a validation error if necessary using the Joi schema
            const { error, value: companyJobCreateApiDto } = companyJobCreateApiDtoValidation.validate(requestBody, { abortEarly: false });
            if (error) {
                // Throw the validation error with details
                throw new RequestValidationError(error);
            }

            let createdByUserId: string | undefined;
            let createdByCorporateUserId: string | undefined;

            // If the user is a corporate user then set the `createdByCorporateUserId` else set the `createdByUserId`
            if (
                cognitoUserGroups.includes(
                    APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.CORPORATE_ADMIN
                ) || 
                cognitoUserGroups.includes(
                    APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.CORPORATE_RECRUITER
                )
            ) {
                createdByCorporateUserId = uuidToULID(tokenUserId);
                global.logger.info(`User is a corporate recruiter/admin with ID: ${createdByCorporateUserId}. [controller]`)
            } else {
                createdByUserId = tokenUserId;
                global.logger.info(`User is a worko admin with ID: ${createdByUserId}. [controller]`)
            }

            // Create ResponseDTO 
            const companyJobCreateDto: CompanyJobCreateDto = {
                ...companyJobCreateApiDto,
                createdByUserId,
                createdByCorporateUserId,
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
     * parseJobDescription
     * 
     * @param req - The request object
     * @param res - The response object
     * @param next - The next middleware function
     */
    parseJobDescription = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Global Logger for the Parse Job Description Controller
            global.logger.info("Parsing Job Description. [controller]", {
                filePath: __filename,
                methodName: this.parseJobDescription.name,
            });

            // read the request body
            const requestBody: ParsedJobDescriptionApiDto = req.body;

            // Validate the user input and throw a validation error if it is not valid
            const { error, value: parsedJobDescriptionApiDto } = parsedJobDescriptionApiDtoValidation.validate(
                requestBody, 
                { abortEarly: false }
            );
            if (error) {
                // Throw the validation error with details
                throw new RequestValidationError(error);
            }

            // Parse the job description using the service.[Service Call]
            const parsedJobDescription: ParsedJobDescriptionResponseDto = await companyJobServiceObj.parseJobDescription(parsedJobDescriptionApiDto);

            return res.status(HttpStatusCode.OK_200).json(parsedJobDescription);
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
     * @see {CompanyJobFilterDtoValidation} - The JOI schema used to validate the request body.
     */
    getAllJobs = async (req: Request, res: Response, next: NextFunction) => {
        // Global Logger for the Get All Jobs Controller
        global.logger.info("Fetching All Jobs. [controller]", {
            filePath: __filename,
            methodName: this.getAllJobs.name,
        });

        try {
            // Create JobListingFilterRequest var to store the filter options and parse the lastKey
            const jobListingFilterRequest: JobListingFilterOptions = RequestHelper.parseFilterOptions<
                JobListingFilterRequestDTO,
                JobListingFilterOptions>(req.query as unknown as JobListingFilterRequestDTO);

           // Read the "cognitoUserGroups" of the user from the global object
           const cognitoUserGroups: string[] = global.requestLocalContext.cognitoUserGroups;
            
           global.logger.debug("Checking User Type for fetching all jobs [controller]" + cognitoUserGroups,{
               filePath: __filename,
               methodName: this.getJobById.name,
               cognitoUserGroup: cognitoUserGroups,
               endpoint: req.originalUrl,
           })
           
            // Determine userType based on your application logic
            // const userType = (req.baseUrl.indexOf('public') !== -1) ? 'user' : 'admin';

            // Validate the request using the appropriate schema
            let { error, value: jobFilterOptions } = CompanyJobFilterDtoValidation(InternalUserRoleEnum.ADMIN)
                .validate(
                    jobListingFilterRequest,
                    { abortEarly: false }
                );
            if (error) {
                throw new RequestValidationError(error);
            }

            // Call the service to fetch all jobs [Service Call]
            const companyJob = await companyJobServiceObj.getJobsWithCompanyDetails(jobFilterOptions);

            // Extract the count, timesQueried,lastKey and other details from the response
            const { lastKey, count, timesQueried, queriedCount, jobsWithCompanyDetails } = companyJob;

            // Response Building by adding the pagination details
            let companyJobResponse: RecordListingResponseDTO<(
                DbCompanyJobDto & { companyDetails: DbCompanyDetailDto | undefined })[]> =
                paginationResponseHelperObj.customizedPaginationRecordListingResponse<(DbCompanyJobDto & { companyDetails: DbCompanyDetailDto | undefined })[], JobListingFilterOptions>(
                    jobsWithCompanyDetails,
                    jobListingFilterRequest,
                    count,
                    timesQueried,
                    lastKey,
                    queriedCount
                );
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
        global.logger.info("Fetching Job by ID. [controller]", {
            filePath: __filename,
            methodName: this.getJobById.name,
        });

        try {
           // Read the "cognitoUserGroups" of the user from the global object
            const cognitoUserGroups: string[] = global.requestLocalContext.cognitoUserGroups;
            
            global.logger.debug("Checking User Type for fetching jobs by Id [controller]" + cognitoUserGroups,{
                filePath: __filename,
                methodName: this.getJobById.name,
                cognitoUserGroup: cognitoUserGroups,
                endpoint: req.originalUrl,
            })

            // Extract the Job ID from the request parameters
            const jobId = req.params.jobId;

            // Call the service to fetch the Job by ID [Service Call]
            const jobDetailsById: (DbCompanyJobDto & {
              companyDetails: DbCompanyDetailDto | undefined;
            })[] = await companyJobServiceObj.getJobByIdWithCompanyDetails(
              jobId
            );

            // Return the final data structure in abstracted form
            // @todo: it will return the array of single object which is not good response structure convention
            // because we are retrieving the job by Id, so we can return single object
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
        global.logger.info("Updating Job. [controller]", {
            filePath: __filename,
            methodName: this.updateJobById.name,
        });

        try {
            // Read the "userId" of the user from the token
            const cognitoUserId: string = global.requestLocalContext.userId;

            const cognitoUserGroups: string[] = global.requestLocalContext.cognitoUserGroups;

            // Extract the Job ID from the request parameters
            const jobId = req.params.jobId;

            // Extract the updated Job data from the request body
            const requestBody: CompanyJobUpdateApiDto = req.body;

            // Validate the user input
            const { error, value: companyJobUpdateApiDto } = updateCompanyJobApiDtoValidation.validate(requestBody, { abortEarly: false });
            if (error) {
                throw new RequestValidationError(error);
            }

            let updatedByUserId: string | undefined;
            let updatedByCorporateUserId: string | undefined;

            // If the user is a corporate user then set the `updatedByCorporateUserId` else set the `updatedByUserId`
            if (
              cognitoUserGroups.includes(
                APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.CORPORATE_ADMIN
              ) ||
              cognitoUserGroups.includes(
                APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.CORPORATE_RECRUITER
              )
            ) {
              updatedByCorporateUserId = uuidToULID(cognitoUserId);
              global.logger.info(
                `User is a corporate recruiter/admin with ID: ${updatedByCorporateUserId}. [controller]`
              );
            } else {
              updatedByUserId = cognitoUserId;
              global.logger.info(
                `User is a worko admin with ID: ${updatedByUserId}. [controller]`
              );
            }

            // Prepare the update data
            const companyJobUpdateDto: CompanyJobUpdateDto = {
                ...companyJobUpdateApiDto,
                updatedByUserId: updatedByUserId,
                updatedByCorporateUserId: updatedByCorporateUserId
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
        global.logger.info("Deleting Job. [controller]", {
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