// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import { UserEducationDTOWithId } from "../dtos/UserEducation.dto";
// Load the local schema
import { userEducationDTOArrayValidation } from "../schemas/UserEducation.schema";
import { EmailDTOValidation } from "../schemas/User.schema";

// Load the shared service
import UserEducationService from "../services/UserEducation.service";
import UserProfilePercentageService from "../services/UserProfilePercentage.service";

// Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";
import InvokeLambdaService from "../services/InvokeLambda.service";

// Load local helper
import { UserProfilePercentageOperationHelper } from "../helpers/ProfilePercentageOperations.helper";


/**
 * UserEducationController
 *
 * Class to perform related/relevant actions/activities related to the "UserEducation" table
 */
class UserEducationController {
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
      logger.info("Get user Education by email [controller]");

      // Extract email from request parameters
      const email = req.params;
      const { error ,value } = EmailDTOValidation.validate(email, {
        abortEarly: false,
      });

      if (error) {
        throw new RequestValidationError(error);
      }
      const result = await UserEducationService.get(value);

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
   * Creates/updates the user's Education URLs
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action for debugging purposes
      logger.info("Create/update user Education by email [controller]");

      // Extract email from request parameters
      const email = req.params;
      const { error: emailError, value: emailId } = EmailDTOValidation.validate(email);
      const userEducationDTO: UserEducationDTOWithId[] = req.body;
      logger.debug("userEducationDTO: ", userEducationDTO);
      let { error, value } = userEducationDTOArrayValidation.validate(
        userEducationDTO,
        {
          abortEarly: false,
        }
      );

      // Validate the user input and throw a validation error if necessary
      if (emailError) {
        throw new RequestValidationError(emailError);
      }else if(error){
        throw new RequestValidationError(error)
      }
      let userProfilePercentageDTO = await UserProfilePercentageService.get(
        emailId
      );
      userProfilePercentageDTO = userProfilePercentageDTO.toJSON()[0];

      for (let i = 0; i < userEducationDTO.length; i++) {
        // checking the fields in profile percentage for UserExperience and updating the current percentage
        userProfilePercentageDTO =
          UserProfilePercentageOperationHelper.updateCurPerc(
            userProfilePercentageDTO,
            value[i]
          );
        // If it has an SK, then it is an update, and if it does not have an SK, it is a create
        if (userEducationDTO[i].SK) {
          UserEducationService.update(emailId, userEducationDTO[i].SK, value[i]);
        } else {
          UserEducationService.createEducation(emailId, value[i]);
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

export default UserEducationController;
