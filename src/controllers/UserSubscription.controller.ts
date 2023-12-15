// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import SubscriptionDTO from "../dtos/Subscription.dto";

// Load the local schema
import { SubscriptionDTOValidation } from "../schemas/Subscription.schema";

// Load the shared service
import UserSubscriptionService from "../services/UserSubscription.service";
import UserService from "../services/User.service";

//Load local util statuscode
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

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
  getSubscriptionDetailsById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const email = req.params.id;
      const result = await UserSubscriptionService.getsubscriptionDetails(
        email
      );
      res.status(HttpStatusCode.OK_200).json(result);
    } catch (error) {
      // Handle errors

      // Pass the error to the next error handler
      next(error);
    }
  };

  /**
   * getSubscriptionStatusId
   *
   * Get the subscription status based on the provided quesry parameters
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  getSubscriptionStatusId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const email = req.params.id;
      const SK = await UserService.getSK(email);
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
   * createSubscription
   *
   * Create a new subscription based on the provided input data. Validates the input data
   * and, if successful, proceeds with the subscription creation logic.
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns
   */
  creatSubscription = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const subscriptionDto: SubscriptionDTO = req.body;
      const email = req.params.id;

      const { error, value } = SubscriptionDTOValidation.validate(
        subscriptionDto,
        {
          abortEarly: false, // Do not abort on the first validation error
        }
      );

      if (error) {
        throw new RequestValidationError(error);
      }

      const addSubscription =
        await UserSubscriptionService.createNewSubscription(
          subscriptionDto,
          email
        );
      res.status(HttpStatusCode.CREATED_201).json(addSubscription);
    } catch (error) {
      // Handle errors

      // Pass the error to the next error handler
      next(error);
    }
  };
}

export default UserSubscriptionController;
