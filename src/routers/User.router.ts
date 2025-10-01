// Load the npm packages
import { Router } from "express";

// Load local packages
import UserController from "../controllers/User.controller";

// Create instance of the "UserController" class to read the methods/functions from the same.
const userController = new UserController();

// Route to hold the routes (CRUD, etc) related to "user" table
const UserRouter = Router();

/**
 * Create Candidate based on the provided query parameter
 * 
 * @authorisedRoles ["public"]
 */
UserRouter.post("/register/candidate", userController.createCandidate);

/**
 * Create employee based on the provided query parameter
 * 
 * @authorisedRoles ["public"]
 */
UserRouter.post("/register/employee", userController.createEmployee);

/**
 * @authorisedRoles ["loggedInUser"]
 */
UserRouter.post("/settings", userController.createUserDetailSetting);

/**
 * Get the user basic details
 * 
 * @authorisedRoles ["loggedInUser"]
 */
UserRouter.get("/basic-details", userController.getUserBasicDetails);

// Get the user based on the provided query parameter
// UserRouter.get("/:id", userController.getUserById);

/**
 * Get the user profile detail based on the provided query parameter
 * 
 * @authorisedRoles ["admin", "loggedInUser"]
 */
UserRouter.get("/:id/profile", userController.getUserProfileDetailById);

/**
 * API to update the User's Last Accessed Dashboard
 * 
 * @authorisedRoles ["admin", "loggedInUser"]
 */
UserRouter.put("/:id/updateLastAccessedDash", userController.updateLastAccessedDash);

/**
 * Update the verification status of user email based on the provided query parameter
 * 
 * @authorisedRoles ["admin", "loggedInUser"]
 */
UserRouter.patch("/:id/verify/email", userController.updateEmailVerifyStatus);

/**
 * Update the cv of user based on the provided query parameter
 * @todo change this to "/:id" and it should update any UserDetail SK fields along with CV/resume.
 * 
 * @authorisedRoles ["admin", "loggedInUser"]
 */
UserRouter.patch("/:id/cv", userController.updateUserResume);

/**
 * Parse the cv of user 
 * 
 * @authorisedRoles ["loggedInUser"]
 */
UserRouter.post("/parseCv", userController.parseCv);

/**
 * Right after user signs up we are partially extracting the CV details
 * so that the user will not wait for main CV extraction from the AI.
 * 
 * @authorisedRoles ["loggedInUser"]
 */
UserRouter.patch("/:registeredEmail/paritial-cv-extract-signup", userController.updatePartialCvExtractDetails);

export default UserRouter;
