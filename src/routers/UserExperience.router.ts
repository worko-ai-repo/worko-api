// Load the npm packages
import { Router } from "express";

// Load local packages
import UserExperienceController from "../controllers/UserExperience.controller";

// Create instance of the "UserExperienceController" class to read the methods/functions from the same.
const userExperienceController = new UserExperienceController();

// Route to hold the routes (CRUD, etc) related to "UserExperience" table
const UserExperienceRouter = Router();

/**
 * Get the user detail based on the provided query parameter
 * 
 * @authorisedRoles 
 */
UserExperienceRouter.get("/:id/experience", userExperienceController.getByEmail);

/**
 * create the user Experience details based on the provided query parameter
 * 
 * @authorisedRoles 
 */
UserExperienceRouter.post("/:id/experience", userExperienceController.create);

/**
 * Route to send OTP to user's work email address to verify the same.
 * 
 * @authorisedRoles 
 */
UserExperienceRouter.get("/:primaryEmail/experience/:id/request-otp", userExperienceController.sendOtptoVerifyUserWorkEmail)

/**
 * Route to verify OTP sent to user's work email address.
 * 
 * @authorisedRoles 
 */
UserExperienceRouter.post("/:primaryEmail/experience/:id/verify-otp", userExperienceController.verifyWorkEmail)

/**
 * Update the user Detail details based on the provided query parameter
 * 
 * @authorisedRoles ["loggedInUser"]
 */
UserExperienceRouter.patch("/:email/experience", userExperienceController.updateUserExperienceByEmail);

export default UserExperienceRouter;
