// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import { UserBankDetailDTO } from "../dtos/UserBankDetail.dto";
// Load the local schema
import { userBankDetailDTOValidation } from "../schemas/UserBankDetail.schema";
import { validateEmailField } from "../schemas/User.schema";

// Load the shared service
import UserBankDetailService from "../services/UserBankDetail.service";
import UserProfilePercentageService from "../services/UserProfilePercentage.service";

// Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

// Load local helper
import { TimestampHelper } from "../helpers/timeStamp.helper";
import { UserProfilePercentageOperationHelper } from "../helpers/ProfilePercentageOperations.helper";
import { BankUpiStatus } from "../enums/User.enum";

/**
 * UserBankDetailController
 *
 * Class to perform related/relevant actions/activities related to the "UserBankDetail" table
 */
class UserBankDetailController {
  /**
   * getByEmail
   *
   * Retrieves the user BankDetails based on the provided query parameters
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action for debugging purposes
      logger.info("Get user BankDetail by email [controller]");

      // Extract email from request parameters
      const email = req.params.id;

      const { error, value } = validateEmailField(email);

      if (error) {
        throw new RequestValidationError(error);
      }
      const result = await UserBankDetailService.get(value);

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
   * Creates/updates the user's BankDetail URLs
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action for debugging purposes
      logger.info("Create/update user BankDetail by email [controller]");

      // Extract email from request parameters
      const email = req.params.id;

      const { error: emailError, value: emailId } = validateEmailField(email);

      const userBankDetailDTO: UserBankDetailDTO = req.body;
      const { error, value } = userBankDetailDTOValidation.validate(
        userBankDetailDTO,
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

      // Check and add timestamps for BankDetails
      if (value.bankDetails) {
        TimestampHelper.addTimestamps(value.bankDetails);
        TimestampHelper.addTimestamps(value.upiIds);
      }

      let result;
      // Loop through BankDetails and update achievDate to ISO string
      /* if (value && value.BankDetails && Array.isArray(value.BankDetails)) {
        value.BankDetails.forEach(
          (BankDetail: { achievDate: string | number | Date }) => {
            if (BankDetail.achievDate) {
              BankDetail.achievDate = new Date(
                BankDetail.achievDate
              ).toISOString();
            }
          }
        );
      } */

      // If it has an SK, then it is an update, and if it does not have an SK, it is a create
      if (req.body.SK) {
        result = await UserBankDetailService.update(emailId, value);
      } else {
        value.bankDetails[0].status = BankUpiStatus.ACTIVE;
        value.upiIds[0].status = BankUpiStatus.ACTIVE;
        result = await UserBankDetailService.create(emailId, value);
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

export default UserBankDetailController;
