// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos


// Load the local schema
import { EmailDTOValidation } from "../schemas/User.schema";

// Load the shared service
import UserEmailService from "../services/UserEmail.service";

// Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

// Load local helper
import { GroupingHelper } from "../helpers/grouping.helper";

/**
 * UserEmailController
 *
 * Class to perform related/relevent action/activities related to the "UserEmail" table
 */
class UserEmailController {
  /**
   * getByEmail
   *
   * Get the user based on the provided quesry parameters
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  getByEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Get user emails by id [controller]");

      // Extract email from request parameters
      const email = req.params;
      const { error ,value } = EmailDTOValidation.validate(email, {
        abortEarly: false,
      });

      if (error) {
        throw new RequestValidationError(error);
      }
      const result = await UserEmailService.get(value);

      // Send successful response with user data
      res.status(HttpStatusCode.OK_200).json(result);
    } catch (error: any) {
      // Handle errors

      // Check if the error is due to user not found
      if (error.message === "User not found") {
        // If user not found, send a 404 response with an informative error message
        res
          .status(HttpStatusCode.NOT_FOUND_404)
          .json({ error: "User not found. Please check the email." });
      } else {
        // If it's another type of error, pass it to the next error handler
        next(error);
      }
    }
  };
}

export default UserEmailController;
