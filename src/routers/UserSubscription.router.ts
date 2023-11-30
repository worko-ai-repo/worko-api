// Load the npm packages
import { Router } from "express";

// Load local packages
import UserSubscriptionController from "../controllers/UserSubscription.controller";

// Create instance of the "UserSubscriptionController" class to read the methods/functions from the same.
const userSubscriptionController = new UserSubscriptionController();

// Route to hold the routes (CRUD, etc) related to "userSubscription" table
const UserSubscriptionRouter = Router();

// Create subscription for user
UserSubscriptionRouter.post(
  "/subscription/:id",
  userSubscriptionController.creatSubscription
);

// Get the user subscription details based on the provided query parameter
UserSubscriptionRouter.get(
  "/subscription/:id",
  userSubscriptionController.getSubscriptionDetailsById
);

export default UserSubscriptionRouter;
