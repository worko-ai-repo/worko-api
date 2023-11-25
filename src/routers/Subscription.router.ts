// Load the npm packages
import { Router } from "express";
import SubscriptionController from "../controllers/Subscription.controller";

// Create instance of the "SubscriptionController" class to read the methods/functions from the same.
const subcriptionController = new SubscriptionController();

// Route to hold the routes (CRUD, etc) related to "subscription" table
const SubscriptionRouter = Router();

SubscriptionRouter.post("/add/:email", subcriptionController.addSubscription);
// SubscriptionRouter.get("/list", subcriptionController.getSubcriptionList);

export default SubscriptionRouter;
