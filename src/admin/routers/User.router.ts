// Import the necessary npm packages
import { Router } from "express";

// Import the controllers
import UserController from "../controllers/User.controller";
import UserExperienceController from "../controllers/UserExperience.controller";
import UserSubscriptionController from "../controllers/UserSubscription.controller";
import UserReferralController from "../controllers/UserReferral.controller";
 

// Create an instance of UserController
const userControllerObj = new UserController();

// Create an instance of UserExperienceController
const userExperienceControllerObj = new UserExperienceController();

// Create an instance of UserSubscriptionController
const userSubscriptionControllerObj = new UserSubscriptionController();

// Create an instance of UserReferralController
const userReferralControllerObj = new UserReferralController();

// Create a new Router instance
const UserRouter = Router();

// Define the route to get the user signup list based on userType query parameter which is optional and if empty then it will fetch all users(including "CAND" and "EMP" type users)
UserRouter.get("/", userControllerObj.getUsers);

// Define the route to get user details based on provided id as path parameter
UserRouter.get("/:id", userControllerObj.getUserDetailById);

// Define the route to get user details based on provided emailId as path parameter
UserRouter.get("/:emailId/detail", userControllerObj.getUserDetailByEmail);

// Define the route to get employee experiences based on provided emailId as path parameter
UserRouter.get("/:emailId/experience", userExperienceControllerObj.getUserExperiencesByEmail);

// list the user subscriptions by the user email and status is optional
UserRouter.get("/:emailId/subscription", userSubscriptionControllerObj.getUserSubscriptionsByEmail);

// Define the route to get referral responses by employee based on provided emailId as path parameter with jobUrl
UserRouter.get("/:emailId/emp-referral-responses", userReferralControllerObj.getReferralResponsesByEmpEmail);

// Export the UserRouter
export default UserRouter;