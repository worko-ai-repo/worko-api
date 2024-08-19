// Import the necessary npm packages
import { Router } from "express";

// Import the controllers
import CompanyController from "../controllers/Company.controller";

// Create an instance of CompanyController
const companyControllerObj = new CompanyController();

// Create a new Router instance for handling company routes
const CompanyRouter = Router();

// Route to get company details by company id
CompanyRouter.get("/:companyId", companyControllerObj.getCompanyDetailById);

// Export the CompanyRouter
export default CompanyRouter;
