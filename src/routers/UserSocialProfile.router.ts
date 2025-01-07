// Load the npm packages
import { Router } from "express";

// Load local packages
import UserSocialProfileController from "../controllers/UserSocialProfile.controller";

// Create instance of the "UserSocialProfileController" class to read the methods/functions from the same.
const userSocialProfileController = new UserSocialProfileController();

// Route to hold the routes (CRUD, etc) related to "UserSocialProfile" table
const UserSocialProfileRouter = Router();

/**
 * Get the user SocialProfile details based on the provided query parameter
 * 
 * @authorisedRoles 
 */
UserSocialProfileRouter.get(
  "/:id/socialprofile",
  userSocialProfileController.get
);

/**
 * create/update the user SocialProfile details based on the provided query parameter
 * 
 * @authorisedRoles 
 */
UserSocialProfileRouter.post(
  "/:id/socialprofile",
  userSocialProfileController.create
);

export default UserSocialProfileRouter;
