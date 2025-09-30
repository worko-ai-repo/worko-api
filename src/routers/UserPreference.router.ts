
import { Router } from "express";

import UserPreferenceController from "../controllers/UserPreference.controller";

const userPreferenceController: UserPreferenceController = new UserPreferenceController();

const UserPreferenceRouter: Router = Router();

/**
 * create or update the user preference details
 * 
 * This api is used to create if the user preference doesn't exist or update if the user preference exists
 * 
 * @authorisedRoles ["loggedInUser"] 
 */
UserPreferenceRouter.post("/preference", userPreferenceController.createOrUpdateUserPreference);

/**
 * update the user preference details
 * 
 * @authorisedRoles ["loggedInUser"] 
 */
UserPreferenceRouter.get("/:email/preference", userPreferenceController.getUserPreferenceByEmail);

export default UserPreferenceRouter;