// Import the express module
import { Router } from "express"; 

// Import the CompanyJobController from the CompanyJob.controller module
import CompanyJobController from "../controllers/CompanyJob.controller"; 

// Create a new instance of the CompanyJobController
const companyJobController = new CompanyJobController();

// Create a new Router instance
const CompanyJobRouter = Router(); 

/** 
 * This moudule is used to define the routes for the company jobs managed by Admin.
 */

//Fetch all Jobs
CompanyJobRouter.get("/", companyJobController.getAllJobs);

// Define a POST route for Creating a new job
CompanyJobRouter.post("/", companyJobController.createJob);

// Fetch Jobs By JobId
CompanyJobRouter.get("/:jobId", companyJobController.getJobById);

// Update the job By Id
CompanyJobRouter.put("/:jobId", companyJobController.updateJobById);

// Delete the job By Id
CompanyJobRouter.put("/:jobId/delete", companyJobController.deleteJobById);

// Export the CompanyJobRouter so it can be used in other parts of the application
export default CompanyJobRouter;