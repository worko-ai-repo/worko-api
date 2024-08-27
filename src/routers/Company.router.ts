// Load the npm packages
import { Router } from "express";

// Load local packages
import CompanyController from "../controllers/Company.controller";

// Create instance of the "CompanyController" class to read the methods/functions from the same.
const companyController = new CompanyController();

// Route to hold the routes (CRUD, etc) related to "company" table
const CompanyRouter = Router();

// Get company details by id
CompanyRouter.get("/:companyId", companyController.getCompanyDetailById);

// Create company based on the provided query parameter by admin
// @todo change this to "/", this should help.
CompanyRouter.post("/", companyController.createCompany);
// Update company based on the provided query parameter by admin
CompanyRouter.put("/:id", companyController.updateCompany);
// Create a company request based on the provided query parameter by user
// @todo change this to "/request", this should help.
CompanyRouter.post("/request", companyController.requestCompany);

// Get the requested company list for admin
// @todo change this to "/request", this should help.
CompanyRouter.get("/request", companyController.getRequestedCompanyList);

CompanyRouter.get("/all", companyController.getAllCompanyNames);

// Get the company details list
// @todo here we should not use "list", we can just have "/" and it should be helpful and consistent without naming convenstions/syntax.
CompanyRouter.get("/", companyController.getCompanyList);

// removed below route because we can use above CompanyRouter.get("/", companyController.getCompanyList); route for search filter by company name by hitting api:- http://localhost:3000/local/company/?companyName=go
// CompanyRouter.get("/:beginsWith", companyController.getByBeginsWith);

// Export the "CompanyRouter"
export default CompanyRouter;