// Load the npm packages
import { Router } from "express";

// Load local packages
import UserReferralController from "../controllers/UserReferral.controller";

// Create instance of the "UserReferralController" class to read the methods/functions from the same.
const userReferralController = new UserReferralController();

// Route to hold the routes (CRUD, etc) related to "userReferral" table
const UserReferralRouter = Router();

// Create referral based on the provided query parameter
UserReferralRouter.post("/:userEmail/referral/request", userReferralController.createReferralByCand
);

// Create referral based on the provided query parameter
UserReferralRouter.get("/:userEmail/referral", userReferralController.getReferralsForCand);

// Get matching Score
UserReferralRouter.get("/:id/referral/:referralId/score", userReferralController.getReferralScoreForCand
);

UserReferralRouter.put("/:candEmail/referral/:referralId/:newStatus", userReferralController.updateReferralStatusByCand
);

export default UserReferralRouter;
