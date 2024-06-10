// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import {SubscriptionCreateRequestApiDTO, SubscriptionCreateRequestDTO} from "../dtos/Subscription.dto";

// Load the local enums
import { UserOrderStatusEnum, UserOrderTypeEnum } from "../enums/UserOrder.enum";
import { UserSubscriptionStatus } from "../enums/UserSubscription.enum";

// Load the local schema
import { SubscriptionCreateApiDTOValidation } from "../schemas/Subscription.schema";
import { validateEmailField } from "../schemas/User.schema";

// Load the shared service
import UserSubscriptionService from "../services/UserSubscription.service";
import UserService from "../services/User.service";
import UserOrderService from "../services/UserOrder.service";
import MasterSubscriptionService from "../services/MasterSubscription.service";

//Load local util statuscode
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError, RequestValidationError } from "../utils/errors.util";

/**
 * UserSubscriptionController
 *
 * Class to perform related/relevent action/activities related to the "user subscription" table
 */
class UserSubscriptionController {
  /**
   * getSubscriptionDetailsById
   *
   * Get the subscription details based on the provided quesry parameters
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = req.params.id;

      const { error } = validateEmailField(email);

      if (error) {
        throw new RequestValidationError(error);
      }
      const result = await UserSubscriptionService.get(email);
      res.status(HttpStatusCode.OK_200).json(result);
    } catch (error) {
      // Handle errors

      // Pass the error to the next error handler
      next(error);
    }
  };

  /**
   * getStatus
   *
   * Get the subscription status based on the provided quesry parameters
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  getStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = req.params.id;

      const { error} = validateEmailField(email);

      if (error) {
        throw new RequestValidationError(error);
      }
      const SK = await UserService.getSK(email); // @todo you dont need to dd it, instead directly call the below by user's email address
      const subStatus = await UserService.getSubscriptionStatus(email, SK);
      /* if (!subStatus[0].isSubscribed) {
        res.status(HttpStatusCode.PAYMENT_REQUIRED_402).json({
          status: "failure",
          message: "Payment Required",
          description:
            "User does not have an active subscription. Please subscribe to access this service.",
        });
      } */
      res.status(HttpStatusCode.OK_200).json(subStatus[0]);
    } catch (error) {
      // Handle errors

      // Pass the error to the next error handler
      next(error);
    }
  };

  /**
   *
   * create
   *
   * Creates a new subscription for a user. This function performs the following steps:
   * 1. Validates the user's email from the request parameters.
   * 3. Checks if the user already has an active subscription to prevent duplicates.
   * 5. Creates a new subscription for the user based on the provided master subscription ID.
   *
   * The function also includes commented-out code that suggests future enhancements:
   * - Stricter validation of the subscription DTO.
   * - Fetching details from a master subscription list.
   * - Verifying the user's order status to ensure payment is completed before creating a subscription.
   *
   * @param {Request} req - Express request object:
   * @param {Response} res - Express response object used to send back the API response.
   * @param {NextFunction} next - Express next function for error handling.
   * @throws {RequestValidationError} If the email fails validation.
   * @throws {BaseError} If the user already has an active subscription.
   * @throws {BaseError} (Commented out) If the user's order is not in a completed state.
   * @throws {Error} Any other errors that occur during the process.
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      global.logger.info("create subscription for user [controller]");

      // Extract request data
      const requestBody: SubscriptionCreateRequestApiDTO = req.body;
      const email = req.params.id;

      // Validate the email
      const { error: emailError } = validateEmailField(email);
      if (emailError) {
        throw new RequestValidationError(emailError);
      }

      // Validate the subscription DTO against a schema
      const { error, value: validatedRequestBody } =
        SubscriptionCreateApiDTOValidation.validate(requestBody, {
          abortEarly: false, // Do not abort on the first validation error
        });

      if (error) {
        throw new RequestValidationError(error);
      }

      // Check if the user already has an active subscription
      const isActive =
        await UserSubscriptionService.getActiveSubscriptionForUser(email);
      if (isActive.count) {
        // Prevent duplicate active subscriptions
        // TODO: Review and update the exception properly
        throw new BaseError(
          "You already have an active subscription.",
          HttpStatusCode.BAD_REQUEST_400
        );
      }

      // Set the order type (in this case the order type is subscription)
      let orderType = UserOrderTypeEnum.SUBSCRIPTION;

      // Verify the user's order status
      // This would ensure the user has paid for the subscription before it's created
      let orderDetails = await UserOrderService.getOrderByOrderId(
        email,
        orderType,
        requestBody.orderId
      );
      if(!orderDetails){
        throw new BaseError(
          "Order Not Found",
          HttpStatusCode.NOT_FOUND_404
        );
      }
      
      // If the order is not in a completed state, throw an error
      if (orderDetails.status != UserOrderStatusEnum.COMPLETED) {
        throw new BaseError(
          "User does not have an active subscription. Please subscribe to access this service.",
          HttpStatusCode.PAYMENT_REQUIRED_402
        );
      }

      // create partial request data for subscription creation
      const subscriptionCreateRequest : SubscriptionCreateRequestDTO = {
        status: UserSubscriptionStatus.ACTIVE,
        orderId: validatedRequestBody.orderId,
        requestedReferrals: 0,
        acceptedReferrals: 0,
        completedReferrals: 0,
      };

      // Create the subscription using the master subscription ID and user's email
      const addSubscription = await UserSubscriptionService.create(
        validatedRequestBody.masterSubscriptionId,
        email,
        subscriptionCreateRequest
      );

      // Return the newly created subscription
      res.status(HttpStatusCode.CREATED_201).json(addSubscription);
    } catch (error) {
      // Pass any errors to the global error handler
      next(error);
    }
  };
}

export default UserSubscriptionController;
