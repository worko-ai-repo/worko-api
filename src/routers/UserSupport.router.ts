// Load the npm packages
import { Router } from "express";

// Load local packages
import UserSupportController from "../controllers/UserSupport.controller";

// Create instance of the "UserSupportController" class to read the methods/functions from the same.
const userSupportController = new UserSupportController();

// Route to hold the routes (CRUD, etc) related to "UserSupport" table
const UserSupportRouter = Router();

/**
 * Create support router , "/" is the base url acutal will be (api/support/)
 * 
 * @authorisedRoles 
 */
UserSupportRouter.post("/", userSupportController.createSupport);
 
/**
 * Get all support details raised by user
 * 
 * @authorisedRoles 
 */
UserSupportRouter.get("/", userSupportController.getUserSupportList);

/**
 * Get support details for mention supportId 
 * 
 * @authorisedRoles 
 */
UserSupportRouter.get("/:supportId", userSupportController.getSupportById);

/**
 * Updates support for mention supportId 
 * 
 * @authorisedRoles 
 */
UserSupportRouter.put("/:supportId", userSupportController.updateSupportById);

export default UserSupportRouter;