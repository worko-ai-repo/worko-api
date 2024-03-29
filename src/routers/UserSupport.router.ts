// Load the npm packages
import { Router } from "express";

// Load local packages
import UserSupportController from "../controllers/UserSupport.controller";

// Create instance of the "UserSupportController" class to read the methods/functions from the same.
const userSupportController = new UserSupportController();

// Route to hold the routes (CRUD, etc) related to "UserSupport" table
const UserSupportRouter = Router();

// Create support 
UserSupportRouter.post("/support", userSupportController.createSupport);

// Get all support details raised by user 
UserSupportRouter.get("/support", userSupportController.getUserSupportList);

// Get support details for mention supportId 
UserSupportRouter.get("/support/:supportId", userSupportController.getSupportById);

// Updates support for mention supportId 
UserSupportRouter.put("/support/:supportId", userSupportController.updateSupportById);


export default UserSupportRouter;