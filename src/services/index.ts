// Load the npm packages
import { Router } from "express";

// Load local packages
import CandidateServiceRouter from "./candidate";

// Router that contains all the routes/endpoints in the application
const router = Router();

// Register the "Admin Service" routes

// Register the "Auth Service" routes

// Register the "Candidate Service" routes
router.use("/candidate", CandidateServiceRouter);

// Register the "Employee Service" routes

// Export the router
export default router;