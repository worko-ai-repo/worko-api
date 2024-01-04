// Load the npm packages
import { Router } from "express";

// Load local packages
import UserAchievementController from "../controllers/UserAchievement.controller";

// Create instance of the "UserAchievementController" class to read the methods/functions from the same.
const userAchievementController = new UserAchievementController();

// Route to hold the routes (CRUD, etc) related to "UserAchievement" table
const UserAchievementRouter = Router();

// Get the user Achievement details based on the provided query parameter
UserAchievementRouter.get("/:id/achievement", userAchievementController.get);

// create/update the user Achievement details based on the provided query parameter
UserAchievementRouter.post(
  "/:id/achievement",
  userAchievementController.create
);

export default UserAchievementRouter;
