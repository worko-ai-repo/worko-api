// Import the necessary npm packages
import { Request, Response, NextFunction } from "express";

// Import the DTO
import {
  UsersListingFilterOptions,
  UsersListingFilterRequestDTO,
} from "../dtos/User.dto";
import { RecordListingResponseDTO } from "../../dtos/Common.dto";

// Import the helpers for dynamoose
import { lastKeyToBase64EncodeStr } from "../../helpers/dynamoose.helper";

// Import the enums
import { UserType } from "../../enums/User.enum";

// Import the helpers
import { RequestHelper } from "../../helpers/request.helper";

// Import the services
import { userServiceObj } from "../services/User.service";

// Import the schemas
import { validateEmailField } from "../../schemas/User.schema";

// Import the utils
import HttpStatusCode from "../../utils/http-codes.util";
import { BaseError, RequestValidationError } from "../../utils/errors.util";

/**
 * UserController
 *
 * The controller class for handling http requests related to user details
 */
class UserController {
  /**
   * getUsers
   *
   * Get user details by CAND/EMP.
   *
   * This function retrieves user details based on the provided filter options in the request query parameters.
   * If a userType is provided in the filter options and it is not valid, an error is thrown.
   * It logs the action for debugging purposes, parses and validates the filter options,
   * retrieves the user details from the user service, and sends the response as a JSON object.
   *
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   * @throws {BaseError} If the provided userType is not a valid UserType.
   */
  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action of getting user details by CAND/EMP
      global.logger.info("Get user details by CAND/EMP [admin user controller]");

      // Parse filter options from the request query parameters
      const usersRecordListingFilterRequest: UsersListingFilterOptions =
        RequestHelper.parseFilterOptions<
          UsersListingFilterRequestDTO,
          UsersListingFilterOptions
        >(req.query as unknown as UsersListingFilterRequestDTO);

      // Validation to ensure userType is a valid UserType
      if (
        usersRecordListingFilterRequest.userType &&
        !Object.values(UserType).includes(
          usersRecordListingFilterRequest.userType
        )
      ) {
        throw new BaseError(
          `The Provided userType: "${usersRecordListingFilterRequest.userType}" is invalid.So, it should be one of "${Object.values(UserType).join(", ")}".`
        );
      }

      // Fetch user details from the service
      const userDetails = await userServiceObj.getUsers(usersRecordListingFilterRequest);
      
      // Create the response object with the fetched user details
      let usersResponse: RecordListingResponseDTO;

      // If userDetails is of type QueryResponse<DbUserDetailDto>
      if (
        "count" in userDetails && "queriedCount" in userDetails && "lastKey" in userDetails
      ) {
        usersResponse = {
          data: userDetails,
          pagination: {
            count: userDetails.count,
            queriedCount: userDetails.queriedCount,
            pageSize: usersRecordListingFilterRequest.pageSize,
            lastKey: lastKeyToBase64EncodeStr(userDetails.lastKey),
          },
        };
      } else {
        // If userDetails is of type DbUserDetailDto[] or [] or employee details with current company details
        // @todo: In near future need to apply pagination properly for retrieving data using userType CAND/EMP
        usersResponse = {
          data: userDetails,
          pagination: {
            count: userDetails.length,
            pageSize: usersRecordListingFilterRequest.pageSize,
          },
        };
      }

      // Send the response with the fetched user details
      return res.status(HttpStatusCode.OK_200).json(usersResponse);
    } catch (error) {
      // Pass the error to the next middleware
      next(error);
    }
  };

  /**
   * getUserDetailById
   *
   * Get user details by ID.
   *
   * This asynchronous function handles HTTP requests to fetch user details by ID.
   * It logs the action, extracts the user ID from the request parameters, fetches the user details from the service,
   * and returns the user details in the HTTP response. If an error occurs, it passes the error to the next middleware function.
   *
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @param {NextFunction} next - The next middleware function.
   * @throws {BaseError} - user not found with the provided id
   */
  getUserDetailById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Log the action of getting user details by id
      global.logger.info("Get user details by id [admin user controller]");

      // Extract id from request parameters
      const userId = req.params.id as string;

      // Fetch user details by id from the service, if not found then return 404
      const userDetails = await userServiceObj.getUserDetailById(userId);
      if (!userDetails.count) {
        throw new BaseError(
          `The user with the provided "${userId}" id is not found.`,
          HttpStatusCode.NOT_FOUND_404
        );
      }

      // Return the response with user details
      return res.status(HttpStatusCode.OK_200).json(userDetails[0]);
    } catch (error) {
      // Pass the error to the next middleware function
      next(error);
    }
  };

  /**
   * getUserDetailByEmail
   *
   * Controller function to get user details by email
   *
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   * @throws {RequestValidationError} If the email is invalid
   * @throws {BaseError} If the user is not found with the provided email
   */
  getUserDetailByEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Log the action of getting user details
      global.logger.info("Get user details by email by [admin user controller]");

      // Extract email from request parameters
      const userEmail = req.params.emailId as string;

      // Validate email field and throw error if invalid
      const { error } = validateEmailField(userEmail);
      if (error) {
        throw new RequestValidationError(error);
      }

      // Fetch user details by email from the service
      const userDetails = await userServiceObj.getUserDetailByEmail(userEmail);
      if (!userDetails.count) {
        throw new BaseError(
          `The user with the provided "${userEmail}" email is not found.`,
          HttpStatusCode.NOT_FOUND_404
        );
      }

      // Return the response with user details
      return res.status(HttpStatusCode.OK_200).json(userDetails[0]);
    } catch (error) {
      // Pass the error to the next middleware function
      next(error);
    }
  };

  /**
   * getReferralResponsesByEmpEmail
   *
   * Controller function to retrieve the referral responses made by employee based on email
   *
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  getReferralResponsesByEmpEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Log the action of getting referral response
      global.logger.info(
        "Get user referral responses by employee email by [admin user controller]"
      );

      // Extract email from request parameters
      const userEmail = req.params.emailId as string;

      // Validate email field and throw error if invalid
      const { error } = validateEmailField(userEmail);
      if (error) {
        throw new RequestValidationError(error);
      }

      // Fetch referral responses by employee based on email from the service
      const referralResponsesByEmpEmail = await userServiceObj.getReferralResponsesByEmpEmail(userEmail);

      // Return the response
      return res.status(HttpStatusCode.OK_200).json(referralResponsesByEmpEmail);
    } catch (error) {
      // Pass the error to the next middleware function
      next(error);
    }
  };
}

// Export the UserController class
export default UserController;
