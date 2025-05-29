// Load the npm packages
import { Router } from "express";

// Company routers
import CompanyRouter from "./routers/Company.router";

// Corporate Routers
import CorporateUserRouter from "./routers/CorporateUser.router";
import CorporateUserInviteRouter from "./routers/CorporateUserInvite.router";

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
import WhatsappTemplateRouter from "./routers/WhatsappTemplate.router";

// Other
import TestRouter from "./routers/Test.router";
import ScriptRouter from "./routers/Script.router";
// import OrderRouter from "./routers/Order.router";
import UserOrderRouter from "./routers/UserOrder.router";
import WebhookRouter from "./routers/Webhook.router";
import CorporateBulkJdRouter from "./routers/CorporateBulkJd.router";
import CorporateBulkJdResumeRouter from "./routers/CorporateBulkJdResume.router";

// Admin Routers
import AdminSubsRouter from "./routers/Admin.router";
import AdminRouter from "./admin/router";

// Router that contains all the routes/endpoints in the application
const router = Router();

/**
 * AUTHORISATION ROLES DESCRIPTION
 * 
 * Custom Roles
 *    "public" - Any user can access these routes even if they are not logged in
 *    "loggedInUser" - Only logged in users can access these routes
 * 
 * Cognito User Groups
 *    "admin" - Only worko admin users can access these routes
 *    "corporate-recruiter" - Only corporate recruiters can access these routes
 *    "corporate-admin" - Only corporate admin users can access these routes
 */

/**
 * ADMIN ROUTERS
 * 
 * Only admin users can access these routes
 * 
 * @authorisedRoles ["admin"]
 */
router.use("/admin", AdminRouter);

// Admin router @todo: discuss with lead to add below route in router.use("/admin", AdminRouter);
router.use("/admin-subs", AdminSubsRouter);

/**
 * COMPANY ROUTERS
 * 
 * Regitser the "Company" routers
 * 
 * @authorisedRoles ["admin","public"]
*/
router.use("/company", CompanyRouter);

/**
 * CORPORATE BULK JD ROUTERS
 * 
 * @authorisedRoles ["admin", "corporate-admin", "corporate-recruiter"]
 */
router.use("/corporate-bulk-jd", CorporateBulkJdRouter);

/**
 * CORPORATE BULK JD RESUME ROUTERS
 * 
 * @authorisedRoles ["admin", "corporate-admin", "corporate-recruiter"]
 */
router.use("/corporate-bulk-jd-resume", CorporateBulkJdResumeRouter);

/**
 * CORPORATE ROUTERS
 * 
 * Regitser the "CorporateUser" routers
 * 
 * @authorisedRoles ["admin","corporate-admin","public"]
 */
router.use("/corporate-user", CorporateUserRouter);

/**
 * CORPORATE INVITE ROUTERS
 * 
 * Register the "CorporateInvite" routers
 * 
 * @authorisedRoles ["admin","corporate-recruiter","corporate-admin"]
 */
router.use("/corporate-invite", CorporateUserInviteRouter);

/**
 * EMAIL TEMPLATE ROUTERS
 * 
 * Register the "Email Template" routers.
 * 
 * @authorisedRoles ["admin"]
 */
router.use("/email-template", EmailTemplateRouter);

/**
 * EMPLOYEE REFERRAL ROUTERS
 * 
 * Regitser the "Referral" router
 * 
 * @authorisedRoles ["admin", "loggedInUser"]
 * @todo: discuss with team lead to write a middleware to check whether the user is `Employee` or `Candidate` and
 * allow only `Employee` to access this route
 */
router.use("/emp", EmpReferralRouter);

/**
 * EVENT ROUTERS
 * 
 * Regitser the "EventRouter CRUD" routers
 * 
 * @authorisedRoles ["admin"] 
 * @todo: add required authorizations after discussing with team lead
 */
router.use("/event", EventRouter);

/**
 * FILE ROUTERS 
 * 
 * Regitser the "File" router
 * @authorisedRoles ["admin"] 
 * @todo: add required authorizations after discussing with team lead
 */
router.use("/file", FileRouter);

/**
 * MASTER SERVICE ROUTERS
 * 
 * Regitser the "Master Service" routers
 * 
 * @authorisedRoles ["admin"] 
 * @todo: add required authorizations after discussing with team lead
 */
router.use("/mservice", MasterServiceRouter);

/**
 * MASTER SUBSCRIPTION ROUTERS
 * 
 * Regitser the "Master Subscription" routers
 * 
 * @authorisedRoles ["admin"] 
 * @todo: add required authorizations after discussing with team lead
 */
router.use("/msubscription", MasterSubscriptionRouter);

/**
 * ORDER ROUTERS
 * Register the "UserOrder" routers
 * 
 * @authorisedRoles ["admin"] 
 * @todo: add required authorizations after discussing with team lead
 */
router.use("/user", UserOrderRouter);

/**
 * SCRIPT ROUTERS
 * 
 * @todo: After executing the ScriptRouter in DEV and PROD environments,
 * these route should be commented out to prevent unintended execution.
 * 
 * Register the "Script" routers
 * 
 * @authorisedRoles ["admin"]
 */
router.use("/script", ScriptRouter);

/**
 * TEST ROUTERS
 * 
 * Just a test controller to perform some testing operations required to confirm the changes made in the application.
 * 
 * @authorisedRoles ["admin"]
 * @todo add required authorizations after discussing with team lead
 */
router.use("/test", TestRouter);

