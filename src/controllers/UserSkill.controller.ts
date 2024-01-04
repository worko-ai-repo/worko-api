// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import { UserSkillDTO } from "../dtos/UserSkill.dto";
// Load the local schema
import { userSkillDTOValidation } from "../schemas/UserSkill.schema";
// Load the shared service
import UserSkillService from "../services/UserSkill.service";

// Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";
import { TimestampHelper } from "../helpers/timeStamp.helper";

// Load local helper

/**
 * UserSkillController
 *
 * Class to perform related/relevant actions/activities related to the "UserSkill" table
 */
class UserSkillController {
  /**
   * getByEmail
   *
   * Retrieves the user skills based on the provided query parameters
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action for debugging purposes
      logger.info("Get user Skill by email [controller]");

      // Extract email from request parameters
      const email = req.params.id;
      const result = await UserSkillService.get(email);

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
      logger.info("Create/update user Skill by email [controller]");

      // Extract email from request parameters
      const email = req.params.id;
      const userSkillDTO: UserSkillDTO = req.body;
      const { error, value } = userSkillDTOValidation.validate(userSkillDTO, {
        abortEarly: false,
      });

      // Validate the user input and throw a validation error if necessary
      if (error) {
        throw new RequestValidationError(error);
      }

      // Check and add timestamps for each category
      if (value.coreSkills) {
        TimestampHelper.addTimestamps(value.coreSkills);
      }

      if (value.softSkills) {
        TimestampHelper.addTimestampsWithOutUpdatedAt(value.softSkills);
      }

      if (value.certifications) {
        TimestampHelper.addTimestampsWithOutUpdatedAt(value.certifications);
      }

      let result;

      // If it has an SK, then it is an update, and if it does not have an SK, it is a create
      if (req.body.SK) {
        result = await UserSkillService.update(email, value);
      } else {
        result = await UserSkillService.create(email, value);
      }

      // Send a successful response with user data
      res.status(HttpStatusCode.OK_200).json(result);
    } catch (error: any) {
      // If it's another type of error, pass it to the next error handler
      next(error);
    }
  };
}

export default UserSkillController;
