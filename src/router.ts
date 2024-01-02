// Load the npm packages
import { Router } from "express";

// Load local packages

//Company routers
import CompanyRouter from "./routers/Company.router";

//User routers
import UserRouter from "./routers/User.router";
import UserDetailRouter from "./routers/UserDetail.router";
import UserExperienceRouter from "./routers/UserExperience.router";
import UserEmailRouter from "./routers/UserEmail.router";
import UserSocialProfileRouter from "./routers/UserSocialProfile.router";
import UserReferralRouter from "./routers/UserReferral.router";
import UserSubscriptionRouter from "./routers/UserSubscription.router";
import UserServiceRouter from "./routers/UserService.router";

//File routers
import FileRouter from "./routers/File.router";

//Master routers
import MasterSubscriptionRouter from "./routers/MasterSubscription.router";
import MasterServiceRouter from "./routers/MasterService.router";

// Router that contains all the routes/endpoints in the application
const router = Router();

// Regitser the "Company" routers
router.use("/company", CompanyRouter);

// Regitser the "User CRUD" routers
router.use("/user", UserRouter);

// Regitser the "UserDetail CRUD" routers
router.use("/user", UserDetailRouter);

// Regitser the "UserEmail CRUD" routers
router.use("/user", UserEmailRouter);

// Regitser the "UserExperience CRUD" routers
router.use("/user", UserExperienceRouter);

// Regitser the "UserSociapProfile CRUD" routers
router.use("/user", UserSocialProfileRouter);

// Regitser the "User Referral" routers
router.use("/user", UserReferralRouter);

// Regitser the "User Service" routers
router.use("/user", UserServiceRouter);

// Regitser the "User Subscription" routers
router.use("/user", UserSubscriptionRouter);

// Regitser the "File" router
router.use("/file", FileRouter);

// Regitser the "Master Subscription" routers
router.use("/subscription", MasterSubscriptionRouter);

// Regitser the "Master Service" routers
router.use("/service", MasterServiceRouter);

// Export the router
export default router;
