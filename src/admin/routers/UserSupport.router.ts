// Load the npm packages
import { Router } from "express";

// Load controllers
import UserSupportController from "../controllers/UserSupport.controller";

// Create instance of the "UserSupportController" class to read the methods/functions from the same.
const userSupportControllerObj = new UserSupportController();

// Route to hold the routes (CRUD, etc)
const UserSupportRouter = Router();

// Get all support details raised by user and filter options are used
UserSupportRouter.get("/", userSupportControllerObj.getSupportRequests);

// Get support details for mention supportId
UserSupportRouter.get("/:supportId", userSupportControllerObj.getSupportRequestById);

// export the UserSupportRouter
export default UserSupportRouter;
