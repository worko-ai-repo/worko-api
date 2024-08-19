// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load dynamoose helpers
import { lastKeyToBase64EncodeStr } from "../../helpers/dynamoose.helper";

// Load local DTOs
import { UserSupportListingFilterOptions, UserSupportListingFilterRequestDTO } from "../dtos/UserSupport.dto";
import { RecordListingResponseDTO } from "../../dtos/Common.dto";

// Load helpers
import { RequestHelper } from "../../helpers/request.helper";

// Load services
import { userSupportServiceObj } from "../services/UserSupport.service";

// Load schema
import { userSupportFilterDtoValidation } from "../schemas/UserSupport.schema";

// Load utils
import { BaseError, RequestValidationError } from "../../utils/errors.util";
import HttpStatusCode from "../../utils/http-codes.util";

/**
 * UserSupportController
 *
 * Class to perform actions related to user Support requests.
 */
class UserSupportController {
  /**
   * getSupportRequests
   * 
   * Get all user support requests.
   *
   * This function retrieves all user support requests based on the provided filter options in the request query parameters.
   * It validates the filter options using a validation schema, and if any validation errors are found, an error is thrown.
   * It logs the action for debugging purposes, parses and validates the filter options,
   * retrieves the support request details from the user support service, and sends the response as a JSON object.
   * 
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   * @throws {RequestValidationError} If the filter options are invalid according to the validation schema.
   */
  getSupportRequests = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Log the action for debugging purposes
      global.logger.info("get all User support list [admin user support controller]");

      // Parse filter options from the request query parameters
      const userSupportRequestsRecordListingFilterRequest: UserSupportListingFilterOptions =
        RequestHelper.parseFilterOptions<
          UserSupportListingFilterRequestDTO,
          UserSupportListingFilterOptions
        >(req.query as unknown as UserSupportListingFilterRequestDTO);

      // Validate the filter options and throw an error if any of them is invalid
      let { error, value: supportFilterOptions } =
        userSupportFilterDtoValidation.validate(
          userSupportRequestsRecordListingFilterRequest,
          {
            abortEarly: false,
          }
        );
      if (error) {
        throw new RequestValidationError(error);
      }

      // Get user support requests from service
      const supportDetails = await userSupportServiceObj.getSupportRequests(
        supportFilterOptions
      );

      // Response
      const userSupportRequestsResponse: RecordListingResponseDTO = {
        data: supportDetails,
        pagination: {
          count: supportDetails.count,
          queriedCount: supportDetails.queriedCount,
          pageSize: userSupportRequestsRecordListingFilterRequest.pageSize,
          lastKey: lastKeyToBase64EncodeStr(supportDetails.lastKey),
        },
      };

      // Send the response
      return res
        .status(HttpStatusCode.OK_200)
        .json(userSupportRequestsResponse);
    } catch (error) {
      // pass the error to the error handling middleware
      next(error);
    }
  };

  /**
   * getSupportRequestById
   *
   * Controller function to get user support details based on supportId
   *
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   * @throws {BaseError} If the support request with the provided supportId is not found
   */
  getSupportRequestById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Log the action for debugging purposes
      global.logger.info("get User support details [admin user support controller]");

      // Get the supportId from the request
      const supportId = req.params.supportId as string;

      // Get user support details from service
      const supportDetails = await userSupportServiceObj.getSupportRequestById(
        supportId
      );
      if (!supportDetails.count) {
        throw new BaseError(
          `The support request with the provided "${supportId}" id is not found.`,
          HttpStatusCode.NOT_FOUND_404
        );
      }

      // Send the response
      return res.status(HttpStatusCode.OK_200).json(supportDetails[0]);
    } catch (error) {
      // pass the error to the error handling middleware
      next(error);
    }
  };
}

// Export the UserSupportController
export default UserSupportController;
