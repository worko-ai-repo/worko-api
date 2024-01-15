// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import { UserProfilePercentageDTO } from "../dtos/UserProfilePercentage.dto";
// Load the local schema

// Load the shared service
import UserProfilePercentageService from "../services/UserProfilePercentage.service";

// Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

// Load local helper
import { UserProfilePercentageOperationHelper } from "../helpers/ProfilePercentageOperations.helper";

/**
 * UserProfilePercentageController
 *
 * Class to perform related/relevant actions/activities related to the "UserProfilePercentage" table
 */
class UserProfilePercentageController {
  /**
   * getByEmail
   *
   * Retrieves the user ProfilePercentages based on the provided query parameters
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action for debugging purposes
      logger.info("Get user ProfilePercentage by email [controller]");

      // Extract email from request parameters
      const email = req.params.id;
      const result = await UserProfilePercentageService.get(email);

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
   * getByGroup
   *
   * Retrieves the user ProfilePercentages by Group
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  getByGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action for debugging purposes
      logger.info("Get user ProfilePercentage by Group [controller]");

      // Extract email from request parameters
      const email = req.params.id;
      const result = await UserProfilePercentageService.get(email);

      // Extracting the necessary data from the result
      const userProfileData = result[0];
      const { candidate, employee } = userProfileData;

      // Mapping the data to the desired structure
      const transformedResult = {
        candidate: candidate.map(
          (group: { fieldGroup: any; expPerc: any; curPerc: any }) => ({
            fieldGroup: group.fieldGroup,
            expPerc: group.expPerc,
            curPerc: group.curPerc,
          })
        ),
        employee: employee.map(
          (group: { fieldGroup: any; expPerc: any; curPerc: any }) => ({
            fieldGroup: group.fieldGroup,
            expPerc: group.expPerc,
            curPerc: group.curPerc,
          })
        ),
      };

      // Sending the transformed result as a JSON response
      res.status(HttpStatusCode.OK_200).json(transformedResult);
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
   * Creates/updates the user's profile percentage
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action for debugging purposes
      logger.info("Create user ProfilePercentage by email [controller]");

      // Extract email from request parameters
      const email = req.params.id;

      // Create the variable using the helper class
      let userProfilePercentageDTO: UserProfilePercentageDTO =
        UserProfilePercentageOperationHelper.createUserProfilePercentageDTO();

      const result = await UserProfilePercentageService.create(
        email,
        userProfilePercentageDTO
      );

      // Send a successful response with user data
      res.status(HttpStatusCode.OK_200).json(result);
    } catch (error: any) {
      // If it's another type of error, pass it to the next error handler
      next(error);
    }
  };
}

export default UserProfilePercentageController;
