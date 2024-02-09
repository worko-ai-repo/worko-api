// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import { UserAchievementDTO } from "../dtos/UserAchievement.dto";
// Load the local schema
import { userAchievementDTOValidation } from "../schemas/UserAchievement.schema";
// Load the shared service
import UserAchievementService from "../services/UserAchievement.service";
import UserProfilePercentageService from "../services/UserProfilePercentage.service";

// Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

// Load local helper
import { TimestampHelper } from "../helpers/timeStamp.helper";
import { UserProfilePercentageOperationHelper } from "../helpers/ProfilePercentageOperations.helper";
import { EmailDTOValidation } from "../schemas/User.schema";

/**
 * UserAchievementController
 *
 * Class to perform related/relevant actions/activities related to the "UserAchievement" table
 */
class UserAchievementController {
  /**
   * getByEmail
   *
   * Retrieves the user Achievements based on the provided query parameters
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action for debugging purposes
      logger.info("Get user Achievement by email [controller]");

      // Extract email from request parameters
      const email = req.params;
      const { error ,value } = EmailDTOValidation.validate(email, {
        abortEarly: false,
      });

      if (error) {
        throw new RequestValidationError(error);
      }
      const result = await UserAchievementService.get(value);

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
   * Creates/updates the user's achievement URLs
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action for debugging purposes
      logger.info("Create/update user Achievement by email [controller]");

      // Extract email from request parameters
      const email = req.params;
      const { error: emailError , value : emailId} = EmailDTOValidation.validate(email);

      const userAchievementDTO: UserAchievementDTO = req.body;
      const { error, value } = userAchievementDTOValidation.validate(
        userAchievementDTO,
        {
          abortEarly: false,
        }
      );

      // Validate the user input and throw a validation error if necessary
      if(emailError){
        throw new RequestValidationError(emailError) 
      }
      else if (error) {
        throw new RequestValidationError(error);
      }

      // Check and add timestamps for achievements
      if (value.achievements) {
        TimestampHelper.addTimestamps(value.achievements);
      }

      let result;
      // Loop through achievements and update achievDate to ISO string
      if (value && value.achievements && Array.isArray(value.achievements)) {
        value.achievements.forEach(
          (achievement: { achievDate: string | number | Date }) => {
            if (achievement.achievDate) {
              achievement.achievDate = new Date(
                achievement.achievDate
              ).toISOString();
            }
          }
        );
      }

      // If it has an SK, then it is an update, and if it does not have an SK, it is a create
      if (req.body.SK) {
        result = await UserAchievementService.update(emailId, value);
      } else {
        result = await UserAchievementService.create(emailId, value);
      }

      let userProfilePercentageDTO = await UserProfilePercentageService.get(
        emailId
      );
      userProfilePercentageDTO = userProfilePercentageDTO.toJSON()[0];

      userProfilePercentageDTO =
        UserProfilePercentageOperationHelper.updateCurPerc(
          userProfilePercentageDTO,
          value
        );

      UserProfilePercentageService.update(emailId, userProfilePercentageDTO);

      // Send a successful response with user data
      res.status(HttpStatusCode.OK_200).json(result);
    } catch (error: any) {
      // If it's another type of error, pass it to the next error handler
      next(error);
    }
  };
}

export default UserAchievementController;
