// Load the npm packages
import { Router } from "express";
import ScriptController from "../controllers/Script.controller";

// Create Router
const ScriptRouter = Router();

// Initialize the ScriptController
const scriptController = new ScriptController();

// TODO: After executing the script/API in DEV and PROD environments,
// these routes should be commented out to prevent unintended execution.

/**
 * Endpoint to update all user subscriptions
 * 
 * @authorisedRoles ["admin"]
 */
ScriptRouter.post("/update-user-subscriptions", scriptController.updateUserSubscriptionsGSIs);

/**
 * Endpoint to update the all user Referrals jd matching error code
 * 
 * @authorisedRoles ["admin"]
 */
ScriptRouter.post("/update-user-referrals", scriptController.updateUserReferralsJdMatchErrorCode);

/**
 * Endpoint to update all users name and `email` present in the `PK` to lowercase
 * 
 * @authorisedRoles ["admin"]
 */
ScriptRouter.post("/update-users-to-lowercase",scriptController.scriptUpdateUsersToLowerCase);

/**
 * Endpoint to update email present in the `PK` to lowercase
 * 
 * @authorisedRoles ["admin"]
 */
ScriptRouter.post("/update-emails-to-lowercase/:oldEmail/:newEmail", scriptController.scriptUpdatePkEmailToLowerCase );

/**
 * Endpoint to update SK for `CorporateUser` model 
 * 
 * @authorisedRoles ["admin"]
 */
ScriptRouter.post("/update-sks-Gsi1Pk-corporate-users", scriptController.scriptUpdateSkForCorporateUsers);

/**
 * Endpoint to update SK for `CorporateUserInvite` model 
 * 
 * @authorisedRoles ["admin"]
 */
ScriptRouter.post("/update-sks-corporate-user-invite", scriptController.scriptUpdateSKForCorporateUserInvite);

/**
 * Endpoint to update jd extracted to string data type
 * 
 * @authorisedRoles ["admin"]
 */
ScriptRouter.post("/update-jd-extracted-to-string-data-type",scriptController.scriptUpdatejdExtractedToStringDataType);

// Endpoint to update all user experiences
// ScriptRouter.post("/update-user-experiences", scriptController.updateUserExperiencesGSIs);

// Endpoint to update registered user gsi two
ScriptRouter.post("/update-registered-user-gsi-two", scriptController.scripToUpdateRegisteredUserGsiTwo);

// Endpoint to retry update registered user gsi two
ScriptRouter.post("/retry-update-registered-user-gsi-two", scriptController.scripToRetryUpdateRegisteredUserGsiTwo);

ScriptRouter.post("/send-sms-to-user", scriptController.scriptToSendSmsToUser);

export default ScriptRouter;
