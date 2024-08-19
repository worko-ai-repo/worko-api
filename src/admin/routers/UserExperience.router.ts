// Import the necessary npm packages
import { Router } from "express";

// Import the controllers
import UserExperienceController from "../controllers/UserExperience.controller";

// Create an instance of the UserExperienceController
const userExperienceControllerObj = new UserExperienceController();

// Create a new Router instance
const UserExperienceRouter = Router();

// In near future we will add more routes related to User Experience Details

// Export the UserExperienceRouter
export default UserExperienceRouter;