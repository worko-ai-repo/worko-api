// Load the npm packages
import { Router } from "express";

// Load local packages
import UserServiceController from "../controllers/UserService.controller";

// Create instance of the "UserServiceController" class to read the methods/functions from the same.
const userServiceController = new UserServiceController();

// Route to hold the routes (CRUD, etc) related to "userService" table
const UserServiceRouter = Router();

/**
 * Get the user Service details
 * 
 * @authorisedRoles 
 */
UserServiceRouter.get("/:emailAddress/service", userServiceController.get);

/**
 * Create Service based on the provided query parameter
 * 
 * @authorisedRoles 
 */
UserServiceRouter.post("/:emailAddress/service",userServiceController.requestService
);

/**
 * Create Service based on the provided query parameter
 * 
 * @authorisedRoles 
 */
UserServiceRouter.post("/:emailAddress/service/interview", userServiceController.requestServiceInterviewGuidance
);

/**
 * Get the user Service details
 * 
 * @authorisedRoles 
 */
UserServiceRouter.get("/:emailAddress/service/:serviceId",userServiceController.getServiceStatus
);

/**
 * Update the user Service details
 * 
 * @authorisedRoles 
 */
UserServiceRouter.patch("/:emailAddress/service/:serviceId/:status",userServiceController.updateStatus
);

export default UserServiceRouter;
