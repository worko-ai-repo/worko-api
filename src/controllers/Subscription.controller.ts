import { Request, Response, NextFunction } from "express";
import SubscriptionDTO from "../dtos/Subscription.dto";
import SubscriptionService from "../services/Subscription.service";
import { SubscriptionSchema } from "../schemas/Subscription.schema";

class SubscriptionController {
  addSubscription = async (req: Request, res: Response, next: NextFunction) => {
    const subscriptionDto: SubscriptionDTO = req.body;

    const { error, value } = SubscriptionSchema.validate(subscriptionDto, {
      abortEarly: false, // Do not abort on the first validation error
    });

    if (error) {
      // If there are validation errors, send a 400 Bad Request response with the error details
      return res.status(400).json({
        error: "Validation Error",
        details: error.details.map((detail) => ({
          message: detail.message,
          path: detail.path,
        })),
      });
    }

    const addSubscription = await SubscriptionService.createNewSubscription(
      value
    );
    res.status(201).json(addSubscription);
  };

  getSubcriptionList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const subscriptionList = await SubscriptionService.getSubscriptionList();
    res.status(200).json(subscriptionList);
  };
}

export default SubscriptionController;
