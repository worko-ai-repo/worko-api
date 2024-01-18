// Load the npm packages
import { Router } from "express";

// Load local packages
import UserProvidedServiceController from "../controllers/UserProvidedService.controller";

// Create instance of the "UserProvidedServiceController" class to read the methods/functions from the same.
const userProvidedServiceController = new UserProvidedServiceController();

// Route to hold the routes (CRUD, etc) related to "UserProvidedService" table
const UserProvidedServiceRouter = Router();

// Get the user ProvidedService details based on the provided query parameter
UserProvidedServiceRouter.get(
  "/:id/providedService",
  userProvidedServiceController.get
);

// create/update the user ProvidedService details based on the provided query parameter
UserProvidedServiceRouter.post(
  "/:id/providedService",
  userProvidedServiceController.create
);

export default UserProvidedServiceRouter;
