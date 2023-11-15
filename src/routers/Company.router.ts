// Load the npm packages
import { Router } from "express";
import CompanyController from "../controllers/Company.controller";

// Create instance of the "CandidateController" class to read the methods/functions from the same.
const candidateController = new CompanyController();

// Route to hold the routes (CRUD, etc) related to "candidate" table
const CompanyRouter = Router();

// Get the candidates based on the provided query parameter
// CompanyRouter.get("/", candidateController.getCandidates);

// Create candidates based on the provided query parameter
CompanyRouter.post("/create", candidateController.createCompany);
CompanyRouter.get("/list", candidateController.getCompanyList);

// Export the "CandidateRouter"
export default CompanyRouter;
