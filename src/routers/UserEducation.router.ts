// Load the npm packages
import { Router } from "express";

// Load local packages
import UserEducationController from "../controllers/UserEducation.controller";

// Create instance of the "UserEducationController" class to read the methods/functions from the same.
const userEducationController = new UserEducationController();

// Route to hold the routes (CRUD, etc) related to "UserEducation" table
const UserEducationRouter = Router();

/**
 * Get the user Education details based on the provided query parameter
 * 
 * @authorisedRoles 
 */
UserEducationRouter.get("/:id/education", userEducationController.get);

/**
 * create/update the user Education details based on the provided query parameter
 * 
 * @authorisedRoles 
 */
UserEducationRouter.post("/:id/education", userEducationController.create);

/**
 * delete the user Education details based on the provided query parameter
 * 
 * @authorisedRoles 
 */
UserEducationRouter.delete("/:id/education/:entryId", userEducationController.delete);

export default UserEducationRouter;
