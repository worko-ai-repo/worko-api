// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load dynamoose library and types
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Load dtos
import { ReferralListingFilterOptions, ReferralListingFilterRequestDTO } from "../dtos/UserReferral.dto";
import { PaginatedResultsWithMatchingConditionsResponse, RecordListingResponseDTO } from "../../dtos/Common.dto";

// Load enums
import { SortOrderTypeEnum } from "../../enums/Common.enum";

// Load helpers
import { RequestHelper } from "../../helpers/request.helper";
import { lastKeyToBase64EncodeStr } from "../../helpers/dynamoose.helper";
import { paginationResponseHelperObj } from "../../helpers/pagination-response.helper";

// Load models
import { DbUserReferralDto } from "../../db/models/UserReferral.model";

// Load services
import { userReferralServiceObj } from "../services/UserReferral.service";

// Load schemas
import { userReferralFilterDtoValidation } from "../schemas/UserReferral.schema";
import { validateEmailField } from "../../schemas/User.schema";

// Load utils
import HttpStatusCode from "../../utils/http-codes.util";
import { BaseError, RequestValidationError } from "../../utils/errors.util";

/**
 * UserReferralController
 *
 * Controller class for handling user referral related operations.
 */
class UserReferralController {
  /**
   * getReferrals
   *
   * Get all referrals.
   *
   * This function retrieves all referral details based on the provided filter options in the request query parameters.
   * If a status is provided in the filter options and it is not valid, an error is thrown.
   * It logs the action for debugging purposes, parses the filter options, validates the status,
   * retrieves the referral details from the user referral service, and sends the response as a JSON object.
   *
   * REFERENCE TUTORIAL[Typescript Generics]: https://youtu.be/EcCTIExsqmI?si=3g9M7sVRUeoL3dj7
   *
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   * @throws {RequestValidationError} - If the filter options are invalid.
   */
  getReferrals = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action of getting referral details in the controller
      global.logger.info("Get all referrals [admin user referral controller]");

      // Parse filter options from the request query parameters
      const referralRecordListingFilterRequest: ReferralListingFilterOptions =
        RequestHelper.parseFilterOptions<
          ReferralListingFilterRequestDTO,
          ReferralListingFilterOptions
        >(req.query as unknown as ReferralListingFilterRequestDTO);

      // Validate the filter options and throw an error if any of them is invalid
      let { error, value: userReferralFilterOptions } =
        userReferralFilterDtoValidation.validate(
          referralRecordListingFilterRequest,
          {
            abortEarly: false,
          }
        );
      if (error) {
        throw new RequestValidationError(error);
      }

      // Fetch the referral details from the service
      const userReferrals: PaginatedResultsWithMatchingConditionsResponse<DbUserReferralDto> = await userReferralServiceObj.getReferrals(
        userReferralFilterOptions
      );

      // Extract the count, timesQueried,lastKey and other details from the response
      const { lastKey, count, timesQueried, queriedCount, ...referralDetails } = userReferrals;

      // Generate the pagination response
      const referralsResponse: RecordListingResponseDTO<DbUserReferralDto[]> =
        paginationResponseHelperObj.customizedPaginationRecordListingResponse<DbUserReferralDto[],ReferralListingFilterOptions>(
          Object.values(referralDetails),
          referralRecordListingFilterRequest,
          count,
          timesQueried,
          lastKey,
          queriedCount
        );      

      // Send the fetched result as JSON response
      return res.status(HttpStatusCode.OK_200).json(referralsResponse);
    } catch (error) {
      // Pass the error to the error handling middleware
      next(error);
    }
  };

  /**
   * getReferralDetailById
   *
   * This controller handles the retrieval of referral details by id.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object used to send the retrieved referral details.
   * @param {NextFunction} next - The next middleware function for error handling.
   * @throws {BaseError} Throws an error if the referral with the provided id is not found.
   */
  getReferralDetailById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Log the action of getting referral details in the controller
      global.logger.info(
        "Get referral detail by id [admin user referral controller]"
      );

      // Get the id parameter from the request
      const referralId = req.params.id as string;

      // Get the referral details for the given id, if not found throw 404 error
      const userReferralDetails =
        await userReferralServiceObj.getReferralDetailById(referralId);
      if (!userReferralDetails.count) {
        throw new BaseError(
          `The referral with the provided "${referralId}" id is not found.`,
          HttpStatusCode.NOT_FOUND_404
        );
      }

      // Send the fetched result as JSON response
      return res.status(HttpStatusCode.OK_200).json(userReferralDetails[0]);
    } catch (error) {
      // Pass the error to the error handling middleware
      next(error);
    }
  };

  /**
   * getReferralResponsesByEmpEmail
   * 
   * Handles the request to get referral responses by employee email.
   *
   * This controller method is responsible for retrieving referral responses
   * associated with a specific employee based on the provided email ID in the
   * request parameters. The referral responses are then returned in the response.
   *
   * @param {Request} req - The Express request object containing the employee's email ID in the path parameters.
   * @param {Response} res - The Express response object used to send the response back to the client.
   * @param {NextFunction} next - The Express next function to pass control to the next middleware or error handler.
   */
  getReferralResponsesByEmpEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Log the action of getting referral response
      global.logger.info(
        "Get user referral responses by employee email by [admin controller]"
      );

      // Extract email from request parameters
      const userEmail = req.params.emailId as string;

      // Fetch referral responses by employee based on email from the service
      const referralResponsesByEmpEmail =
        await userReferralServiceObj.getReferralResponsesByEmpEmail(userEmail);

      // Return the response
      return res
        .status(HttpStatusCode.OK_200)
        .json(referralResponsesByEmpEmail);
    } catch (error) {
      // Pass the error to the next middleware function
      next(error);
    }
  };
}

// Export the UserReferralController class
export default UserReferralController;
