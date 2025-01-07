// Load the npm packages
import { Router } from "express";

// Load local packages
import UserReferralController from "../controllers/UserReferral.controller";

// Create instance of the "UserReferralController" class to read the methods/functions from the same.
const userReferralController = new UserReferralController();

// Route to hold the routes (CRUD, etc) related to "userReferral" table
const UserReferralRouter = Router();

/**
 * Create referral based on the provided query parameter
 * 
 * @authorisedRoles 
 */
UserReferralRouter.post("/:userEmail/referral/request", userReferralController.createReferralByCand
);

/**
 * Get referral based on the provided query parameter
 * 
 * @authorisedRoles 
 */
UserReferralRouter.get("/:userEmail/referral", userReferralController.getReferralsForCand);

/**
 * Get matching Score
 * 
 * @authorisedRoles 
 */
UserReferralRouter.get("/:id/referral/:referralId/score", userReferralController.getReferralScoreForCand
);

/**
 * Update referral status by candidate
 * 
 * @authorisedRoles 
 */
UserReferralRouter.put("/:candEmail/referral/:referralId/:newStatus", userReferralController.updateReferralStatusByCand
);

export default UserReferralRouter;
