// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import { UserExperienceDTOWithId } from "../dtos/UserExperience.dto";

// Load the local schema
import { validateEmailField } from "../schemas/User.schema";

import { userExperienceDTOArrayValidation } from "../schemas/UserExperience.schema";

// Load the shared service
import UserExperienceService from "../services/UserExperience.service";
import UserProfilePercentageService from "../services/UserProfilePercentage.service";

// Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

// Load local helper
import { GroupingHelper } from "../helpers/grouping.helper";
import { UserProfilePercentageOperationHelper } from "../helpers/ProfilePercentageOperations.helper";

/**
 * UserExperienceController
 *
 * Class to perform related/relevent action/activities related to the "UserExperience" table
 */
class UserExperienceController {
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
      console.log("Get user experience by id [controller]");

      // Extract email from request parameters
      const email = req.params.id;

      const { error } = validateEmailField(email);

      if (error) {
        throw new RequestValidationError(error);
      }

      const result = await UserExperienceService.get(email);

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

  /**
   * create
   *
   * Creates/updates the user's experience URLs
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action for debugging purposes
      logger.info("Create/update user Experience by email [controller]");

      // Extract email from request parameters
      const email = req.params.id;

      const { error: emailError, value: emailId } = validateEmailField(email);

      const userExperienceDTO: UserExperienceDTOWithId[] = req.body;
      let { error, value } = userExperienceDTOArrayValidation.validate(
        userExperienceDTO,
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

      let userProfilePercentageDTO = await UserProfilePercentageService.get(
        emailId
      );
      userProfilePercentageDTO = userProfilePercentageDTO.toJSON()[0];

      for (let i = 0; i < userExperienceDTO.length; i++) {
        // checking the fields in profile percentage for UserExperience and updating the current percentage
        userProfilePercentageDTO =
          UserProfilePercentageOperationHelper.updateCurPerc(
            userProfilePercentageDTO,
            value[i]
          );
        // If it has an SK, then it is an update, and if it does not have an SK, it is a create
        if (userExperienceDTO[i].SK) {
          UserExperienceService.update(
            emailId,
            userExperienceDTO[i].SK,
            value[i]
          );
        } else {
          UserExperienceService.create(emailId, value[i]);
        }
      }

      UserProfilePercentageService.update(emailId, userProfilePercentageDTO);

      // Send a successful response with user data
      res.status(HttpStatusCode.OK_200).json();
    } catch (error: any) {
      // If it's another type of error, pass it to the next error handler
      next(error);
    }
  };
}

export default UserExperienceController;
