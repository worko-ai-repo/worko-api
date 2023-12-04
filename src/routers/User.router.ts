// Load the npm packages
import { Router } from "express";

// Load local packages
import UserController from "../controllers/User.controller";

// Create instance of the "UserController" class to read the methods/functions from the same.
const userController = new UserController();

// Route to hold the routes (CRUD, etc) related to "user" table
const UserRouter = Router();

// Create user based on the provided query parameter
UserRouter.post("/signup", userController.createUser);

// Get the user based on the provided query parameter
UserRouter.get("/:id", userController.getUserById);

// UserRouter.put("/:id",userController.updateUser);

// UserRouter.delete("/:id",userController.deleteUser);

// UserRouter.get("/",userController.getUser);

export default UserRouter;
