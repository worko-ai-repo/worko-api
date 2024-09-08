// Import the necessary npm packages
import { Request, Response, NextFunction } from "express";

// Import the services
import { userExperienceServiceObj } from "../services/UserExperience.service";

// Import the utils
import HttpStatusCode from "../../utils/http-codes.util";

/**
 * UserExperienceController
 *
 * Controller class for user experience details by admin
 */
class UserExperienceController {
  /**
   * getUserExperiencesByEmail
   * 
   * Handles the request to get user experiences by email.
   *
   * This controller method is responsible for retrieving user experiences
   * details from the database based on the provided email ID in the request
   * parameters. The user experiences are then returned in the response.
   *
   * @param {Request} req - The Express request object containing the email ID in the path parameters.
   * @param {Response} res - The Express response object used to send the response back to the client.
   * @param {NextFunction} next - The Express next function to pass control to the next middleware or error handler.
   */
  getUserExperiencesByEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Log the action of getting user experience
      global.logger.info(
        "Get user experience by email [admin user experiences controller]"
      );

      // Extract email from request parameters
      const userEmail = req.params.emailId as string;

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
