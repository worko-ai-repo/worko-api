// Load the npm packages
import { Router } from "express";

// Load local packages
import UserEmailController from "../controllers/UserEmail.controller";

// Create instance of the "UserEmailController" class to read the methods/functions from the same.
const userEmailController = new UserEmailController();

// Route to hold the routes (CRUD, etc) related to "UserEmail" table
const UserEmailRouter = Router();

// Get the user detail based on the provided query parameter
UserEmailRouter.get("/:id/emails", userEmailController.getByEmail);

export default UserEmailRouter;
