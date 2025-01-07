// Load the npm packages
import { Router } from "express";

// Load controllers
import UserJobApplicationController from "../controllers/UserJobApplication.controller";

// Create instance of the "UserJobApplicationController" class to read the methods/functions from the same.
const userJobApplicationController = new UserJobApplicationController();

// Route to hold the routes (CRUD, etc) related to "UserJobApplication" model
const UserJobApplicationRouter = Router();

/**
 * Create job application
 * @authorisedRoles [Candidate]
 */
UserJobApplicationRouter.post("/", userJobApplicationController.createJobApplication);

/**
 * Get matching Score for job application
 * @authorisedRoles [Candidate]
 */
UserJobApplicationRouter.get("/:id/score", userJobApplicationController.getJobApplicationScore);

/**
 * Get job application by id
 * @authorisedRoles [Candidate, CorporateRecruiter, CorporateAdmin]
 */
UserJobApplicationRouter.get("/:id", userJobApplicationController.getJobApplicationById);

/**
 * Get job applications by filter options 
 * @authorisedRoles [Candidate, CorporateUser, CorporateAdmin]
 */
UserJobApplicationRouter.get("/", userJobApplicationController.getJobApplicationsByFilterOptions);

/**
 * Update job application based on the provided parameters in route
 * @authorisedRoles [CorporateRecruiter, CorporateAdmin]
 */
UserJobApplicationRouter.patch("/:id/corp-action", userJobApplicationController.updateJobApplicationByCorpUser);

/**
 * Request feedback by candidate
 * @authorisedRoles [Candidate]
 */
UserJobApplicationRouter.patch("/:id/request-feedback", userJobApplicationController.updateJobApplicationRequestFeedback);

// Export the "UserJobApplicationRouter" router
export default UserJobApplicationRouter;