// Import the necessary npm packages
import { Router } from "express";

// Import the routers
import CompanyRouter from "./routers/Company.router";
import UserRouter from "./routers/User.router";
import UserReferralRouter from "./routers/UserReferral.router";
import UserSubscriptionRouter from "./routers/UserSubscription.router";
import UserSupportRouter from "./routers/UserSupport.router";
import CompanyJobRouter from "./routers/CompanyJob.router";

// Create a new Router instance
const AdminRouter = Router();

// Define the route for company details 
AdminRouter.use("/company", CompanyRouter);

// Import the CompanyJobRouter
AdminRouter.use("/jobs", CompanyJobRouter);

// Define the route for User details
AdminRouter.use("/user", UserRouter);

// Define the route for user referral details
AdminRouter.use("/referral", UserReferralRouter);

// Define the route for getting user bought subscriptions
AdminRouter.use("/subscription", UserSubscriptionRouter);

// Define the route for users support raise request
AdminRouter.use("/support", UserSupportRouter);

// Export the AdminRouter
export default AdminRouter;