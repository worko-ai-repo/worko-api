// Import npm packages
import { Request, Response, NextFunction } from "express";

// Import Services
import { scriptServiceObj } from "../services/Script.service";

// Import Schemas
import { scriptValidateEmailFieldSchema } from "../schemas/Script.schema";

// Import local utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

/**
 * ScriptController
 *
 * Controller for handling script-related operations related to updating GSI attributes.
 */
class ScriptController {
  /**
   * updateUserSubscriptionsGSIs
   *
   * Updates the GSI1PK and GSI1SK attributes for all user subscriptions.
   *
   * Problem: The GSI1PK and GSI1SK attributes for user subscriptions need to be updated
   * according to the latest requirements or as defined in the data model file. This operation
   * ensures that the Global Secondary Index (GSI) is consistent with the updated data structure
   * and maintains data integrity.
   * This operation updates these attributes to ensure the GSI is consistent with the updated data
   * structure, thereby maintaining data integrity across the application.
   *
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   * @returns {Promise<void>} - A promise that resolves to void
   */
  updateUserSubscriptionsGSIs = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Update the GSI1PK and GSI1SK attributes for all user subscriptions
      const updatedUserSubs =
        await scriptServiceObj.updateAllUserSubscriptionsGSI1SK();
      res.status(HttpStatusCode.OK_200).json(updatedUserSubs);
    } catch (error) {
      next(error);
    }
  };

  /**
   * updateUserReferralsJdMatchErrorCode
   *
   * @description Update the `jdMatchErrorCode` field based on specific conditions, and then updates the
   * data in the database. Returns an array of the updated user referral data.
   * This function handles any missing fields that need to be added to user referrals
   * based on job descriptions matching error codes.
   *
   * @async
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   *
   * @returns {Promise<void>} - A promise that resolves to void. Sends a JSON response
   * with the updated user referrals data if the operation is successful.
   *
   * @throws {Error} - Passes any encountered errors to the next middleware for error handling.
   */
  updateUserReferralsJdMatchErrorCode = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Update the GSI1PK and GSI1SK attributes for all user referrals
      const updatedUserRefsData =
        await scriptServiceObj.updateUserReferralsJdMatchErrorCode();
      res.status(HttpStatusCode.OK_200).json(updatedUserRefsData);
    } catch (error) {
      // Pass the error to the next middleware for error handling
      next(error);
    }
  };

  /**
   * scriptUpdateUsersToLowerCase
   *
   * To update all users name to lowercase
   *
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   */
  scriptUpdateUsersToLowerCase = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await scriptServiceObj.scriptUpdateUsersToLowerCase();

      return res
        .status(HttpStatusCode.OK_200)
        .json({ message: "User Details Updated Successfully" });
    } catch (error) {
      // Pass the error to the next middleware for error handling
      next(error);
    }
  };

  /**
   * scriptUpdatePkEmailToLowerCase
   *
   * Updates the specific email present in `PK` attribute to lower case in the DynamoDB table.
   *
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @throws {RequestValidationError} If the email parameter is invalid.
   */
  scriptUpdatePkEmailToLowerCase = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const reqParams = req.params;

      // Validate the email field using Joi schema and throw error if not valid
      const {
        error,
        value: { oldEmail, newEmail },
      } = scriptValidateEmailFieldSchema.validate({
        oldEmail: reqParams.oldEmail,
        newEmail: reqParams.newEmail,
      });
      if (error) {
        throw new RequestValidationError(error);
      }

      await scriptServiceObj.scriptUpdatePkEmailToLowerCase(oldEmail, newEmail);

      return res
        .status(HttpStatusCode.OK_200)
        .json({ message: `${oldEmail} has been updated to ${newEmail}` });
    } catch (error) {
      // Pass the error to the next middleware for error handling
      next(error);
    }
  };

  /**
   * scriptUpdateSkForCorporateUsers
   *
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   */
  scriptUpdateSkForCorporateUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await scriptServiceObj.scriptUpdateSkForCorporateUsers();

      return res
        .status(HttpStatusCode.OK_200)
        .json({ message: " 'SK' & 'GSI1PK' Updated Successfully" });
    } catch (error) {
      // Pass the error to the next middleware for error handling
      next(error);
    }
  };

  /**
   * scriptUpdateSKForCorporateUserInvite
   *
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   */
  scriptUpdateSKForCorporateUserInvite = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await scriptServiceObj.scriptUpdateSKForCorporateUserInvite();

      return res
        .status(HttpStatusCode.OK_200)
        .json({ message: " 'SK' Updated Successfully" });
    } catch (error) {
      // Pass the error to the next middleware for error handling
      next(error);
    }
  };

  /**
   * scriptUpdateUsersToLowerCase
   *
   * To update all `jdExtracted` data type to `string` data type
   *
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   */
  scriptUpdatejdExtractedToStringDataType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await scriptServiceObj.scriptUpdatejdExtractedToStringDataType();
      return res.status(HttpStatusCode.OK_200).json({
        message:
          "Data Type of `jdExtracted` Updated to `String` Data Type Successfully",
      });
    } catch (error) {
      // Pass the error to the next middleware for error handling
      next(error);
    }
  };

  /**
   * scripToUpdateRegisteredUserGsiTwo
   *
   * script to Update registered Users To LowerCase
   *
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   */
  scripToUpdateRegisteredUserGsiTwo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info("ScriptController:: scripToUpdateRegisteredUserGsiTwo");

      const response = await scriptServiceObj.scripToUpdateRegisteredUserGsiTwo();
      global.logger.info(`Script to Updated Users`, { response });
      return res
        .status(HttpStatusCode.OK_200)
        .json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * scripToRetryUpdateRegisteredUserGsiTwo
   *
   * script to Update registered Users To LowerCase
   *
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   */
  scripToRetryUpdateRegisteredUserGsiTwo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await scriptServiceObj.scripToRetryUpdateRegisteredUserGsiTwo(req.body);
      return res
        .status(HttpStatusCode.OK_200)
        .json(response);
    } catch (error) {
      next(error);
    }
  };
}

export default ScriptController;
