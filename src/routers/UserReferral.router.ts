// Load the npm packages
import { Router } from "express";

// Load local packages
import UserReferralController from "../controllers/UserReferral.controller";

// Create instance of the "UserReferralController" class to read the methods/functions from the same.
const userReferralController = new UserReferralController();

// Route to hold the routes (CRUD, etc) related to "userReferral" table
const UserReferralRouter = Router();

// Create referral based on the provided query parameter
UserReferralRouter.post("/referral/:id", userReferralController.createReferral);

// UserReferralRouter.put("/:id", userReferralController.updateReferral);

// UserReferralRouter.put("/:id", userReferralController.updateStatus);

// UserReferralRouter.delete("/:id", userReferralController.deleteReferral);

// UserReferralRouter.get("/", userReferralController.getReferral);

// UserReferralRouter.get("/:id", userReferralController.getReferralById);

export default UserReferralRouter;
