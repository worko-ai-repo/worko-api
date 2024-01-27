// Load the npm packages
import { Router } from "express";

// Load local packages
import UserReferralController from "../controllers/UserReferral.controller";

// Create instance of the "ReferralController" class to read the methods/functions from the same.
const ReferralController = new UserReferralController();

// Route to hold the routes (CRUD, etc) related to "Referral" table
const ReferralRouter = Router();

// Get the referral based on the provided query parameter
// ReferralRouter.get("/:id", ReferralController.getByGSI1PKAndStatus);

// Get the referral based on the provided query parameter
ReferralRouter.get(
  "/company/:companySK",
  ReferralController.getByGSI1PKAndStatus
);

ReferralRouter.put(
  "/:referralId/action",
  ReferralController.updateStatusByEmployee
);

export default ReferralRouter;
