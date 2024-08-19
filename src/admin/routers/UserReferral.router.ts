// Load the npm packages
import { Router } from "express";

// Load controllers
import UserReferralController from "../controllers/UserReferral.controller";

// Create an instance of the "UserReferralController" class to use its methods/functions
const userReferralControllerObj = new UserReferralController();

// Create a new router instance for handling user referral routes
const UserReferralRouter = Router();

// Route to handle GET requests for fetching user referrals and status field as query parameter as optional
UserReferralRouter.get("/", userReferralControllerObj.getReferrals);

// Route to handle GET requests for fetching user referral by id
UserReferralRouter.get("/:id", userReferralControllerObj.getReferralDetailById);

// Export the UserReferralRouter for use in other modules
export default UserReferralRouter;
