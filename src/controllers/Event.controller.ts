// Load npm packages
import { Request, Response, NextFunction } from "express";

// Import constants
import APP_CONSTANTS from "../configs/constants.config";

// // Import enums
import { ReferralStatus } from "../enums/UserReferral.enum";

// Import services
import UserReferralService from "../services/UserReferral.service";

// Import utilities
import HttpStatusCode from "../utils/http-codes.util";

/**
 * EventController
 *
 * Class to perform activities related to Events
 */
class EventController {
  /**
   * processReferralForEvent
   *
   * Process a referral for a specific event
   *
   * @param req Request
   * @param res Response
   * @param next NextFunction
   */
  processReferralForEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Implement logic to process a referral for an event
      const referralId = req.params.id;
      
      // Retrive the referral details and validate
      let userReferralDetails = await UserReferralService.getReferralById(
        referralId
      );
      if (!userReferralDetails.count) {
        throw new Error("Referral not found");
      }

      // Get the mathcing score from refrral details
      let userReferralMatchingScore = userReferralDetails[0].matchingScore;

      // Prepare userEmail for further action 
      const userEmail = userReferralDetails[0].PK.split("#")[2];

      // Update the status of the referral based on low matching score
      if (userReferralMatchingScore < APP_CONSTANTS.REFERRAL_MINIMUM_MATCHING_SCORE) {
        await UserReferralService.updateStatus(
          referralId,
          userEmail,
          ReferralStatus.CANCELLED
        );
      }
      return res.status(HttpStatusCode.OK_200).json();
    } catch (error) {
      next(error);
    }
  };
}

export default EventController;
