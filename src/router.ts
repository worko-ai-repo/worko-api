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
import UserEducationRouter from "./routers/UserEducation.router";
import UserSkillRouter from "./routers/UserSkill.router";
import UserAchievementRouter from "./routers/UserAchievement.router";
import UserReferralRouter from "./routers/UserReferral.router";
import UserSubscriptionRouter from "./routers/UserSubscription.router";
import UserServiceRouter from "./routers/UserService.router";
import UserProfilePercentageRouter from "./routers/UserProfilePercentage.router";
import UserBankDetailRouter from "./routers/UserBankDetail.router";
import UserProvidedServiceRouter from "./routers/UserProvidedService.router";

//File routers
import FileRouter from "./routers/File.router";

//Referral routers
import ReferralRouter from "./routers/Referral.router";

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

// Regitser the "UserEducation CRUD" routers
router.use("/user", UserEducationRouter);

// Regitser the "UserSkill CRUD" routers
router.use("/user", UserSkillRouter);

// Regitser the "UserAchievement CRUD" routers
router.use("/user", UserAchievementRouter);

// Regitser the "User Referral" routers
router.use("/user", UserReferralRouter);

// Regitser the "User Service" routers
router.use("/user", UserServiceRouter);

// Regitser the "User Subscription" routers
router.use("/user", UserSubscriptionRouter);

// Regitser the "User ProfilePercentage" routers
router.use("/user", UserProfilePercentageRouter);

// Regitser the "User BankDetail" routers
router.use("/user", UserBankDetailRouter);

// Regitser the "User ProvidedService" routers
router.use("/user", UserProvidedServiceRouter);

// Regitser the "File" router
router.use("/file", FileRouter);

// Regitser the "Referral" router
router.use("/referral", ReferralRouter);

// Regitser the "Master Subscription" routers
router.use("/subscription", MasterSubscriptionRouter);

// Regitser the "Master Service" routers
router.use("/service", MasterServiceRouter);

// Export the router
export default router;
