import { Router } from 'express';

// Import Corporate Controller
import CorporateUserInviteController from '../controllers/CorporateUserInvite.controller';

// Import Middleware
import { validateCorporateUserRequest } from '../middlewares/validate-corporate-request.middleware';

// Create the instance of CoporateController
const coporateUserInviteController = new CorporateUserInviteController();

// Create a new Mountable Route instance
const CorporateUserInviteRouter = Router();

/**
 * Generate New Access Request for Corporate User
 * 
 * @authorisedRoles ["admin","corporate-admin"]
 */
CorporateUserInviteRouter.post('/',validateCorporateUserRequest, coporateUserInviteController.createInvite);

/**
 * Get All Access Requests for Corporate User
 * 
 * @authorisedRoles ["admin","corporate-admin"]
 */
CorporateUserInviteRouter.get('/',validateCorporateUserRequest,coporateUserInviteController.getAllInvite);

/**
 * Get Access Request Details for Corporate User by ID
 * 
 * @authorisedRoles ["admin","corporate-admin","corporate-recruiter"]
 */
CorporateUserInviteRouter.get('/:id', coporateUserInviteController.getInviteById);

/**
 * Update Access Request for Corporate User by ID
 * 
 * @authorisedRoles ["admin","corporate-admin"]
 */
CorporateUserInviteRouter.patch('/:id',validateCorporateUserRequest, coporateUserInviteController.updateInviteById);

/**
 * Soft Delete Access Request for Corporate User by ID
 * 
 * @authorisedRoles ["admin","corporate-admin"]
 */
CorporateUserInviteRouter.patch('/:id/delete',validateCorporateUserRequest, coporateUserInviteController.softDeleteInvite);

// Export the CorporateUserInviteRouter
export default  CorporateUserInviteRouter;