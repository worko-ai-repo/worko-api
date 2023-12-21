// Load the npm packages
import { Router } from "express";

// Load local packages
import MasterServiceController from "../controllers/MasterService.controller";

// Create instance of the "MasterServiceController" class to read the methods/functions from the same.
const masterServiceController = new MasterServiceController();

// Route to hold the routes (CRUD, etc) related to "MasterService" table
const MasterServiceRouter = Router();

// create master Service plan [Admin]
MasterServiceRouter.post("/", masterServiceController.createMasterService);

// get master Service plan [ui]
MasterServiceRouter.get("/", masterServiceController.getMasterService);

export default MasterServiceRouter;
