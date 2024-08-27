// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load dynamoose helpers
import { lastKeyToBase64EncodeStr } from "../../helpers/dynamoose.helper";

// Load dtos
import { ReferralListingFilterOptions, ReferralListingFilterRequestDTO } from "../dtos/UserReferral.dto";
import { RecordListingResponseDTO } from "../../dtos/Common.dto";

// Load enums
import { SortOrderTypeEnum } from "../../enums/Common.enum";

// Load helpers
import { RequestHelper } from "../../helpers/request.helper";

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
      const userReferrals = await userReferralServiceObj.getReferrals(
        userReferralFilterOptions
      );

      // Response
      const referralsResponse: RecordListingResponseDTO = {
        data: userReferrals,
        pagination: {
          count: userReferrals.count,
          queriedCount: userReferrals.queriedCount,
          pageSize: referralRecordListingFilterRequest.pageSize,
          lastKey: lastKeyToBase64EncodeStr(userReferrals.lastKey),
          sortOrder:
            referralRecordListingFilterRequest.sortOrder ??
            SortOrderTypeEnum.DESCENDING,
        },
      };

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
      global.logger.info("Get user referral responses by employee email by [admin controller]");

      // Extract email from request parameters
      const userEmail = req.params.emailId as string;

      // Validate email field and throw error if invalid
      const { error } = validateEmailField(userEmail);
      if (error) {
        throw new RequestValidationError(error);
      }

      // Fetch referral responses by employee based on email from the service
      const referralResponsesByEmpEmail = await userReferralServiceObj.getReferralResponsesByEmpEmail(userEmail);

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
