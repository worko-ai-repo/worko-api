// Import the express module
import { Router } from "express"; 

// Import the CompanyJobController from the CompanyJob.controller module
import CompanyJobController from "../admin/controllers/CompanyJob.controller"; 

// Create a new instance of the CompanyJobController
const companyJobController = new CompanyJobController();

// Create a new Router instance
const CompanyJobRouter = Router(); 

/** 
 * This moudule is used to define the routes for the company jobs managed by Admin.
 */

//Fetch all Jobs
CompanyJobRouter.get("", companyJobController.getAllJobs);

// Fetch Jobs By JobId
CompanyJobRouter.get("/:jobId", companyJobController.getJobById);

// Export the CompanyJobRouter so it can be used in other parts of the application
export default CompanyJobRouter;