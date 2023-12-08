// Load the npm packages
import { Router } from "express";

// Load local packages
import CandidateRouter from "./routers/Candidate.router";
import CompanyRouter from "./routers/Company.router";
import UserRouter from "./routers/User.router";
import UserReferralRouter from "./routers/UserReferral.router";
import UserSubscriptionRouter from "./routers/UserSubscription.router";
import FileRouter from "./routers/File.router";

// Router that contains all the routes/endpoints in the application
const router = Router();

// Regitser the "Candidate" routers
router.use("/candidate", CandidateRouter);

// Regitser the "Company" routers
router.use("/company", CompanyRouter);

// Regitser the "User CRUD" routers
router.use("/user", UserRouter);

// Regitser the "User Referral" routers
router.use("/user", UserReferralRouter);

// Regitser the "User Subscription" routers
router.use("/user", UserSubscriptionRouter);

// Regitser the "File" router
router.use("/file", FileRouter);

// Export the router
export default router;
