// Load the npm packages
import { Router } from "express";

// Load local packages
import CandidateRouter from "./routers/Candidate.router";

// Router to hold all the routes from the "Candidate Service"
const CandidateServiceRouter = Router();

// Register the "CandidateRouter" routes
CandidateServiceRouter.use("/candidate", CandidateRouter)
// CandidateServiceRouter.use("/class2", class2)
// CandidateServiceRouter.use("/class3", class3)
// CandidateServiceRouter.use("/class4", class4)

// Export the "CandidateServiceRouter"
export default CandidateServiceRouter;