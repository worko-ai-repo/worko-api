// Load the npm packages
import { Router } from "express";

// Load local packages
import MasterSubscriptionController from "../controllers/MasterSubscription.controller";

// Create instance of the "UserSubscriptionController" class to read the methods/functions from the same.
const masterSubscriptionController = new MasterSubscriptionController();

// Route to hold the routes (CRUD, etc) related to "MasterSubscription" table
const MasterSubscriptionRouter = Router();

export default MasterSubscriptionRouter;
