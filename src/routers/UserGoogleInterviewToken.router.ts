// Import the npm packages
import { Router } from "express";

// Import controllers
import UserGoogleInterviewTokenController from "../controllers/UserGoogleInterviewToken.controller";

// Create instance of the "UserGoogleInterviewTokenController" class
const userGoogleInterviewTokenController =
  new UserGoogleInterviewTokenController();

// Route to hold the routes (CRUD, etc) related to the "UserGoogleInterviewToken" table
const UserGoogleInterviewTokenRouter = Router();

/**
 * Exchanges the GIS authorization code and stores the tokens.
 *
 * @authorisedRoles ["loggedInUser"]
 */
UserGoogleInterviewTokenRouter.post(
  "/token",
  userGoogleInterviewTokenController.createUserGoogleInterviewTokenDetails
);

/**
 * Fetch stored token details.
 *
 * @authorisedRoles ["loggedInUser"]
 */
UserGoogleInterviewTokenRouter.get(
  "/token",
  userGoogleInterviewTokenController.getUserGoogleInterviewTokenDetailsByUserId
);

/**
 * Re-exchanges the GIS authorization code and updates token details.
 *
 * @authorisedRoles ["loggedInUser"]
 */
UserGoogleInterviewTokenRouter.patch(
  "/token",
  userGoogleInterviewTokenController.updateUserGoogleInterviewTokenDetails
);

/**
 * Deletes the stored token details.
 *
 * @authorisedRoles ["loggedInUser"]
 */
UserGoogleInterviewTokenRouter.delete(
  "/token",
  userGoogleInterviewTokenController.deleteUserGoogleInterviewTokenDetailsByUserId
);

export default UserGoogleInterviewTokenRouter;

