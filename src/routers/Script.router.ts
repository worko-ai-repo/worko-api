// Load the npm packages
import { Router } from "express";
import ScriptController from "../controllers/Script.controller";

// Create Router
const ScriptRouter = Router();

// Initialize the ScriptController
const scriptController = new ScriptController();

// TODO: After executing the script/API in DEV and PROD environments,
// these routes should be commented out to prevent unintended execution.

// Endpoint to update all user subscriptions
ScriptRouter.post("/update-user-subscriptions", scriptController.updateUserSubscriptionsGSIs);

// Endpoint to update the all user Referrals jd matching error code
ScriptRouter.post("/update-user-referrals", scriptController.updateUserReferralsJdMatchErrorCode);

// Endpoint to update all users name and `email` present in the `PK` to lowercase
ScriptRouter.post("/update-users-to-lowercase",scriptController.scriptUpdateUsersToLowerCase);

// Endpoint to update all user experiences
// ScriptRouter.post("/update-user-experiences", scriptController.updateUserExperiencesGSIs);

export default ScriptRouter;
