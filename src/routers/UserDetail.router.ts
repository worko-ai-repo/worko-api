// Load the npm packages
import { Router } from "express";

// Load local packages
import UserDetailController from "../controllers/UserDetail.controller";

// Create instance of the "UserDetailController" class to read the methods/functions from the same.
const userDetailController = new UserDetailController();

// Route to hold the routes (CRUD, etc) related to "UserDetail" table
const UserDetailRouter = Router();

// Get the user detail based on the provided query parameter
UserDetailRouter.get("/:id/details", userDetailController.getByEmail);

// create/update the user Detail details based on the provided query parameter
UserDetailRouter.put("/:id/details", userDetailController.update);

export default UserDetailRouter;
