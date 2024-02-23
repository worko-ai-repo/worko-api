// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import { UserDetailDTO } from "../dtos/UserDetail.dto";

// Load the local schema
import { userDetailDTOValidation } from "../schemas/UserDetail.schema";
import { validateEmailField } from "../schemas/User.schema";

// Load the shared service
import UserDetailService from "../services/UserDetail.service";
import UserProfilePercentageService from "../services/UserProfilePercentage.service";

// Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

// Load local helper
import { GroupingHelper } from "../helpers/grouping.helper";
import { UserProfilePercentageOperationHelper } from "../helpers/ProfilePercentageOperations.helper";
import InvokeLambdaService from "../services/InvokeLambda.service";

/**
 * UserDetailController
 *
 * Class to perform related/relevent action/activities related to the "UserDetail" table
 */
class UserDetailController {
  /**
   * getUserById
   *
   * Get the user based on the provided quesry parameters
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  getByEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Get user detail by id [controller]");

      // Extract email from request parameters
      const email = req.params.id;

      const { error, value } = validateEmailField(email);

      if (error) {
        throw new RequestValidationError(error);
      }
      const result = await UserDetailService.get(value);

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
   * Creates/updates the user's details URLs
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action for debugging purposes
      logger.info("Create/update user Detail by email [controller]");

      // Extract email from request parameters
      const email = req.params.id;

      const { error: emailError, value: emailId } = validateEmailField(email);

      const userDetailDTO: UserDetailDTO = req.body;
      logger.debug("userDetailDTO: ", userDetailDTO);
      let { error, value } = userDetailDTOValidation.validate(userDetailDTO, {
        abortEarly: false,
      });

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

      const result = await UserDetailService.update(
        emailId,
        req.body.SK,
        value
      );

      userProfilePercentageDTO =
        UserProfilePercentageOperationHelper.updateCurPerc(
          userProfilePercentageDTO,
          value
        );

      UserProfilePercentageService.update(emailId, userProfilePercentageDTO);

      // If it has an SK, then it is an update, and if it does not have an SK, it is a create
      /* if (req.body.SK) {
        UserDetailService.update(email, req.body.SK, value);
      } else {
        UserDetailService.create(email, value);
      } */

      if(userDetailDTO.CV)    // trigger the resume extraction if cv is extracted
        InvokeLambdaService.triggerResumeExtraction(email)    

      // Send a successful response with user data
      res.status(HttpStatusCode.OK_200).json(result);
    } catch (error: any) {
      // If it's another type of error, pass it to the next error handler
      next(error);
    }
  };
}

export default UserDetailController;
