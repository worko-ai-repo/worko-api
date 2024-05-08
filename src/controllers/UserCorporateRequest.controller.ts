import { UserCorporateRequestUpdateDto } from "./../dtos/UserCorporateRequest.dto";
// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load local DTOs
import {
    UserCorporateRequestCreateApiDto,
    UserCorporateRequestCreateDto,
    UserCorporateRequestFilterDto,
    UserCorporateRequestUpdateApiDto,
} from "../dtos/UserCorporateRequest.dto";

// Import Enum
import { UserCorporateRequestStatusEnum } from "../enums/User.enum";

// Load the Corporate Request service
import userCorporateRequestService from "../services/UserCorporateRequest.service";

// Import schema
import {
    userCorporateRequestCreateApiDtoValidation,
    userCorporateRequestUpdateApiDtoValidation,
} from "../schemas/UserCorporateRequest.schema";

// Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

/**
 * UserCorporateRequestController
 *
 * Class to perform actions related to user Corporate Requests
 */
class UserCorporateRequestController {
    /**
     * createCorporateRequest
     *
     * Create a new Corporate Request for a provided user in request.
     *
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next function
     * @param {UserCorporateRequestCreateApiDto} userCorporateRequestCreateApiDto - UserCorporateRequestCreateApiDto
     * @param {UserCorporateRequestCreateDto} userCorporateRequestCreateDto - UserCorporateRequestCreateDto
     */
    createCorporateRequest = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            // Corporate Request details
            const requestBody: UserCorporateRequestCreateApiDto = req.body;

            // Validate the user input and throw a validation error if necessary
            let { error, value: userCorporateRequestDto } =
                userCorporateRequestCreateApiDtoValidation.validate(requestBody, {
                    abortEarly: false,
                });
            if (error) {
                throw new RequestValidationError(error);
            }

            // Checking whether user is submitting another response or not
            const userCheck = await userCorporateRequestService.getCountByEmail(requestBody.userEmail);
            if (userCheck.count) {
                return res.status(HttpStatusCode.CONFLICT_409).json({ error: "User has already Submitted the Form" });
            }

            // create final responseDTO 
            const userCorporateRequestCreateDto: UserCorporateRequestCreateDto = {
                ...userCorporateRequestDto,
                status: UserCorporateRequestStatusEnum.OPEN,
            };

            // Create Corporate Request as requested
            const corporateRequest =
                await userCorporateRequestService.createCorporateRequest(
                    userCorporateRequestCreateDto.userEmail,
                    userCorporateRequestCreateDto
                );

            // Send response indicating success
            res.status(HttpStatusCode.CREATED_201).json(corporateRequest);  

        } catch (error: any) {
            // Pass the error to the error handling middleware
            next(error);
        }
    };

    /**
     * getUserCorporateRequestList
     *
     * Controller method to retrieve user corporate request lists also based on provided filters.
     *
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next function
     */
    getUserCorporateRequestList = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            // Extract filter options from request parameters
            //@todo Add Required validation for below filterOptions
            const filterOptions: UserCorporateRequestFilterDto = req.query;

            // Call the service method to get user corporate request list based on the filter options
            const corporateRequestList =
                await userCorporateRequestService.getUserCorporateRequestList(
                    filterOptions
                );

            // Send the response with the retrieved user corporate request
            res.status(200).json(corporateRequestList);
        } catch (error: any) {
            // Pass the error
            next(error);
        }
    };

    /**
     * getCorporateRequestById
     *
     * Controller method to retrieve user corporate request details based request Id.
     *
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next function
     */
    getCorporateRequestById = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            // Extract filter options from request parameters
            const requestId = req.params.requestId;

            // Call the service method to get user corporate request details based on request Id
            const corporateRequest =
                await userCorporateRequestService.getCorporateRequestById(requestId);

            // Send the response with the retrieved user corporate request
            res.status(200).json(corporateRequest);
        } catch (error: any) {
            // Pass the error
            next(error);
        }
    };

    /**
     * updateCorporateRequestById
     *
     * Update an existing corporate request by its ID.
     *
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next function
     */
    updateCorporateRequestById = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            // Extract request ID from request parameters
            const requestId = req.params.requestId;

            // Extract updated corporate request data from request body
            const userCorporateRequestUpdatedApiPlayload: UserCorporateRequestUpdateApiDto =
                req.body;

            // Validate the user input and throw a validation error if necessary
            let { error, value: validatedCorporateRequestApiPayload } =
                userCorporateRequestUpdateApiDtoValidation.validate(
                    userCorporateRequestUpdatedApiPlayload,
                    { abortEarly: false }
                );
            if (error) {
                throw new RequestValidationError(error);
            }

            // Prepare final updated corporate request data
            let updatedCorporateRequestData: UserCorporateRequestUpdateDto = {
                ...validatedCorporateRequestApiPayload,
                updatedByUserId: "1", // @todo Replace this with the user id received in the token
            };

            // Call the 'getCorporateRequestById' from UserCorporateRequestService to retrieve the request details
            let userCorporateRequestDetail =
                await userCorporateRequestService.getCorporateRequestById(requestId);

            // fetch the userEmail from the request details
            let userEmail = userCorporateRequestDetail[0].userEmail;

            // Call the service to update the corporate request
            const updatedCorporateRequest =
                await userCorporateRequestService.updateCorporateRequestById(
                    userEmail,
                    requestId,
                    updatedCorporateRequestData
                );

            // Send response with updated corporate request data
            res.status(HttpStatusCode.OK_200).json(updatedCorporateRequest);
        } catch (error: any) {
            // Pass the error to the error handling middleware
            next(error);
        }
    };
}
export default UserCorporateRequestController;
