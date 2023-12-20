// Load the npm packages
import { Router } from "express";

// Load local packages
import UserServiceController from "../controllers/UserService.controller";

// Create instance of the "UserServiceController" class to read the methods/functions from the same.
const userServiceController = new UserServiceController();

// Route to hold the routes (CRUD, etc) related to "userService" table
const UserServiceRouter = Router();

// Create Service based on the provided query parameter
UserServiceRouter.post(
  "/:emailAddress/service",
  userServiceController.requestService
);

UserServiceRouter.post(
  "/:emailAddress/service/interview",
  userServiceController.requestServiceInterviewGuidance
);

UserServiceRouter.get(
  "/:emailAddress/service/:serviceId",
  userServiceController.getServiceStatus
);

export default UserServiceRouter;
