// Load the npm packages
import { Router } from "express";

// Load local packages
import UserReferralController from "../controllers/UserReferral.controller";

// Create instance of the "ReferralController" class to read the methods/functions from the same.
const userReferralController = new UserReferralController();

// Route to hold the routes (CRUD, etc) related to "Referral" table
const EmpReferralRouter = Router();

// Get the referral based on the provided query parameter
// EmpReferralRouter.get("/:id", ReferralController.getByGSI1PKAndStatus);

// Get the referral based on the provided query parameter
EmpReferralRouter.get("/referral/:emailId", userReferralController.getReferralsForEmp);

// Allow Employee to take apprpiate action on the referral and change the status accordingly 
EmpReferralRouter.put("/referral/:referralId/action", userReferralController.updateReferralStatusByEmp);

export default EmpReferralRouter;
