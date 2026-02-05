// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import { UserEducationDTOWithId } from "../dtos/UserEducation.dto";

// Import local helper
import { dateHelperObj } from "../helpers/date.helper";

// Load the local schema
import { userEducationDTOArrayValidation } from "../schemas/UserEducation.schema";
import { validateEmailField } from "../schemas/User.schema";

// Import models
import { DbUserEducationDto } from "../db/models/UserEducation.model";
import { DbCentralCandidateProfileDto } from "../db/gcp-firestore-models/CentralCandidateProfile.model";
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";

// Load the shared service
import UserEducationService from "../services/UserEducation.service";
import { candidateParsedCvServiceObj } from "../services/CandidateParsedCv.service";
import { centralCandidateProfileServiceObj } from "../services/CentralCandidateProfile.service";
// import UserProfilePercentageService from "../services/UserProfilePercentage.service";

// Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

// Load local helper
// import { UserProfilePercentageOperationHelper } from "../helpers/ProfilePercentageOperations.helper";

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
      const email = req.params.id;

      const { error, value } = validateEmailField(email);

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
      const email = req.params.id;

      const { error: emailError, value: emailId } = validateEmailField(email);

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
      } else if (error) {
        throw new RequestValidationError(error);
      }

      /*
      WARNING: Do not remove this commented code because we may
      use this in near future

      NOTE: In `2024` we used `angular` in frontend and in that we used to have
      profile percentage for user(candidate, employee) but now we are not
      using it, so we are commenting this code to stop calculating the profile percentage
      for new users

      let userProfilePercentageDTO = await UserProfilePercentageService.get(
        emailId
      );
      userProfilePercentageDTO = userProfilePercentageDTO.toJSON()[0];
      */

      let userEducationResponse: DbUserEducationDto[] = [];
      for (let i = 0; i < userEducationDTO.length; i++) {
        /*
        WARNING: Do not remove this commented code because we may
        use this in near future

        NOTE: In `2024` we used `angular` in frontend and in that we used to have
        profile percentage for user(candidate, employee) but now we are not
        using it, so we are commenting this code to stop calculating the profile percentage
        for new users

        // checking the fields in profile percentage for UserExperience and updating the current percentage
        userProfilePercentageDTO =
          UserProfilePercentageOperationHelper.updateCurPerc(
            userProfilePercentageDTO,
            value[i]
          );
        */

        // If it has an SK, then it is an update, and if it does not have an SK, it is a create
        if (userEducationDTO[i].SK) {
          const result = await UserEducationService.update(
            emailId,
            userEducationDTO[i].SK,
            value[i]
          );
          userEducationResponse.push(result);
        } else {
          const result = await UserEducationService.createEducation(emailId, value[i]);
          userEducationResponse.push(result);
        }
      }

      if(userEducationResponse.length > 0) {
        const centralCandidateProfile: DbCentralCandidateProfileDto | undefined = await centralCandidateProfileServiceObj.getCentralCandidateProfileById(email);
        if(centralCandidateProfile) {
          const updateCandParsedData: Partial<DbCandidateParsedCvDto> = {
            updatedAt: dateHelperObj.getISODate(),
            education: userEducationResponse.map(edu => JSON.parse(JSON.stringify(edu)))
          };
          await candidateParsedCvServiceObj.updateCandidateParsedCvByIds(
            centralCandidateProfile.candidateParsedCvIds,
            updateCandParsedData,
          );
        }
      }

      /*
      WARNING: Do not remove this commented code because we may
      use this in near future

      NOTE: In `2024` we used `angular` in frontend and in that we used to have
      profile percentage for user(candidate, employee) but now we are not
      using it, so we are commenting this code to stop calculating the profile percentage
      for new users
      UserProfilePercentageService.update(emailId, userProfilePercentageDTO);
      */

      // Send a successful response with user data
      res.status(HttpStatusCode.OK_200).json(userEducationResponse);
    } catch (error: any) {
      // If it's another type of error, pass it to the next error handler
      next(error);
    }
  };

  /**
   * Deletes a user's education entry.
   *
   * @param req The request object
   * @param res The response object
   * @param next The next function
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info("Delete user education [controller]");

      const email = req.params.id;
      // EntryId is the SK
      const id = req.params.entryId;

      // Validate Email 
      const { error: emailError } = validateEmailField(email);

      if (emailError) {
        throw new RequestValidationError(emailError);
      } 
      await UserEducationService.delete(email, id);
      //  Return No Content (204) status code with no content
      res.status(HttpStatusCode.NO_CONTENT_204).json();
    } catch (error: any) {
      // If it's another type of error, pass it to the next error handler
      next(error);
    }
  };
}

export default UserEducationController;
