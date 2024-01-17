// Load the npm packages
import { Router } from "express";

// Load local packages
import UserBankDetailController from "../controllers/UserBankDetail.controller";

// Create instance of the "UserBankDetailController" class to read the methods/functions from the same.
const userBankDetailController = new UserBankDetailController();

// Route to hold the routes (CRUD, etc) related to "UserBankDetail" table
const UserBankDetailRouter = Router();

// Get the user BankDetail details based on the provided query parameter
UserBankDetailRouter.get("/:id/bankDetail", userBankDetailController.get);

// create/update the user BankDetail details based on the provided query parameter
UserBankDetailRouter.post("/:id/bankDetail", userBankDetailController.create);

export default UserBankDetailRouter;
