// import express types
import { Router } from 'express';

// Import controllers
import CorporateUserController from '../controllers/CorporateUser.controller';

// Create the instance of CorporateController
const corporateUserController = new CorporateUserController();

// Create a new mountavble router for the Corporate APIs
const CorporateUserRouter = Router(); 

// Import Middlewares
import { validateCorporateUserRequest } from '../middlewares/validate-corporate-request.middleware';
  
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
CorporateUserRouter.put('/:id',validateCorporateUserRequest, corporateUserController.updateCorpUserById);

/**
 * Soft Delete Corporate User
 * 
 * @authorisedRoles ["admin","corporate-admin","corporate-recruiter"]
 */
CorporateUserRouter.patch('/:id/delete',validateCorporateUserRequest, corporateUserController.deleteCorpUserById);

/**
 * Get All Corporate Users
 * 
 * @authorisedRoles ["admin","corporate-admin"]
 */
CorporateUserRouter.get('/',validateCorporateUserRequest, corporateUserController.getAllCorpUsers);
 
/**
 * Get Corporate User Details By Id
 * 
 * @authorisedRoles ["admin","corporate-admin"]
 */
CorporateUserRouter.get('/:id',validateCorporateUserRequest, corporateUserController.getCorpUserById);

/**
 * Get Corporate User Details By Id 
 * 
 * @authorisedRoles ["admin","corporate-admin"]
 */
CorporateUserRouter.get('/:id/cognito', corporateUserController.getCorpUserByCognitoId);

// Export Corporate router
export default CorporateUserRouter;