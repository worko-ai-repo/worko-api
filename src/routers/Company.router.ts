// Load the npm packages
import { Router } from "express";
import CompanyController from "../controllers/Company.controller";

// Create instance of the "CompanyController" class to read the methods/functions from the same.
const companyController = new CompanyController();

// Route to hold the routes (CRUD, etc) related to "company" table
const CompanyRouter = Router();

// Create candidates based on the provided query parameter
CompanyRouter.post("/create", companyController.createCompany);
CompanyRouter.post("/add", companyController.AddCompany);
CompanyRouter.get("/new", companyController.getRequestedCompanyList);
CompanyRouter.get("/list", companyController.getCompanyList);

// Export the "CompanyRouter"
export default CompanyRouter;
