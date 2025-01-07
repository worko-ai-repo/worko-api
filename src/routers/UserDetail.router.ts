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

export default UserDetailRouter;
