// Load the npm packages
import { Router } from "express";
import UserController from "../controllers/User.controller";

const userController = new UserController();

const UserRouter = Router();

UserRouter.get("/:email", userController.getUserByEmail);

UserRouter.get("/subs/:email", userController.getsubscriptionDetailsByEmail);

UserRouter.post("/signup/:email", userController.addNewUser);

UserRouter.post("/send/referral/:email", userController.newReferralRequest);

export default UserRouter;
