// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the  service
import UserSubscriptionService from "../services/UserSubscription.service";

// Import schema
import { validateEmailField } from "../schemas/User.schema";

// Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

/**
 * This module defines a route for creating a free subscription for a user.
 * Note: This route is intended to be used only for one-time purposes, such as to add subscription for a missing user account.
 * It should not be used for any internal purposes or major subscription management tasks.
 * 
*/

/**
 * 
 * AdminController
 *
 * Class to perform actions related to admin
 */
class AdminController {
  /**
   * Adds a free subscription for a user.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {NextFunction} next - The next middleware function.
   * @throws {RequestValidationError} - If the email is not valid.
   * @throws {Error} - If an error occurs while adding the free subscription.
   */
  addUserFreeSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action for debugging purposes
      global.logger.info("Add user free subscription [controller]");

      // Extract the email from the request parameters
      const email = req.params.id;

      // Validate the email
      const { error } = validateEmailField(email);
      // Throw an error if validation fails
      if (error) {
        throw new RequestValidationError(error);
      }

      // Add user free subscription
      let userSubscription = await UserSubscriptionService.addUserFreeSubscription(email);

      // Send the response
      res.status(HttpStatusCode.OK_200).json(userSubscription);
    } catch (error: any) {
      // Handle errors by passing the error message to the next middleware
      next(error.message);
    }
  };

}
export default AdminController;
