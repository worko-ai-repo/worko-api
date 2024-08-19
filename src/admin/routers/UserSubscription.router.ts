// Load npm package
import { Router } from "express";

// Load controllers
import UserSubscriptionController from "../controllers/UserSubscription.controller";

// Create an instance of UserSubscriptionController
const userSubscriptionControllerObj = new UserSubscriptionController();

// Define UserSubscriptionRouter using Express Router
const UserSubscriptionRouter = Router();

// retrieve all users subscriptions and status is optional
UserSubscriptionRouter.get("/", userSubscriptionControllerObj.getAllUsersSubscriptions);

// retrieve user subscription by the subscription id
UserSubscriptionRouter.get("/:id", userSubscriptionControllerObj.getSubscriptionDetailById);

// Export the UserSubscriptionRouter for use in other modules
export default UserSubscriptionRouter;