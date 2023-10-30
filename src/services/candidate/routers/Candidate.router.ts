// Load the npm packages
import { Router } from "express";

// Load local packages
import CandidateController from "../controllers/Candidate.controller";

// Create instance of the "CandidateController" class to read the methods/functions from the same.
const candidateController = new CandidateController();

// Route to hold the routes (CRUD, etc) related to "candidate" table
const CandidateRouter = Router();

// Get the candidates based on the provided query parameter
CandidateRouter.get("/", candidateController.getCandidates);

// Export the "CandidateRouter"
export default CandidateRouter;