import { Router } from "express";
import UserCalendarFreeBusyController from "../controllers/UserCalendarFreeBusy.controller";

const freeBusyController = new UserCalendarFreeBusyController();
const UserCalendarFreeBusyRouter = Router();

/**
 * ASSOCIATE USER CALENDAR ICAL ENTRY
 * [POST] /user/freebusy
 */
UserCalendarFreeBusyRouter.post("/freebusy", freeBusyController.addIcalUrl);

/**
 * UPDATE USER CALENDAR ICAL ENTRY
 * [PATCH] /user/freebusy
 */
UserCalendarFreeBusyRouter.patch("/freebusy", freeBusyController.updateIcalUrl);

/**
 * GET FREEBUSY DETAILS BY BATCH (IDS AND EMAILS)
 * [POST] /user/freebusy/query
 */
UserCalendarFreeBusyRouter.post("/freebusy/query", freeBusyController.getFreeBusyBatch);

/**
 * GET FREEBUSY OF A SINGLE USER BY USERID
 * [GET] /user/freebusy/:userId
 */
UserCalendarFreeBusyRouter.get("/freebusy/:userId", freeBusyController.getSingleUserFreeBusy);

export default UserCalendarFreeBusyRouter;
