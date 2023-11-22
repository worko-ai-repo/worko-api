// Load the npm packages
import { Router } from "express";
import UserController from "../controllers/User.controller";

const userController = new UserController();

const UserRouter = Router();

UserRouter.post("/signup", userController.addNewUser);

UserRouter.get("/:email", userController.getUserByEmail);

export default UserRouter;
