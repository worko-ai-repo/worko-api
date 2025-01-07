// Load the npm packages
import { Router } from "express";

// Load local packages
import UserSkillController from "../controllers/UserSkill.controller";

// Create instance of the "UserSkillController" class to read the methods/functions from the same.
const userSkillController = new UserSkillController();

// Route to hold the routes (CRUD, etc) related to "UserSkill" table
const UserSkillRouter = Router();

/**
 * Get the user Skill details based on the provided query parameter
 * 
 * @authorisedRoles 
 */
UserSkillRouter.get("/:id/Skill", userSkillController.get);

/**
 * create/update the user Skill details based on the provided query parameter
 * 
 * @authorisedRoles 
 */
UserSkillRouter.post("/:id/Skill", userSkillController.create);

export default UserSkillRouter;
