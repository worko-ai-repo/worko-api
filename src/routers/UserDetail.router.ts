// Load the npm packages
import { Router } from "express";

// Load local packages
import UserDetailController from "../controllers/UserDetail.controller";

// Create instance of the "UserDetailController" class to read the methods/functions from the same.
const userDetailController = new UserDetailController();

// Route to hold the routes (CRUD, etc) related to "UserDetail" table
const UserDetailRouter = Router();
 
/**
 * Get the user detail based on the id(emailAddress) provided query parameter
 * 
 * @authorisedRoles 
 */
UserDetailRouter.get("/:id/details", userDetailController.getByEmail);

/**
 * Get the user detail based on the provided userId query parameter
 * @todo Replace 'detail' with 'details' once this api is completly integrated in UI 
 * once Integrated remove the previous API
 * 
 * @authorisedRoles 
 */
UserDetailRouter.get("/:userId/detail", userDetailController.getUserById);

/**
 * create/update the user Detail details based on the provided query parameter
 * 
 * @authorisedRoles 
 */
UserDetailRouter.put("/:id/details", userDetailController.update);

/**
 * Update the user Detail details based on the provided query parameter
 * 
 * @authorisedRoles ["loggedInUser"]
 */
UserDetailRouter.patch("/:email/details", userDetailController.updateUserDetailByEmail);

/**
 * @authorisedRoles ["loggedInUser"]
 */
UserDetailRouter.get("/:email/request-otp", userDetailController.sendSmsOtptoVerifyUserPhoneNumber);

/**
 * Route to verify OTP sent to user's work email address.
 * 
 * @authorisedRoles ["loggedInUser"]
 */
UserDetailRouter.post("/:email/verify-otp", userDetailController.verifyUserPhoneNumber);

/**
 * @authorisedRoles ["loggedInUser"]
 * @description 
 *    1. whenever the agency submits a unregistered candidate for a job,
 *     if `corporate-recruiter/admin` or `worko-admin` moves the candidate to applicant then
 *     we are creating his account from backend with temporary password and the email,
 *     so that the candidate can login with temporary password and before that we will 
 *     send him the otp because the email in cognito stored as "Force Change Password" and Unverified email.
 */
UserDetailRouter.post("/request-otp/force-change-password", userDetailController.sendOtpForceChangePasswordViaEmail);

/**
 * @authorisedRoles ["loggedInUser"]
 */
UserDetailRouter.post("/verify-otp/force-change-password", userDetailController.verifyOtpForceChangePasswordViaEmail);

export default UserDetailRouter;
