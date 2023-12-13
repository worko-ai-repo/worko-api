//npm import
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import { UserReferralRequestDTO } from "../dtos/User.dto";

// Load the local schema
import { UserReferralRequestDTOValidation } from "../schemas/UserReferral.schema";

// Load the shared service
import UserService from "../services/User.service";
import UserReferralService from "../services/UserReferral.service";

//Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

/**
 * UserReferralController
 *
 * Class to perform related/relevent action/activities related to the "user referral" table
 */
class UserReferralController {
  /**
   *
   * getMatchingScore
   *
   * get the referral request matching score
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  getMatchingScore = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id, referralId } = req.params;
      const matchingScore = await UserReferralService.matchingScore(
        id,
        referralId
      );
      res.status(HttpStatusCode.OK_200).json({
        status: "success",
        message: "Calculated referral matching score successfully",
        data: matchingScore,
      });
    } catch (error) {
      console.log("getMatchingScore-> Error: ", error);
      next(error);
    }
  };

  /**
   * createReferral
   *
   * Create a new referral based on the provided input data. Validates the input data
   * and, if successful, proceeds with the new referral creation logic.
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  createReferral = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Create referral [controller]");
      const referralRequest: UserReferralRequestDTO = req.body;
      const { error } = UserReferralRequestDTOValidation.validate(
        referralRequest,
        { abortEarly: false }
      );

      if (error) {
        throw new RequestValidationError(error);
      }

      const email = req.params.id;
      /* const SK = await UserService.getSK(email);
      const subStatus = await UserService.getSubscriptionStatus(email, SK);
      if (!subStatus[0].isSubscribed) {
        res.status(HttpStatusCode.PAYMENT_REQUIRED_402).json({
          status: "failure",
          message: "Payment Required",
          description:
            "User does not have an active subscription. Please subscribe to access this service.",
        });
      } */

      const referralRequestId = await UserReferralService.referralRequest(
        referralRequest,
        email
      );
      res.status(HttpStatusCode.OK_200).json({
        status: "success",
        message: "Referral created successfully",
        data: referralRequestId,
      });
    } catch (error) {
      // Handle errors
      // Pass the error to the next error handler
      console.log("error: ", error);
      // Check if the error is a specific type (TypeError in this case)
      if (
        error instanceof TypeError &&
        error.message.includes("undefined (reading 'SK')")
      ) {
        // Respond with "User not found" message and set a different status code (e.g., 400)
        res.status(HttpStatusCode.UNAUTHORIZED_401).json({
          status: "failure",
          message: "There is no user with the provided details",
        });
      } else {
        // Pass other errors to the next error handler
        next(error);
      }
    }
  };
}

export default UserReferralController;
