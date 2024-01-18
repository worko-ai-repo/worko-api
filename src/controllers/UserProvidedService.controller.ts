// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import { UserProvidedServiceDTOWithId } from "../dtos/UserProvidedService.dto";
// Load the local schema
import { userProvidedServiceDTOArrayValidation } from "../schemas/UserProvidedService.schema";
// Load the shared service
import UserProvidedServiceService from "../services/UserProvidedService.service";
import UserProfilePercentageService from "../services/UserProfilePercentage.service";

// Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

// Load local helper
import { UserProfilePercentageOperationHelper } from "../helpers/ProfilePercentageOperations.helper";

/**
 * UserProvidedServiceController
 *
 * Class to perform related/relevant actions/activities related to the "UserProvidedService" table
 */
class UserProvidedServiceController {
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
      logger.info("Get user ProvidedService by email [controller]");

      // Extract email from request parameters
      const email = req.params.id;

      const result = await UserProvidedServiceService.get(email);

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
   * Creates/updates the user's ProvidedService URLs
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action for debugging purposes
      logger.info("Create/update user ProvidedService by email [controller]");

      // Extract email from request parameters
      const email = req.params.id;
      const userProvidedServiceDTO: UserProvidedServiceDTOWithId[] = req.body;
      logger.debug("userProvidedServiceDTO: ", userProvidedServiceDTO);
      let { error, value } = userProvidedServiceDTOArrayValidation.validate(
        userProvidedServiceDTO,
        {
          abortEarly: false,
        }
      );

      // Validate the user input and throw a validation error if necessary
      if (error) {
        throw new RequestValidationError(error);
      }

      /* let userProfilePercentageDTO = await UserProfilePercentageService.get(
        email
      );
      userProfilePercentageDTO = userProfilePercentageDTO.toJSON()[0]; */

      for (let i = 0; i < userProvidedServiceDTO.length; i++) {
        // checking the fields in profile percentage for UserExperience and updating the current percentage
        /* userProfilePercentageDTO =
          UserProfilePercentageOperationHelper.updateCurPerc(
            userProfilePercentageDTO,
            value[i]
          ); */
        // If it has an SK, then it is an update, and if it does not have an SK, it is a create
        if (userProvidedServiceDTO[i].SK) {
          UserProvidedServiceService.update(
            email,
            userProvidedServiceDTO[i].SK,
            value[i]
          );
        } else {
          UserProvidedServiceService.create(email, value[i]);
        }
      }

      //   UserProfilePercentageService.update(email, userProfilePercentageDTO);

      // Send a successful response with user data
      res.status(HttpStatusCode.OK_200).json();
    } catch (error: any) {
      // If it's another type of error, pass it to the next error handler
      next(error);
    }
  };
}

export default UserProvidedServiceController;
