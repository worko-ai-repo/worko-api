// Import the necessary npm packages
import { Request, Response, NextFunction } from "express";

// Import the services
import { userExperienceServiceObj } from "../services/UserExperience.service";

// Import the schemas
import { validateEmailField } from "../../schemas/User.schema";

// Import the utils
import HttpStatusCode from "../../utils/http-codes.util";
import { RequestValidationError } from "../../utils/errors.util";

/**
 * UserExperienceController
 *
 * Controller class for user experience details by admin
 */
class UserExperienceController {
  /**
   * getUserExperiencesByEmail
   *
   * Retrieve user experience based on the email
   *
   * @param {Request} req - The request object containing parameters and query information.
   * @param {Response} res - The response object used to send the response.
   * @param {NextFunction} next - The next middleware function in the stack.
   * @throws {RequestValidationError} Throws an error if the provided email is invalid.  
   */
  getUserExperiencesByEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Log the action of getting user experience
      global.logger.info("Get user experience by email [admin user experience controller]");

      // Extract email from request parameters
      const userEmail = req.params.emailId as string;

      // Validate email field and throw error if invalid
      const { error } = validateEmailField(userEmail);
      if (error) {
        throw new RequestValidationError(error);
      }

      // Fetch user experience details
      const userExperiences =
        await userExperienceServiceObj.getUserExperiencesByEmail(userEmail);

      // Send the response
      return res.status(HttpStatusCode.OK_200).json(userExperiences);
    } catch (error) {
      // Pass the error to the next middleware
      next(error);
    }
  };
}

// Export the UserExperienceController
export default UserExperienceController;
