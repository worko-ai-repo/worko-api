// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load dynamoose library and types
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Load dtos
import { SubscriptionListingFilterOptions, SubscriptionListingFilterRequestDTO } from "../dtos/Subscription.dto";
import { RecordListingResponseDTO } from "../../dtos/Common.dto";

// Load enums
import { UserSubscriptionStatus } from "../../enums/UserSubscription.enum";

// Load helpers
import { RequestHelper } from "../../helpers/request.helper";
import { paginationResponseHelperObj } from "../../helpers/pagination-response.helper";

// Load models
import { DbUserSubsDto } from "../../db/models/UserSubscription.model";

// Load services
import { userSubscriptionServiceObj } from "../services/UserSubscription.service";

// Load schemas
import { subscriptionFilterDtoValidation } from "../schemas/Subscription.schema";

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
   * REFERENCE TUTORIAL[Typescript Generics]: https://youtu.be/EcCTIExsqmI?si=3g9M7sVRUeoL3dj7
   *
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   * @throws {RequestValidationError} - If the filter options are invalid.
   */
  getAllUsersSubscriptions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Log the action for debugging purposes
      global.logger.info("Get all users subscriptions [admin controller]");

      // Parse filter options from the request query parameters
      const subscriptionRecordListingFilterRequest: SubscriptionListingFilterOptions =
        RequestHelper.parseFilterOptions<
          SubscriptionListingFilterRequestDTO,
          SubscriptionListingFilterOptions
        >(req.query as unknown as SubscriptionListingFilterRequestDTO);

      // Validate the filter options and throw an error if any of them is invalid
      let { error, value: subscriptionFilterOptions } =
        subscriptionFilterDtoValidation.validate(
          subscriptionRecordListingFilterRequest,
          {
            abortEarly: false,
          }
        );
      if (error) {
        throw new RequestValidationError(error);
      }

      // Get all users subscriptions based on the provided filter options and if it is not provided, get all subscriptions
      const userSubscriptions =
        await userSubscriptionServiceObj.getAllUsersSubscriptions(
          subscriptionFilterOptions
        );

      // Retrieve the details of the subscriptions from the response
      const { count, lastKey, timesQueried,queriedCount, ...userSubscriptionDetails } =
        userSubscriptions;

      // Generate the response structure with the paginated result
      const subscriptionResponse: RecordListingResponseDTO<any> =
        paginationResponseHelperObj.customizedPaginationRecordListingResponse<SubscriptionListingFilterOptions>(
          Object.values(userSubscriptionDetails),
          subscriptionRecordListingFilterRequest,
          count,
          timesQueried,
          lastKey,
          queriedCount
        );

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
      global.logger.info("Get user subscriptions by id [admin controller]");

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
   * Handles the request to get user subscriptions by email.
   *
   * This controller method is responsible for retrieving user subscription details
   * from the database based on the provided email ID in the request parameters and
   * an optional subscription status in the query parameters. If a valid status is provided,
   * the subscriptions are filtered by that status. The subscriptions are then returned in the response.
   *
   * @param {Request} req - The Express request object containing the email ID in the path parameters and an optional status in the query parameters.
   * @param {Response} res - The Express response object used to send the response back to the client.
   * @param {NextFunction} next - The Express next function to pass control to the next middleware or error handler.
   * @throws {BaseError} - Throws a `400 Bad Request` error if the provided status is invalid.
   */
  getUserSubscriptionsByEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Log the action for debugging purposes
      global.logger.info("Get user subscriptions by email [admin controller]");

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

      // Get user subscriptions from service
      const userSubscriptions =
        await userSubscriptionServiceObj.getUserSubscriptionsByEmail(
          userEmail,
          subscriptionStatus
        );
        
      // Send the response
      return res.status(HttpStatusCode.OK_200).json( userSubscriptions );
    } catch (error) {
      // Handle errors by passing the error message to the next middleware
      next(error);
    }
  };
}

// Export the UserSubscriptionController class
export default UserSubscriptionController;
