// Load the npm packages
import { Router } from "express";

// Load local packages
import UserCareerRequestController from "../controllers/UserCareerRequest.controller";

// Create an instance of the "UserCareerRequestController" class to read the methods/functions from the same.
const userCareerRequestController = new UserCareerRequestController();

// Route to hold the routes (CRUD, etc) related to "UserCareerRequest" table
const UserCareerRequestRouter = Router();

// Create career request router, "/" is the base URL, actually will be (api/career)
UserCareerRequestRouter.post("/", userCareerRequestController.createCareerRequest);

// Get all career request details raised by user
// Note : This API must be called by Admin only 
UserCareerRequestRouter.get("/", userCareerRequestController.getUserCareerRequestList);

// Get career request details for mentioned requestId
// Note : This API must be called by Admin only 
UserCareerRequestRouter.get("/:requestId", userCareerRequestController.getCareerRequestById);

// Update career request for mentioned requestId
// Note : This API must be called by Admin only 
UserCareerRequestRouter.post("/:requestId", userCareerRequestController.updateCareerRequestById);

export default UserCareerRequestRouter;
