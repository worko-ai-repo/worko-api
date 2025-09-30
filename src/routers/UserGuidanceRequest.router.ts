
import { Router } from "express";


import UserGuidanceRequestController from "../controllers/UserGuidanceRequest.controller";

const userGuidanceRequestController: UserGuidanceRequestController = new UserGuidanceRequestController();

const UserGuidanceRequestRouter: Router = Router();

/**
 * createUserGuidanceRequest
 * 
 * @authorisedRoles ["loggedInUser"]
 */
UserGuidanceRequestRouter.post("/guidance-request", userGuidanceRequestController.createUserGuidanceRequest);

/**
 * Get the user guidance request based on the provided query parameter
 * 
 * @authorisedRoles ["admin", "loggedInUser"]
 */
UserGuidanceRequestRouter.get('/guidance-request',userGuidanceRequestController.getAllUserGuidanceRequestByFilterOptions);

/**
 * Update the user guidance request
 * 
 * @authorisedRoles ["admin", "loggedInUser"]
 */
UserGuidanceRequestRouter.patch('/guidance-request/:id/:resourceKey',userGuidanceRequestController.updateUserGuidanceRequest);

export default UserGuidanceRequestRouter;