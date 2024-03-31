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

// Export the "TestRouter"
export default TestRouter;