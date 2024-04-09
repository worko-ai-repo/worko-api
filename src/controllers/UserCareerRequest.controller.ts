// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load local DTOs
import {
  UserCareerRequestCreateApiDto,
  UserCareerRequestCreateDto,
  UserCareerRequestFilterDto,
  UserCareerRequestUpdateApiDto,
  UserCareerRequestUpdateDto,
} from "../dtos/UserCareerRequest.dto";

// Import Enum
import { UserCareerRequestStatusEnum } from "../enums/User.enum";

// import the services
import userCareerRequestService from "../services/UserCareerRequest.service";

// Import schemas
import {
  userCareerRequestCreateApiDtoValidation,
  userCareerRequestUpdateApiDtoValidation,
} from "../schemas/UserCareerRequest.schema";

// Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

/**
 * UserCareerRequestController
 *
 * Class to perform actions related to user Career Requests
 */
class UserCareerRequestController {

  /**
    * Creates a new career request record
    * 
    * This function handles creating a new career request. It validates the request
    * data, creates the career request object using the service, and returns a
    * success response on completion. Any errors are passed to the next middleware.
    * 
    * @param {Request} req - The HTTP request object
    * @param {Response} res - The HTTP response object
    * @param {NextFunction} next - The next middleware function
    * @returns {Promise<void>} - Returns a promise that resolves when the career request has been created
    */
  createCareerRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Career Request details
      const requestBody: UserCareerRequestCreateApiDto = req.body;

      // Validate the user input and throw a validation error if necessary
      let { error, value: userCareerRequestDto } =
        userCareerRequestCreateApiDtoValidation.validate(requestBody, {
          abortEarly: false,
        });
      if (error) {
        throw new RequestValidationError(error);
      }

      // create final responseDTO
      const userCareerRequestCreateDto: UserCareerRequestCreateDto = {
        ...userCareerRequestDto,
        status: UserCareerRequestStatusEnum.APPLIED,
      };

      // Create Career Request as requested
      const careerRequest = await userCareerRequestService.createCareerRequest(
        userCareerRequestCreateDto.userEmail,
        userCareerRequestCreateDto
      );

      // Send response indicating success
      res.status(HttpStatusCode.CREATED_201).json(careerRequest);
    } catch (error: any) {
      // Pass the error to the error handling middleware
      next(error);
    }
  };

  /**
   * getUserCareerRequestList
   *
   * Controller method to retrieve user career request lists also based on provided filters.
   *
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function
   */
  getUserCareerRequestList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Extract filter options from request parameters
      //@todo Add Required validation for below filterOptions
      const filterOptions: UserCareerRequestFilterDto = req.query;

      // Call the service method to get user career request list based on the filter options
      const careerRequestList =
        await userCareerRequestService.getUserCareerRequestList(filterOptions);

      // Send the response with the retrieved user career request
      res.status(200).json(careerRequestList);
    } catch (error: any) {
      // Pass the error
      next(error);
    }
  };

  /**
   * getCareerRequestById
   *
   * Controller method to retrieve user career request details based request Id.
   *
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function
   */
  getCareerRequestById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Extract filter options from request parameters
      const requestId = req.params.requestId;

      // Call the service method to get user career request details based on request Id
      const careerRequest = await userCareerRequestService.getCareerRequestById(
        requestId
      );

      // Send the response with the retrieved user career request
      res.status(200).json(careerRequest);
    } catch (error: any) {
      // Pass the error
      next(error);
    }
  };

  /**
   * updateCareerRequestById
   *
   * Update an existing career request by its ID.
   *
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function
   */
  updateCareerRequestById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Extract request ID from request parameters
      const requestId = req.params.requestId;

      // Extract updated career request data from request body
      const userCareerRequestUpdatedApiPlayload: UserCareerRequestUpdateApiDto =
        req.body;

      // // Validate the user input and throw a validation error if necessary
      let { error, value: validatedCareerRequestApiPayload } =
        userCareerRequestUpdateApiDtoValidation.validate(
          userCareerRequestUpdatedApiPlayload,
          { abortEarly: false }
        );
      if (error) {
        throw new RequestValidationError(error);
      }

      // Prepare final updated career request data
      let updatedCareerRequestData: UserCareerRequestUpdateDto = {
        ...validatedCareerRequestApiPayload,
        updatedByUserId: "1", // @todo : Fix it with token id
      };

      // Call the 'getCareerRequestById' from UserCareerRequestService to retrieve the request details
      let userCareerRequestDetail =
        await userCareerRequestService.getCareerRequestById(requestId);

      // fetch the userEmail from the request details
      let userEmail = userCareerRequestDetail[0].userEmail;

      // Call the service to update the career request
      const updatedCareerRequest =
        await userCareerRequestService.updateCareerRequestById(
          userEmail,
          requestId,
          updatedCareerRequestData
        );

      // Send response with updated career request data
      res.status(HttpStatusCode.OK_200).json(updatedCareerRequest);
    } catch (error: any) {
      // Pass the error to the error handling middleware
      next(error);
    }
  };
}
export default UserCareerRequestController;
