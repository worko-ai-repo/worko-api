// Load the npm packages
import { Router } from "express";

// Load local packages
import CandidateRouter from "./routers/Candidate.router";

// Router that contains all the routes/endpoints in the application
const router = Router();

// Regitser the "Candidate" routers
router.use("/candidate", CandidateRouter);

// Export the router
export default router;