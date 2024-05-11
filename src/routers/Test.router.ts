// Load the npm packages
import { Router } from "express";

// Import controllers
import TestController from "../controllers/Test.controller";

// Create instance of the "TestController" class to read the methods/functions from the same.
const testController = new TestController();

// Route to hold the routes (CRUD, etc) related to "Testing"
const TestRouter = Router();

// Send Test Email to User
TestRouter.post("/send-test-email", testController.sendEmail);

// Send Email to the candidate to remind him to complete his profile
TestRouter.get("/:id/sendreminder",testController.sendCandProfileReminderEmail);

// Send Email to the employee to remind him to complete his profile
TestRouter.get("/:id/sendEmpReminder", testController.sendEmpProfileReminderEmail);

// Send Email to the candidate when his free/premium subscription has ended
TestRouter.get("/:id/sendMailToUpgradeSubscription", testController.sendCandMailToUpgradeSubscription)

// Send Email to the candidate to suggest him that he can create profile as employee as well
TestRouter.get("/:id/sendRemindertoCreateMutlipleProfiles", testController.sendReminderToCandToCreateMutlipleProfiles)

// Send Email to the employee to suggest him that he can create profile as candidate as well
TestRouter.get("/:id/sendRemindertoEmptoCreateMultipleProfiles", testController.sendReminderToEmpToCreateMutlipleProfiles)

// Export the "TestRouter"
export default TestRouter;