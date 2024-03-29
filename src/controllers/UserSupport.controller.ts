// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load local DTOs
import { UserSupportCreateApiDto, UserSupportCreateDto, UserSupportFilterDto, UserSupportUpdateApiDto } from '../dtos/UserSupport.dto';

// Import Enum
import { UserSupportStatusEnum, UserType } from "../enums/User.enum";

// Load the Support service
import userSupportService from "../services/UserSupport.service";

// Import schema
import { userSupportCreateApiDtoValidation, userSupportUpdateApiDtoValidation } from "../schemas/UserSupport.schema";

// Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

/**
 * UserSupportController
 *
 * Class to perform actions related to user Support
 */
class UserSupportController {
    /**
     * createSupport
     *
     * Create a new Support for a provided user in request.
     *
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next function
     * @param {UserSupportCreateApiDto} userSupportCreateApiDto - UserSupportCreateApiDto
     * @param {UserSupportCreateDto} userSupportCreateDto - UserSupportCreateDto
     */
    createSupport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Support request details
            const requestBody: UserSupportCreateApiDto = req.body;

            // Validate the user input and throw a validation error if necessary
            let { error, value: userSupportDto } = userSupportCreateApiDtoValidation
                .validate(requestBody, { abortEarly: false });
            if (error) {
                throw new RequestValidationError(error);
            }

            // create responseDTO
            const userSupportCreateDto: UserSupportCreateDto = {
                ...userSupportDto,
                status: UserSupportStatusEnum.OPEN,
            }
            // Create Support as requested
            const result = await userSupportService.createSupport(userSupportCreateDto.userEmail, userSupportCreateDto);

            // Send response indicating success
            res.status(HttpStatusCode.CREATED_201).json(result);
        } catch (error: any) {
            // Pass the error to the error handling middleware
            next(error);
        }
    };

    /**
     * getUserSupportList
     * 
     * Controller method to retrieve user support lists also based on provided filters.
     * 
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next function
     */
    getUserSupportList = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Extract filter options from request parameters
            //@todo Add Required validation for below filterOptions
            const filterOptions: UserSupportFilterDto = req.query;

            // Call the service method to get user support list based on the filter options
            const result = await userSupportService.getUserSupportList(filterOptions);

            // Send the response with the retrieved user support
            res.status(200).json(result);
        } catch (error: any) {
            // Pass the error 
            next(error);
        }
    }

    /**
     * getUserSupportById
     * 
     * Controller method to retrieve user support details based support Id.
     * 
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next function
     */
    getSupportById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Extract filter options from request parameters
            const supportId = req.params.supportId;

            // Call the service method to get user support details based on support Id
            const result = await userSupportService.getSupportById(supportId);

            // Send the response with the retrieved user support
            res.status(200).json(result);
        } catch (error: any) {
            // Pass the error 
            next(error);
        }
    }

    /**
    * updateSupportById
    *
    * Update an existing support by its ID.
    *
    * @param {Request} req - Express request object
    * @param {Response} res - Express response object
    * @param {NextFunction} next - Express next function
    */
    updateSupportById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Extract support ID from request parameters
            const supportId = req.params.supportId;

            // Extract updated support data from request body
            const updatedSupportData: UserSupportUpdateApiDto = req.body;

            // Validate the user input and throw a validation error if necessary
            let { error, value: userSupportUpdateDto } = userSupportUpdateApiDtoValidation
                .validate(updatedSupportData, { abortEarly: false });
            if (error) {
                throw new RequestValidationError(error);
            }

            // Call the 'getSupportById' from UserSupportService to retrieve the support details
            let userSupportDetail = await userSupportService.getSupportById(supportId);

            // fetch the userEmail from the support details
            let userEmail = userSupportDetail[0].userEmail;

            // Call the service to update the support request
            const updatedSupport = await userSupportService.updateSupportById(userEmail, supportId, userSupportUpdateDto);

            // Send response with updated support data
            res.status(HttpStatusCode.OK_200).json(updatedSupport);
        } catch (error: any) {
            // Pass the error to the error handling middleware
            next(error);
        };
    }
}
export default UserSupportController;
