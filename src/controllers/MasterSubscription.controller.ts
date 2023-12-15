// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import {
  MasterSubscriptionDTO,
  SubscriptionPlanResponseDTO,
} from "../dtos/MasterSubscription.dto";

// Load the local schema

// Load the shared service
import MasterSubscriptionService from "../services/MasterSubscription.service";

//Load local util statuscode
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

/**
 *  MasterSubscriptionController
 *
 * Class to perform related/relevent action/activities related to the "MasterSubscription" table
 */
class MasterSubscriptionController {
  /**
   *
   * createMasterSubscription
   *
   * Create a new Master subscription based on the provided input data. Validates the input data
   * and, if successful, proceeds with the Master subscription creation logic.
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns
   */
  createMasterSubscription = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("Create new mater subscription plan [controller]");
      const masterSubscriptionDto: MasterSubscriptionDTO = req.body;

      /* const { error, value } = SubscriptionDTOValidation.validate(
        subscriptionDto,
        {
          abortEarly: false, // Do not abort on the first validation error
        }
      );

      if (error) {
        throw new RequestValidationError(error);
      } */

      const addMasterSubscription =
        await MasterSubscriptionService.createNewMasterSubscription(
          masterSubscriptionDto
        );
      res.status(HttpStatusCode.CREATED_201).json(addMasterSubscription);
    } catch (error) {
      // Handle errors

      // Pass the error to the next error handler
      next(error);
    }
  };

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  getMasterSubscriptionPlans = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("Get all mater subscription plans [controller]");
      const subscriptionPlans =
        await MasterSubscriptionService.getMasterSubscriptionPlans();
      const allSubscriptionPlans: SubscriptionPlanResponseDTO[] =
        subscriptionPlans.map((plan) => ({
          SK: plan.SK,
          name: plan.name,
          amount: plan.amount,
          duration: plan.duration,
          referralCount: plan.referralCount,
          details: plan.details ?? "",
          isActive: plan.isActive,
        }));
      res.status(HttpStatusCode.OK_200).json(allSubscriptionPlans);
    } catch (error) {
      // Handle errors

      // Pass the error to the next error handler
      next(error);
    }
  };
}

export default MasterSubscriptionController;
