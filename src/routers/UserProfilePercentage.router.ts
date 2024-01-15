// Load the npm packages
import { Router } from "express";

// Load local packages
import UserProfilePercentageController from "../controllers/UserProfilePercentage.controller";

// Create instance of the "UserProfilePercentageController" class to read the methods/functions from the same.
const userProfilePercentageController = new UserProfilePercentageController();

// Route to hold the routes (CRUD, etc) related to "UserProfilePercentage" table
const UserProfilePercentageRouter = Router();

// Get the user ProfilePercentage details
UserProfilePercentageRouter.get(
  "/:id/profilePercentage",
  userProfilePercentageController.get
);

// Get the user ProfilePercentage details
UserProfilePercentageRouter.get(
  "/:id/profilePercentage/group",
  userProfilePercentageController.getByGroup
);

// create the user ProfilePercentage details based on the provided query parameter
UserProfilePercentageRouter.post(
  "/:id/profilePercentage",
  userProfilePercentageController.create
);

export default UserProfilePercentageRouter;
