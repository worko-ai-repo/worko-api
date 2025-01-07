// Load the npm packages
import { Router } from "express";

// Load local packages
import UserAvailabilityController from "../controllers/UserAvailability.controller";

// Create instance of the "UserAvailabilityController" class to read the methods/functions from the same.
const userAvailabilityController = new UserAvailabilityController();

// Route to hold the routes (CRUD, etc) related to "UserAvailability" table
const UserAvailabilityRouter = Router();

/**
 * Get the user Availability details based on the provided query parameter
 * 
 * @authorisedRoles ["admin"]
 */
UserAvailabilityRouter.get("/:id/availability", userAvailabilityController.get);

/**
 * create the user Availability details based on the provided query paramete
 * 
 * @authorisedRoles ["admin"]
 */
UserAvailabilityRouter.post(
  "/:id/availability",
  userAvailabilityController.create
);

/**
 * update the user Availability details based on the provided query paramete
 * 
 * @authorisedRoles ["admin"]
 */
UserAvailabilityRouter.put(
  "/:id/availability",
  userAvailabilityController.update
);

export default UserAvailabilityRouter;
