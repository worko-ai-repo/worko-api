// Load the npm packages
import { Router } from "express";

// Load local packages
import CandidateRouter from "./routers/Candidate.router";
import CompanyRouter from "./routers/Company.router";
import SubscriptionRouter from "./routers/Subscription.router";
import UserRouter from "./routers/User.router";

// Router that contains all the routes/endpoints in the application
const router = Router();

// Regitser the "Candidate" routers
router.use("/candidate", CandidateRouter);

router.use("/company", CompanyRouter);

router.use("/subscription", SubscriptionRouter);

router.use("/user", UserRouter);
// Export the router
export default router;
