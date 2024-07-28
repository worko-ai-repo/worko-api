// Load the npm packages
import { Router } from "express";

// Load local packages

// Company routers
import CompanyRouter from "./routers/Company.router";

// User routers
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
import UserAvailabilityRouter from "./routers/UserAvailability.router";
import UserReviewRouter from "./routers/UserReview.router";
import UserSupportRouter from "./routers/UserSupport.router";
import UserCorporateRequestRouter from "./routers/UserCorporateRequest.router";
import UserCareerRequestRouter from "./routers/UserCareerRequest.router";
import EventRouter from "./routers/Event.router";

// File routers
import FileRouter from "./routers/File.router";

// Referral routers
import EmpReferralRouter from "./routers/EmpReferral.router";

// Master routers
import MasterSubscriptionRouter from "./routers/MasterSubscription.router";
import MasterServiceRouter from "./routers/MasterService.router";
import EmailTemplateRouter from "./routers/EmailTemplate.router";

// Other
import TestRouter from "./routers/Test.router";
// import OrderRouter from "./routers/Order.router";
import UserOrderRouter from "./routers/UserOrder.router";
import AdminRouter from "./routers/Admin.router";

// Router that contains all the routes/endpoints in the application
const router = Router();

// Regitser the "Company" routers
router.use("/company", CompanyRouter);

// Regitser the "EventRouter CRUD" routers
router.use("/event", EventRouter);

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

// Regitser the "User AvailabilityRouter" routers
router.use("/user", UserAvailabilityRouter);

// Regitser the "User Review" routers
router.use("/user", UserReviewRouter);

// Register the "UserOrder" routers
router.use("/user", UserOrderRouter);

// Register the "Order" routers
// router.use("/sample-order", OrderRouter);

// Regitser the "File" router
router.use("/file", FileRouter);

// Regitser the "Referral" router
router.use("/emp", EmpReferralRouter);

// Regitser the "Master Subscription" routers
router.use("/msubscription", MasterSubscriptionRouter);

// Regitser the "Master Service" routers
router.use("/mservice", MasterServiceRouter);

// Register the "Email Template" routers.
// Note: These actions are only for users with "admin" role. @todo add required authorizations.
router.use("/email-template", EmailTemplateRouter);

// Just a test controller to perform some testing operations required to confirm the changes made in the application.
router.use("/test", TestRouter);

// Register the "User Support " routers
router.use("/support", UserSupportRouter);

// Register the "User Corporate " routers
router.use("/corporate", UserCorporateRequestRouter);

// Register the "User Career Request " routers
router.use("/career", UserCareerRequestRouter);

// Register the "User Career Request " routers
router.use("/admin", AdminRouter);

// Export the router
export default router;
