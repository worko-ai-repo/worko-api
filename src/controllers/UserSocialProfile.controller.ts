// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import { UserSocialProfileDTO } from "../dtos/UserSocialProfile.dto";
// Load the local schema
import { userSocialProfileDTOValidation } from "../schemas/UserSocialProfile.schema";
// Load the shared service
import UserSocialProfileService from "../services/UserSocialProfile.service";

// Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";
import { validateEmailField } from "../schemas/User.schema";

// Load local helper

/**
 * UserSocialProfileController
 *
 * Class to perform related/relevant actions/activities related to the "UserSocialProfile" table
 */
class UserSocialProfileController {
  /**
   * getByEmail
   *
   * Retrieves the user based on the provided query parameters
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action for debugging purposes
      logger.info("Get user SocialProfile by email [controller]");

      // Extract email from request parameters
      const email = req.params.id;

      const { error} = validateEmailField(email);

      if (error) {
        throw new RequestValidationError(error);
      }
      const result = await UserSocialProfileService.get(email);

      // Send a successful response with user data
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

  /**
   * create
   *
   * Creates/updates the user's social profile URLs
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action for debugging purposes
      logger.info("Create/update user SocialProfile by email [controller]");

      // Extract email from request parameters
      const email = req.params.id;

      const { error: emailError } = validateEmailField(email);

      const userSocialProfileDTO: UserSocialProfileDTO = req.body;
      const { error, value } = userSocialProfileDTOValidation.validate(
        userSocialProfileDTO,
        {
          abortEarly: false,
        }
      );

      // Validate the user input and throw a validation error if necessary
      if (emailError) {
        throw new RequestValidationError(emailError);
      } else if (error) {
        throw new RequestValidationError(error);
      }

      let result;

      // If it has an SK, then it is an update, and if it does not have an SK, it is a create
      if (req.body.SK) {
        result = await UserSocialProfileService.update(email, value);
      } else {
        result = await UserSocialProfileService.create(email, value);
      }

      // Send a successful response with user data
      res.status(HttpStatusCode.OK_200).json(result);
    } catch (error: any) {
      // If it's another type of error, pass it to the next error handler
      next(error);
    }
  };
}

export default UserSocialProfileController;
