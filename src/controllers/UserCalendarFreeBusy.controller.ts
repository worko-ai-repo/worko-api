import { Request, Response, NextFunction } from "express";
import HttpStatusCode from "../utils/http-codes.util";
import { userCalendarFreeBusyServiceObj } from "../services/UserCalendarFreeBusy.service";

/**
 * UserCalendarFreeBusyController
 *
 * This controller handles all operations related to the free-busy calendar of users.
 */
class UserCalendarFreeBusyController {
  /**
   * Associate an iCal calendar URL with the logged-in user.
   * [POST] /user/freebusy
   */
  addIcalUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      global.logger.info("Processing request to add calendar iCal link [CONTROLLER]");

      const icalUrl = String(req.body?.icalUrl ?? "").trim();
      const userEmail = String(req.body?.email ?? "").trim(); // Optional email for better matching in service layer
      if (!icalUrl) {
        res.status(HttpStatusCode.BAD_REQUEST_400).json({
          success: false,
          message: "icalUrl is required",
        });
        return;
      }
      global.logger.info("Request local context [CONTROLLER]",{
        reqBody:req.body, 
        global:global.requestLocalContext
      } );
      const { userId } = global.requestLocalContext;
      if (!userId) {
        res.status(HttpStatusCode.UNAUTHORIZED_401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      await userCalendarFreeBusyServiceObj.saveIcalUrl(userId, userEmail, icalUrl);

      res.status(HttpStatusCode.OK_200).json({
        success: true,
        message: "Calendar link associated successfully",
      });
    } catch (error) {
      global.logger.error("Failed to associate calendar link [CONTROLLER]", error);
      next(error);
    }
  };

  /**
   * Update an iCal calendar URL for the logged-in user.
   * [PATCH] /user/freebusy
   */
  updateIcalUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      global.logger.info("Processing request to update calendar iCal link [CONTROLLER]");

      const icalUrl = String(req.body?.icalUrl ?? "").trim();
        const userEmail = String(req.body?.email ?? "").trim(); // Optional email for better matching in service layer
      if (!icalUrl) {
        res.status(HttpStatusCode.BAD_REQUEST_400).json({
          success: false,
          message: "icalUrl is required",
        });
        return;
      }

      const { userId } = global.requestLocalContext;
      if (!userId) {
        res.status(HttpStatusCode.UNAUTHORIZED_401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      await userCalendarFreeBusyServiceObj.saveIcalUrl(userId, userEmail, icalUrl);

      res.status(HttpStatusCode.OK_200).json({
        success: true,
        message: "Calendar link updated successfully",
      });
    } catch (error) {
      global.logger.error("Failed to update calendar link [CONTROLLER]", error);
      next(error);
    }
  };

  /**
   * Batch get free-busy busy slots of multiple users.
   * [POST] /user/freebusy/query
   */
  getFreeBusyBatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      global.logger.info("Processing request to get batch free-busy slots [CONTROLLER]");

      const usersPayload = req.body;
      if (!Array.isArray(usersPayload)) {
        res.status(HttpStatusCode.BAD_REQUEST_400).json({
          success: false,
          message: "Request body must be an array of users",
        });
        return;
      }

      // Validate each user object in payload
      for (const user of usersPayload) {
        if (!user.userId || !user.userEmail) {
          res.status(HttpStatusCode.BAD_REQUEST_400).json({
            success: false,
            message: "Each user object must contain a userId and userEmail",
          });
          return;
        }
      }

      const response = await userCalendarFreeBusyServiceObj.getBatchFreeBusy(usersPayload);
      res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error("Failed to fetch batch free-busy slots [CONTROLLER]", error);
      next(error);
    }
  };

  /**
   * Get free-busy slots for a single user.
   * [GET] /user/freebusy/:userId
   */
  getSingleUserFreeBusy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      global.logger.info("Processing request to get single user free-busy slots [CONTROLLER]");

      const { userId } = req.params;
      const email = String(req.query.email ?? "");

      const icalUrl = await userCalendarFreeBusyServiceObj.getIcalUrl(userId, email);
      if (!icalUrl) {
        res.status(HttpStatusCode.NOT_FOUND_404).json({
          success: false,
          message: "No calendar link associated with this user",
        });
        return;
      }

      const busySlots = await userCalendarFreeBusyServiceObj.getBusySlots(icalUrl);

      res.status(HttpStatusCode.OK_200).json({
        success: true,
        totalBusySlots: busySlots.length,
        busySlots,
      });
    } catch (error) {
      global.logger.error("Failed to fetch single user free-busy slots [CONTROLLER]", error);
      next(error);
    }
  };
}

export default UserCalendarFreeBusyController;
