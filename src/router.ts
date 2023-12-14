// Load the npm packages
import { Router } from "express";

// Load local packages
import CompanyRouter from "./routers/Company.router";
import UserRouter from "./routers/User.router";
import UserReferralRouter from "./routers/UserReferral.router";
import UserSubscriptionRouter from "./routers/UserSubscription.router";
import FileRouter from "./routers/File.router";
import MasterSubscriptionRouter from "./routers/MasterSubscription.router";

// Router that contains all the routes/endpoints in the application
const router = Router();

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

// Regitser the "Master Subscription" routers
router.use("/subscription", MasterSubscriptionRouter);

// Export the router
export default router;
