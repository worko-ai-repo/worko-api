// Load npm packages
import { Request, Response, NextFunction } from "express";

// Import dynamoose
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Load the local dtos
import { UserSocialProfileDTO, UserSocialProfileDTOWithPrimaryKeys } from "../dtos/UserSocialProfile.dto";

// Import models
import { DbUserSocialProfileDto } from "../db/models/UserSocialProfile.model";

// Load local helpers
// import { UserProfilePercentageOperationHelper } from "../helpers/ProfilePercentageOperations.helper";
// import { isFalsyOrEmpty } from "../helpers/common.helper";

// Load the local schema
import { userSocialProfileDTOValidation } from "../schemas/UserSocialProfile.schema";
import { validateEmailField } from "../schemas/User.schema";

// Load the shared service
import UserSocialProfileService from "../services/UserSocialProfile.service";
// import UserProfilePercentageService from "../services/UserProfilePercentage.service";

// Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

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

      // Validate the email field
      const { error: emailError, value: emailIdValue } = validateEmailField(email);
      global.logger.debug(`Validating email in create method of UserSocialProfileController:`,{
        fileName: __filename,
        methodName:this.create.name,
        emailIdValue
      });

      // retrieve the user input and validate it
      const userSocialProfileBody: UserSocialProfileDTOWithPrimaryKeys = req.body;
      const { error, value:userSocialProfileDTO } = userSocialProfileDTOValidation.validate(
        userSocialProfileBody,
        {
          abortEarly: false,
        }
      );
      global.logger.debug(`userSocialProfileDTO:`, {
        fileName: __filename,
        methodName: this.create.name,
        userSocialProfileDTO,
      });

      // Validate the user input and throw a validation error if necessary
      if (emailError) {
        throw new RequestValidationError(emailError);
      } else if (error) {
        throw new RequestValidationError(error);
      }

      let result;
      let socialProfileDetails: UserSocialProfileDTO; 

      // If it has an SK, then it is an update, and if it does not have an SK, it is a create
      if (userSocialProfileDTO.SK) {
        // extract the social profile data
        const { PK, SK, ...socialProfileData } = userSocialProfileDTO;
        global.logger.debug(`userSocialProfileDTO destructured data:`, {
          fileName: __filename,
          methodName: this.create.name,
          socialProfileData,
          PK,
          SK,
          emailIdValue
        });

        const existingSocialLinks: QueryResponse<DbUserSocialProfileDto> = await UserSocialProfileService.get(
          emailIdValue
        );
        const existingSocialLinksData: DbUserSocialProfileDto = existingSocialLinks[0];

        result = await UserSocialProfileService.update(emailIdValue, socialProfileData);

        socialProfileDetails = socialProfileData;
      } else {
        result = await UserSocialProfileService.create(
          emailIdValue,
          userSocialProfileDTO
        );

        socialProfileDetails = userSocialProfileDTO;
      }

      global.logger.debug(`socialProfileDetails:`, {
        fileName: __filename,
        methodName: this.create.name,
        socialProfileDetails,
      });

      /*
      // Get the user's profile percentage by email
      let userProfilePercentageDTO = await UserProfilePercentageService.get(
        emailIdValue
      );

      // Convert the result to a JSON object and get the first element
      userProfilePercentageDTO = userProfilePercentageDTO.toJSON()[0];

      const isAnyOneOfSocialProfileDetailsExists: boolean = APP_CONSTANTS.SOCIAL_PROFILE_KEYS.some(
        (socialProfileKey: string) => {
          const isFalsy: boolean = !isFalsyOrEmpty(
            socialProfileDetails[socialProfileKey as keyof UserSocialProfileDTO]
          );
          global.logger.debug(` "isAnyOneOfSocialProfileDetailsExists" debug:`, {
            fileName: __filename,
            methodName: this.create.name,
            socialProfileKey,
            isFalsy
          });
          return isFalsy;
        } 
      );

      const socialProfileUpdateObject: { socialProfile: UserSocialProfileDTO | undefined } = {
        socialProfile: isAnyOneOfSocialProfileDetailsExists ? socialProfileDetails : undefined,
      };

      userProfilePercentageDTO =
        UserProfilePercentageOperationHelper.updateCurPerc(
          userProfilePercentageDTO,
          socialProfileUpdateObject
        );
      
      // Update the user's profile percentage in the database
      UserProfilePercentageService.update(emailIdValue, userProfilePercentageDTO);
      */

      // Send a successful response with user data
      res.status(HttpStatusCode.OK_200).json(result);
    } catch (error: any) {
      // If it's another type of error, pass it to the next error handler
      next(error);
    }
  };
}

export default UserSocialProfileController;
