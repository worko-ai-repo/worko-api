// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import SubscriptionDTO from "../dtos/Subscription.dto";

// Load the local schema
import { SubscriptionSchema } from "../schemas/Subscription.schema";

// Load the shared service
import SubscriptionService from "../services/Subscription.service";
import UserService from "../services/User.service";

//Load local util statuscode
import HttpStatusCode from "../utils/http-codes.util";

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
    const email = req.params.id;
    const result = await UserService.getsubscriptionDetails(email);
    res.status(HttpStatusCode.OK_200).json(result);
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
      const email = req.params.email;

      const { error, value } = SubscriptionSchema.validate(subscriptionDto, {
        abortEarly: false, // Do not abort on the first validation error
      });

      if (error) {
        // If there are validation errors, send a 400 Bad Request response with the error details
        return res.status(HttpStatusCode.BAD_REQUEST_400).json({
          error: "Validation Error",
          details: error.details.map((detail) => ({
            message: detail.message,
            path: detail.path,
          })),
        });
      }

      const addSubscription = await SubscriptionService.createNewSubscription(
        subscriptionDto,
        email
      );
      res.status(HttpStatusCode.CREATED_201).json(addSubscription);
    } catch (error) {
      throw error;
    }
  };
}

export default UserSubscriptionController;
