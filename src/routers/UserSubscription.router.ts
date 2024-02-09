// Load the npm packages
import { Router } from "express";

// Load local packages
import UserSubscriptionController from "../controllers/UserSubscription.controller";

// Create instance of the "UserSubscriptionController" class to read the methods/functions from the same.
const userSubscriptionController = new UserSubscriptionController();

// Route to hold the routes (CRUD, etc) related to "userSubscription" table
const UserSubscriptionRouter = Router();

// Create subscription for user
UserSubscriptionRouter.post("/:id/subscription", userSubscriptionController.create
);

// Get the user subscription details based on the provided query parameter
UserSubscriptionRouter.get("/:id/subscription", userSubscriptionController.get);

// Get the user subscription Status based on the provided query parameter
UserSubscriptionRouter.get("/:id/subscription/status",userSubscriptionController.getStatus
);

export default UserSubscriptionRouter;
