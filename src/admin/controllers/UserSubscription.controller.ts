// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load dynamoose helpers
import { lastKeyToBase64EncodeStr } from "../../helpers/dynamoose.helper";

// Load dtos
import { SubscriptionListingFilterOptions, SubscriptionListingFilterRequestDTO } from "../dtos/Subscription.dto";
import { RecordListingResponseDTO } from "../../dtos/Common.dto";

// Load enums
import { UserSubscriptionStatus } from "../../enums/UserSubscription.enum";

// Load helpers
import { RequestHelper } from "../../helpers/request.helper";

// Load services
import { userSubscriptionServiceObj } from "../services/UserSubscription.service";

// Load schemas
import { validateEmailField } from "../../schemas/User.schema";

// Load utils
import HttpStatusCode from "../../utils/http-codes.util";
import { BaseError, RequestValidationError } from "../../utils/errors.util";

/**
 * UserSubscriptionController
 *
 * Class to perform actions related to user subscriptions.
 */
class UserSubscriptionController {
  /**
   * getAllUsersSubscriptions
   * 
   * Get all users subscriptions.
   *
   * This function retrieves all user subscriptions based on the provided filter options in the request query parameters.
   * If a status is provided in the filter options and it is not valid, an error is thrown.
   * It logs the action for debugging purposes, parses the filter options, validates the status,
   * retrieves the subscriptions from the user subscription service, and sends the response as a JSON object.
   *
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   * @throws {BaseError} If an invalid status is provided in the filter options.
   */
  getAllUsersSubscriptions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Log the action for debugging purposes
      global.logger.info("Get all users subscriptions [admin user experience controller]");

      // Parse filter options from the request query parameters
      const subscriptionRecordListingFilterRequest: SubscriptionListingFilterOptions =
        RequestHelper.parseFilterOptions<
          SubscriptionListingFilterRequestDTO,
          SubscriptionListingFilterOptions
        >(req.query as unknown as SubscriptionListingFilterRequestDTO);

      // if status is provided and it is not a valid status, throw an error. @todo:if more than one filter options are provided,In schemas folder present in admin folder use JOI to validate.
      if (
        subscriptionRecordListingFilterRequest.status &&
        !Object.values(UserSubscriptionStatus).includes(
          subscriptionRecordListingFilterRequest.status
        )
      ) {
        throw new BaseError(
          `The Provided status "${
            subscriptionRecordListingFilterRequest.status
          }" is an invalid. The status should be one of "${Object.values(
            UserSubscriptionStatus
          ).join(", ")}".`
        );
      }

      // Get all users subscriptions based on the provided filter options and if it is not provided, get all subscriptions
      const userSubscriptions =
        await userSubscriptionServiceObj.getAllUsersSubscriptions(
          subscriptionRecordListingFilterRequest
        );

      // Response
      const subscriptionResponse: RecordListingResponseDTO = {
        data: userSubscriptions,
        pagination: {
          count: userSubscriptions.count,
          queriedCount: userSubscriptions.queriedCount,
          pageSize: subscriptionRecordListingFilterRequest.pageSize,
          lastKey: lastKeyToBase64EncodeStr(userSubscriptions.lastKey),
        },
      };

      // Send the retrieved subscriptions
      return res.status(HttpStatusCode.OK_200).json(subscriptionResponse);
    } catch (error) {
      // pass the error to the error handling middleware
      next(error);
    }
  };

  /**
   * getSubscriptionDetailById
   *
   * This controller handles the retrieval of user subscription based on the provided id.
   *
   * @param {Request} req - The request object containing the id parameter.
   * @param {Response} res - The response object used to send the retrieved subscriptions.
   * @param {NextFunction} next - The next middleware function for error handling.
   */
  getSubscriptionDetailById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info("Get user subscriptions by id [admin user experience controller]");

      // Extract the subscription id from the request parameters
      const subscriptionId = req.params.id as string;

      // Get user subscription detail by subscription id from service and if no subscription found, throw an error with 404 status
      const subscriptionDetails =
        await userSubscriptionServiceObj.getSubscriptionDetailById(
          subscriptionId
        );
      if (!subscriptionDetails.count) {
        throw new BaseError(
          `The subscription with the provided "${subscriptionId}" id is not found.`,
          HttpStatusCode.NOT_FOUND_404
        );
      }

      // Send the retrieved subscriptions by id
      return res.status(HttpStatusCode.OK_200).json(subscriptionDetails[0]);
    } catch (error) {
      // pass the error to the error handling middleware
      next(error);
    }
  };

  /**
   * getUserSubscriptionsByEmail
   *
   * This controller handles the retrieval of user subscriptions based on the provided email and status (optional).
   *
   * @param {Request} req - The request object containing the email parameter.
   * @param {Response} res - The response object used to send the retrieved subscriptions.
   * @param {NextFunction} next - The next middleware function for error handling.
   * @throws {BaseError} If status is provided and it is not a valid status.
   * @throws {RequestValidationError} If the provided email is invalid.
   */
  getUserSubscriptionsByEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Log the action for debugging purposes
      global.logger.info("Get user subscriptions by email [admin user experience controller]");

      // Extract the status from the query parameters and type it as a UserSubscriptionStatus
      const subscriptionStatus = req.query.status as UserSubscriptionStatus;

      // if status is provided and it is not a valid status, throw an error
      if (
        subscriptionStatus &&
        !Object.values(UserSubscriptionStatus).includes(subscriptionStatus)
      ) {
        throw new BaseError(
          `The Provided subscription status "${subscriptionStatus}" is an invalid status. The status should be one of "${Object.values(
            UserSubscriptionStatus
          ).join(", ")}".`
        );
      }

      // Extract email from request parameters
      const userEmail = req.params.emailId as string;

      // Validate the email and throw an error if it is invalid
      const { error } = validateEmailField(userEmail);
      if (error) {
        throw new RequestValidationError(error);
      }

      // @todo: check whether the provided email is present in the database or not and if not then throw error 404, user with the provided email is not found

      // Get user subscriptions from service
      const userSubscriptions =
        await userSubscriptionServiceObj.getUserSubscriptionsByEmail(
          userEmail,
          subscriptionStatus
        );

      // Send the response
      return res.status(HttpStatusCode.OK_200).json(userSubscriptions);
    } catch (error) {
      // Handle errors by passing the error message to the next middleware
      next(error);
    }
  };
}

// Export the UserSubscriptionController class
export default UserSubscriptionController;
