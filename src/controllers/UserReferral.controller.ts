//npm import
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import { UserReferralRequestDTO } from "../dtos/User.dto";

// Load the local schema
import {
  UserReferralRequestDTOValidation,
  UserReferralStatusValidation,
} from "../schemas/UserReferral.schema";

// Load the shared service
import UserService from "../services/User.service";
import UserReferralService from "../services/UserReferral.service";

//Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";
import { ReferralActions } from "../enums/User.enum";

/**
 * UserReferralController
 *
 * Class to perform related/relevent action/activities related to the "user referral" table
 */
class UserReferralController {
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
      logger.info("Get user Referral by email [controller]");

      // Extract email from request parameters
      const email = req.params.id;
      const status = req.query.status;
      let result;

      if (status && typeof status === "string") {
        result = await UserReferralService.getByStatus(email, status);
      } else {
        result = await UserReferralService.get(email);
      }

      /* status && typeof status === "string"
        ? result = await UserReferralService.getByStatus(email, status)
        : result = await UserReferralService.get(email); */

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
   * getByGSI1PKAndStatus
   *
   * Retrieves the referrals based on the provided query parameters
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  getByGSI1PKAndStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Log the action for debugging purposes
      logger.info("Get Referral by GSI1PK and status [controller]");

      // Extract email from request parameters
      const companySK = req.params.companySK;
      const status = req.query.status;
      let result;

      if (status && typeof status === "string") {
        result = await UserReferralService.getByGSI1PKAndStatus(
          companySK,
          status
        );
      } else {
        result = await UserReferralService.getByGSI1PK(companySK);
      }

      /* status && typeof status === "string"
        ? result = await UserReferralService.getByStatus(email, status)
        : result = await UserReferralService.get(email); */

      // Send a successful response with user data
      res.status(HttpStatusCode.OK_200).json(result);
    } catch (error: any) {
      // Handle errors

      // If it's another type of error, pass it to the next error handler
      next(error);
    }
  };

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
      res.status(HttpStatusCode.OK_200).json(matchingScore[0]);
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
      res.status(HttpStatusCode.OK_200).json(referralRequestId);
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

  /**
   * updateStatus
   *
   * updates the status of user Referral request
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      global.logger.info("update referral status [controller]");

      const { emailAddress, referralId, status } = req.params;
      const { error } = UserReferralStatusValidation.validate(status, {
        abortEarly: false,
      });

      if (error) {
        throw new RequestValidationError(error);
      }

      const result = await UserReferralService.updateStatus(
        referralId,
        emailAddress,
        status
      );
      res.status(HttpStatusCode.OK_200).json(result);
    } catch (error) {
      // Handle errors
      // Pass other errors to the next error handler
      next(error);
    }
  };

  /**
   * updateStatusByEmployee
   *
   * updates the status of user Referral request
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  updateStatusByEmployee = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info("update referral status  employee  [controller]");

      const { referralId } = req.params;
      const referralstatusUpdate = req.body;
      /* const { error } = UserReferralStatusValidation.validate(status, {
        abortEarly: false,
      });

      if (error) {
        throw new RequestValidationError(error);
      } */
      // Assuming the type of referral is an array with UserReferral objects
      const userId = referralstatusUpdate.userId;
      let referral;
      switch (referralstatusUpdate.action) {
        case ReferralActions.PASS:
          referral = await UserReferralService.getOnlyAttribute(referralId, [
            "passedByUserIds",
          ]);

          console.log("referral: ", referral);

          // Update passedByUserIds for PASS action
          /* let updatedPassedByUserIds: string[] = referral
            ? referral.count === 0
              ? (() => {
                  throw new Error("Wrong referralId");
                })()
              : referral[0].passedByUserIds &&
                Object.keys(referral[0].passedByUserIds).length === 0
              ? (referral[0].passedByUserIds = [userId])
              : referral[0].passedByUserIds
              ? (referral[0].passedByUserIds.push(userId),
                referral[0].passedByUserIds)
              : [userId] // Return an array with userId when referral[0].passedByUserIds is falsy
            : [];

          console.log("updatedPassedByUserIds: -", updatedPassedByUserIds);
          console.log(typeof updatedPassedByUserIds); */

          console.log("Referral type: ", typeof referral);
          console.log("Referral value: ", referral);

          let updatedPassedByUserIds: string[] = [];

          if (referral && referral.length > 0) {
            const firstReferral = referral[0];

            console.log("First referral type: ", typeof firstReferral);
            console.log("First referral value: ", firstReferral);

            if (!firstReferral || firstReferral.count === 0) {
              throw new Error("Wrong referralId");
            }

            if (!firstReferral.passedByUserIds) {
              firstReferral.passedByUserIds = [userId];
            } else {
              if (!Array.isArray(firstReferral.passedByUserIds)) {
                firstReferral.passedByUserIds = [firstReferral.passedByUserIds];
              }
              firstReferral.passedByUserIds.push(userId);
            }

            updatedPassedByUserIds = firstReferral.passedByUserIds;
          }

          console.log("updatedPassedByUserIds: -", updatedPassedByUserIds);
          console.log(
            "Type of updatedPassedByUserIds: ",
            typeof updatedPassedByUserIds
          );

          // Update UserReferral object with the new passedByUserIds
          var re = await UserReferralService.updatePassedByUserIdsByGSI1SK(
            referralId,
            updatedPassedByUserIds
          );

          console.log("updatedPassedByUserIds: -", updatedPassedByUserIds);
          break;

        case ReferralActions.REJECT:
          referral = await UserReferralService.getOnlyAttribute(referralId, [
            "rejectedByUserIds",
          ]);
          break;

        case ReferralActions.ACCEPT:
          referral = await UserReferralService.getOnlyAttribute(referralId, [
            "acceptedByUserId",
          ]);
          break;

        case ReferralActions.DONE:
          referral = await UserReferralService.getOnlyAttribute(referralId, [
            "doneByEmployee",
          ]);
          break;

        default:
          throw new Error("Invalid action provided");
      }

      console.log("referral: ", referral);

      res.status(HttpStatusCode.OK_200).json(re);
    } catch (error) {
      // Handle errors
      // Pass other errors to the next error handler
      next(error);
    }
  };
}

export default UserReferralController;
