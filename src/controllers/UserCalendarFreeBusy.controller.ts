import { Request, Response, NextFunction } from "express";
import HttpStatusCode from "../utils/http-codes.util";
import { userCalendarFreeBusyServiceObj } from "../services/UserCalendarFreeBusy.service";
import {
  FreeBusyAttendeeDto,
  FreeBusyBatchQueryItem,
  SaveIcalUrlApiDto,
} from "../dtos/UserCalendarFreeBusy.dto";
import {
  freeBusyBatchQueryDtoValidation,
  getSingleUserFreeBusyQueryValidation,
  saveIcalUrlDtoValidation,
} from "../schemas/UserCalendarFreeBusy.schema";
import { RequestValidationError } from "../utils/errors.util";

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

      const { error, value: validatedBody } = saveIcalUrlDtoValidation.validate(req.body, {
        abortEarly: false,
      });
      if (error) {
        throw new RequestValidationError(error);
      }

      const { icalUrl, email: userEmail = "" }: SaveIcalUrlApiDto = validatedBody;

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

      const { error, value: validatedBody } = saveIcalUrlDtoValidation.validate(req.body, {
        abortEarly: false,
      });
      if (error) {
        throw new RequestValidationError(error);
      }

      const { icalUrl, email: userEmail = "" }: SaveIcalUrlApiDto = validatedBody;

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

      const { error, value: validatedPayload } = freeBusyBatchQueryDtoValidation.validate(
        req.body,
        { abortEarly: false }
      );
      if (error) {
        throw new RequestValidationError(error);
      }

      const usersPayload: FreeBusyBatchQueryItem[] = (
        validatedPayload as Array<string | FreeBusyAttendeeDto>
      ).map((item) =>
        typeof item === "string" ? item : { userEmail: item.userEmail, userName: item.userName }
      );

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

      const { error, value: validatedQuery } = getSingleUserFreeBusyQueryValidation.validate(
        { email: req.query.email },
        { abortEarly: false }
      );
      if (error) {
        throw new RequestValidationError(error);
      }

      const { userId } = req.params;
      const { email } = validatedQuery;

      const icalUrl = await userCalendarFreeBusyServiceObj.getIcalUrl(userId, email);
      if (!icalUrl) {
        res.status(HttpStatusCode.NOT_FOUND_404).json({
          success: false,
          message: "No calendar link associated with this user",
        });
        return;
      }

      const busySlots = await userCalendarFreeBusyServiceObj.getBusySlots(icalUrl , new Date(), new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)); // Look 6 months ahead for busy slots by default, can be adjusted as needed

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
