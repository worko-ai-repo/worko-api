// Load the npm packages
import { Router } from "express";

// Load local packages
import UserExperienceController from "../controllers/UserExperience.controller";

// Create instance of the "UserExperienceController" class to read the methods/functions from the same.
const userExperienceController = new UserExperienceController();

// Route to hold the routes (CRUD, etc) related to "UserExperience" table
const UserExperienceRouter = Router();

// Get the user detail based on the provided query parameter
UserExperienceRouter.get(
  "/:id/experience",
  userExperienceController.getByEmail
);

UserExperienceRouter.post("/:id/experience", userExperienceController.create);

export default UserExperienceRouter;