/**
 * USER ROUTERS
 * 
 * Regitser the "User CRUD" routers
 * 
 * @authorisedRoles ["admin", "public","loggedInUser"]
 */
router.use("/user", UserRouter);

/**
 * USER ACHIEVEMENT ROUTERS
 * 
 * Regitser the "UserAchievement CRUD" routers
 * 
 * @authorisedRoles ["admin"]
 */
router.use("/user", UserAchievementRouter);

/**
 * USER AVAILABILITY ROUTERS
 * 
 * Regitser the "User AvailabilityRouter" routers
 * 
 * @authorisedRoles ["admin"]
 * @todo add required authorizations after discussing with team lead
 */
router.use("/user", UserAvailabilityRouter);

/**
 * USER BANKDETAIL ROUTERS
 * 
 * Regitser the "User BankDetail" routers
 * 
 * @authorisedRoles ["admin"]
 * @todo add required authorizations after discussing with team lead
 */
router.use("/user", UserBankDetailRouter);

/**
 * USER CAREER REQUEST ROUTERS
 * 
 * Register the "User Career Request " routers
 * 
 * @authorisedRoles ["admin"]
 * @todo add required authorizations after discussing with team lead
 */
router.use("/career", UserCareerRequestRouter);

/**
 * USER CORPORATE REQUEST ROUTERS
 * 
 * Register the "User Corporate " routers
 * 
 * @authorisedRoles ["admin", "public"]
 * @todo add required authorizations after discussing with team lead
 */
router.use("/corporate", UserCorporateRequestRouter);

/**
 * USER DETAIL ROUTERS
 * 
 * Regitser the "UserDetail CRUD" routers
 * 
 * @authorisedRoles ["admin", "loggedInUser"]
 * @todo add required authorizations after discussing with team lead
 */
router.use("/user", UserDetailRouter);

/**
 * USER EDUCATION ROUTERS
 * 
 * Regitser the "UserEducation CRUD" routers
 * 
 * @authorisedRoles ["admin", "loggedInUser"]
 * @todo add required authorizations after discussing with team lead
 */
router.use("/user", UserEducationRouter);

/**
 * USER EMAIL ROUTERS
 * 
 * Regitser the "UserEmail CRUD" routers
 * 
 * @authorisedRoles ["admin"]
 * @todo add required authorizations after discussing with team lead
 */
router.use("/user", UserEmailRouter);

/**
 * USER EXPERIENCE ROUTERS
 * 
 * Regitser the "UserExperience CRUD" routers
 * 
 * @authorisedRoles ["admin", "loggedInUser"]
 * @todo add required authorizations after discussing with team lead
 */
router.use("/user", UserExperienceRouter);

/**
 * USER SOCIAL PROFILE ROUTERS
 * 
 * Regitser the "UserSociapProfile CRUD" routers
 * 
 * @authorisedRoles ["admin", "loggedInUser"]
 * @todo add required authorizations after discussing with team lead
 */
router.use("/user", UserSocialProfileRouter);

/**
 * USER PROFILE PERCENTAGE ROUTERS
 * 
 * Regitser the "User ProfilePercentage" routers
 * 
 * @authorisedRoles ["admin", "loggedInUser"]
 */
router.use("/user", UserProfilePercentageRouter);

/**
 * USER PROVIDED SERVICE ROUTERS
 * 
 * Regitser the "User ProvidedService" routers
 * 
 * @authorisedRoles ["admin"]
 * @todo add required authorizations after discussing with team lead
 */
router.use("/user", UserProvidedServiceRouter);

/**
 * USER REFFERAL ROUTERS
 * 
 * Regitser the "User Referral" routers
 * 
 * @authorisedRoles ["admin", "loggedInUser"]
 */
router.use("/user", UserReferralRouter);

/**
 * USER REVIEW ROUTERS
 * 
 * Regitser the "User Review" routers
 * 
 * @authorisedRoles ["admin","loggedInUser"]
 */
router.use("/user", UserReviewRouter);

/**
 * USER SERVICE ROUTERS
 * 
 * Regitser the "User Service" routers
 * 
 * @authorisedRoles ["admin", "loggedInUser"]
 */
router.use("/user", UserServiceRouter);

/**
 * USER SKILL ROUTERS
 * 
 * Regitser the "UserSkill CRUD" routers
 * 
 * @authorisedRoles ["admin", "loggedInUser"]
 */
router.use("/user", UserSkillRouter);

/**
 * USER SUBSCRIPTION ROUTERS
 * 
 * Regitser the "User Subscription" routers
 * 
 * @authorisedRoles ["admin", "loggedInUser"]
 */
router.use("/user", UserSubscriptionRouter);

/**
 * USER SUPPORT ROUTERS
 * 
 * Register the "User Support " routers
 * 
 * @authorisedRoles ["admin", "loggedInUser"]
 */
router.use("/support", UserSupportRouter);

/**
 * WHATSAPP TEMPLATE ROUTERS
 * 
 * Register the "Whatsapp Template" routers.
 * Note: These actions are only for users with "admin" role. 
 * @todo add required authorizations.
 * 
 * @authorisedRoles ["admin"]
 */
router.use("/whatsapp-template", WhatsappTemplateRouter);

/**
 * WEBHOOK ROUTERS
 * 
 * Register the "Whatsapp Template" routers.
 * Note: These actions are only for users with "admin" role. 
 * @todo add required authorizations.
 * 
 * @authorisedRoles ["admin"]
 */
router.use("/webhook", WebhookRouter);

// Register the "Order" routers
// router.use("/sample-order", OrderRouter);

// Export the router
export default router;
