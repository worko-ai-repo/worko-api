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
import { validateEmailField } from "../schemas/User.schema";

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
            const userCheck = await userCorporateRequestService.getCountByEmail(
              userCorporateRequestDto.userEmail
            );
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
     * sendOtptoVerifyUserForCorporatePage
     *
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next function
     */
    sendOtptoVerifyUserForCorporatePage = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {

            // Extract primary email address from request parameters
            const email = req.params.email;
            const fullName = req.body.fullName;

            // Get user's IP address from request
            const userIpAddress: string = req.ip as string;
            
            // Validate email address, If email validation fails throw a validation error
            const { error } = validateEmailField(email);
            if (error) {
                throw new RequestValidationError(error);
            }
            
            // Send an email to the user to verify their email address.
            const userOtpDetails = await userCorporateRequestService.sendOtptoVerifyUserForCorporatePage(
                email,
                fullName,
                userIpAddress,
            );

            // Send success response with user OTP object
            res.status(HttpStatusCode.OK_200).json({
                id: userOtpDetails.id
            });
            
        } catch (error: any) {
            next(error)
        }
    }

    verifyUserEmailForCorporatePage = async(
        req: Request,
        res: Response,
        next: NextFunction
    ) =>  {
        try {
            // Extract user primary email address from request parameters
            const email = req.params.email;

            // Extract OTP from request body
            const otp = req.body.otp;

            // Validate email address, If email validation fails throw a validation error
            const { error } = validateEmailField(email);
            if (error) {
                throw new RequestValidationError(error);
            }

            // Verify the OTP received from user to make sure the email belogs to the user only.
            const isOtpVerified = await userCorporateRequestService.verifyUserEmailForCorporatePage(
                email,
                otp,
            );

            // Send OTP verification details in the response
            res.status(HttpStatusCode.OK_200).json({verificationStatus: isOtpVerified});
        } catch (error: any) {
            next(error)
        }
    }

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
                
                // @todo : Fix it with token id, it appears that the this API is open, so we wont have the token to get the user id, 
                // consider making appropriate changes to remove this.
                updatedByUserId: "1", 
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
