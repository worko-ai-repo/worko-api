// import express types
import { Router } from 'express';

// Import controllers
import CorporateUserController from '../controllers/CorporateUser.controller';

// Create the instance of CorporateController
const corporateUserController = new CorporateUserController();

// Create a new mountable router for the Corporate APIs
const CorporateUserRouter = Router(); 
  
/**
 * Register a new Corporate User
 * 
 * @authorisedRoles ["public"]
 */
CorporateUserRouter.post('/', corporateUserController.createCorpUser);

/**
 * Update Corporate User Details
 * 
 * @authorisedRoles ["admin","corporate-admin", "corporate-recruiter"]
 */
CorporateUserRouter.put('/:id', corporateUserController.updateCorpUserById);

/**
 * Soft Delete Corporate User
 * 
 * @authorisedRoles ["admin","corporate-admin","corporate-recruiter"]
 */
CorporateUserRouter.patch('/:id/delete', corporateUserController.deleteCorpUserById);

/**
 * Get All Corporate Users
 * 
 * @authorisedRoles ["admin","corporate-admin"]
 */
CorporateUserRouter.get('/', corporateUserController.getAllCorpUsers);
 
/**
 * Get Corporate User Details By Id
 * 
 * @authorisedRoles ["admin","corporate-admin"]
 */
CorporateUserRouter.get('/:id', corporateUserController.getCorpUserById);

/**
 * Get Corporate User Details By Id 
 * 
 * @authorisedRoles ["admin","corporate-admin"]
 */
CorporateUserRouter.get('/:id/cognito', corporateUserController.getCorpUserByCognitoId);

// Export Corporate router
export default CorporateUserRouter;