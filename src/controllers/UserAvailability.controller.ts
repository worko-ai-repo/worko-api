// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import { UserAvailabilityDTO } from "../dtos/UserAvailability.dto";

// Load the local schema
import { UserAvailabilityDTOValidation } from "../schemas/UserAvailability.schema";
import { validateEmailField } from "../schemas/User.schema";

// Load the shared service
import UserAvailabilityService from "../services/UserAvailability.service";

// Load local enums
import { DayCodes } from "../enums/DayCodes.enum";

// Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

// Load local helper

/**
 * UserAvailabilityController
 *
 * Class to perform related/relevant actions/activities related to the "UserAvailability" table
 */
class UserAvailabilityController {
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
      logger.info("Get user Availability by email [controller]");

      // Extract email from request parameters
      const email = req.params.id;

      const { error } = validateEmailField(email);

      if (error) {
        throw new RequestValidationError(error);
      }

      const result = await UserAvailabilityService.get(email);

      // Add the "day" field to each availability item
      if (result.count > 0) {
        result[0].availability.forEach(
          (availabilityItem: { day: string; dayCode: number }) => {
            availabilityItem.day = DayCodes[availabilityItem.dayCode];
          }
        );
      }

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
   * Creates/updates the user's availability
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action for debugging purposes
      logger.info("Create user Availability by email [controller]");

      // Extract email from request parameters
      const email = req.params.id;
      const { error: emailError } = validateEmailField(email);
      const userAvailabilityDTO: UserAvailabilityDTO = req.body;
      const { error, value } = UserAvailabilityDTOValidation.validate(
        userAvailabilityDTO,
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
        result = await UserAvailabilityService.update(email, value);
      } else {
        result = await UserAvailabilityService.create(email, value);
      }

      // Send a successful response with user data
      res.status(HttpStatusCode.OK_200).json(result);
    } catch (error: any) {
      // If it's another type of error, pass it to the next error handler
      next(error);
    }
  };

  /**
   * updates
   *
   * updates the user's availability URLs
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action for debugging purposes
      logger.info("update user Availability by email [controller]");

      // Extract email from request parameters
      const email = req.params.id;
      const { error: emailError } = validateEmailField(email);
      const userAvailabilityDTO: UserAvailabilityDTO = req.body;
      const { error, value } = UserAvailabilityDTOValidation.validate(
        userAvailabilityDTO,
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

      const result = await UserAvailabilityService.update(email, value);

      // Send a successful response with user data
      res.status(HttpStatusCode.OK_200).json(result);
    } catch (error: any) {
      // If it's another type of error, pass it to the next error handler
      next(error);
    }
  };
}

export default UserAvailabilityController;
