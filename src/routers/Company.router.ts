// Load the npm packages
import { Router } from "express";

// Load local packages
import CompanyController from "../controllers/Company.controller";

// Create instance of the "CompanyController" class to read the methods/functions from the same.
const companyController = new CompanyController();

// Route to hold the routes (CRUD, etc) related to "company" table
const CompanyRouter = Router();

/**
 * Get company details by id
 * 
 * @authorisedRoles ["public"]
 */
CompanyRouter.get("/:companyId", companyController.getCompanyDetailById);

/**
 * Create company based on the provided query parameter by admin
 * 
 * @authorisedRoles ["admin"]
 */
CompanyRouter.post("/", companyController.createCompany);

/**
 * Update company based on the provided query parameter by admin
 * 
 * @authorisedRoles ["admin"]
 */
CompanyRouter.put("/:id", companyController.updateCompany);

/**
 * Update company logo
 * 
 * @authorisedRoles ["admin"]
 */
CompanyRouter.patch("/:id/company-logo", companyController.updateCompanyLogo);

/**
 * Create a company request based on the provided query parameter by user
 * 
 * @authorisedRoles ["loggedInUser"]
 */
CompanyRouter.post("/request", companyController.requestCompany);

/**
 * Get the requested company list for admin
 * 
 * @authorisedRoles ["admin"]
 */
CompanyRouter.get("/request/list", companyController.getRequestedCompanyList);

/**
 * Get all company names
 * 
 * @authorisedRoles ["public"]
 */
CompanyRouter.get("/all", companyController.getAllCompanyNames);

/**
 * Get the company details list
 * 
 * @authorisedRoles ["public"]
 */
CompanyRouter.get("/", companyController.getCompanyList);

// removed below route because we can use above CompanyRouter.get("/", companyController.getCompanyList); route for search filter by company name by hitting api:- http://localhost:3000/local/company/?companyName=go
// CompanyRouter.get("/:beginsWith", companyController.getByBeginsWith);

/**
 * Delete company by id by 
 * 
 * NOTE: In this API, we are not deleting the data from the
 * datbase, we are only updating the `isDeleted` field to true,
 * because some data are used as a reference in other tables.
 * 
 * @authorisedRoles ["admin"]
 */
CompanyRouter.delete("/:id", companyController.softDeleteCompanyById);

/**
 * Delete a company request by company id
 * 
 * NOTE: In this API, we are not deleting the data from the
 * datbase, we are only updating the `isDeleted` field to true,
 * because some data are used as a reference in other tables.
 * 
 * @authorisedRoles ["admin"]
 */
CompanyRouter.delete("/:id/request", companyController.softDeleteCompanyRequestByCompanyId);

// Export the "CompanyRouter"
export default CompanyRouter;