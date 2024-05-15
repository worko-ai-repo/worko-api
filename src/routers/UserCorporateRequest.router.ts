// Load the npm packages
import { Router } from "express";

// Load local packages
import UserCorporateRequestController from "../controllers/UserCorporateRequest.controller";

// Create instance of the "UserCorporateRequestController" class to read the methods/functions from the same.
const userCorporateRequestController = new UserCorporateRequestController();

// Route to hold the routes (CRUD, etc) related to "UserCorporateRequest" table
const UserCorporateRequestRouter = Router();

// Create corporate request router, "/" is the base url, actually will be (api/corporate-request/)
UserCorporateRequestRouter.post("/", userCorporateRequestController.createCorporateRequest);

// Get all corporate request details raised by user
UserCorporateRequestRouter.get("/", userCorporateRequestController.getUserCorporateRequestList);

// API to send otp to the User's email that is being used to fill the form
UserCorporateRequestRouter.post("/:email/request-otp", userCorporateRequestController.sendOtptoVerifyUserForCorporatePage);

// API to verify the User's email via otp that is being used to fill the form
UserCorporateRequestRouter.post("/:email/verify-otp", userCorporateRequestController.verifyUserEmailForCorporatePage)

// Get corporate request details for mention requestId
UserCorporateRequestRouter.get("/:requestId", userCorporateRequestController.getCorporateRequestById);

// Updates corporate request for mention requestId
UserCorporateRequestRouter.post("/:requestId", userCorporateRequestController.updateCorporateRequestById);

export default UserCorporateRequestRouter;
