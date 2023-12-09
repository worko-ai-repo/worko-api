// Load the npm packages
import { Router } from "express";

// Load local packages
import UserController from "../controllers/User.controller";

// Create instance of the "UserController" class to read the methods/functions from the same.
const userController = new UserController();

// Route to hold the routes (CRUD, etc) related to "user" table
const UserRouter = Router();

// Create Candidate based on the provided query parameter
UserRouter.post("/register/candidate", userController.createCandidate);

// Create employee based on the provided query parameter
UserRouter.post("/register/employee", userController.createEmployee);

// Get the user based on the provided query parameter
UserRouter.get("/:id", userController.getUserById);

//Update the verification status of user email based on the provided query parameter
UserRouter.patch("/verify/:id", userController.updateEmailVerifyStatus);

//Update the cv of user based on the provided query parameter
// @todo change this to "/:id" and it should update any UserDetail SK fields along with CV/resume.
UserRouter.patch("/cv/:id", userController.updateUserResume);

export default UserRouter;
