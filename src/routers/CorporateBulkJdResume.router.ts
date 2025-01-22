// import express types
import { Router } from 'express';

// Import controllers
import CorporateBulkJdResumeController from "../controllers/CorporateBulkJdResume.controller";

// Create the instance of CorporateBulkJdResumeController
const corporateBulkJdResumeController = new CorporateBulkJdResumeController();

// Create a new mountable router for the Corporate Bulk JD APIs
const CorporateBulkJdResumeRouter = Router(); 

/**
 * getCorporateBulkJdResumesByFilterOptions
 * 
 * @authorisedRoles ["admin", "corporate-admin", "corporate-recruiter"]
 */
CorporateBulkJdResumeRouter.get('/', corporateBulkJdResumeController.getCorporateBulkJdResumesByFilterOptions);

/**
 * getCorporateBulkJdResumeById
 * 
 * Get Corporate Bulk Jd Resume By Id
 */
CorporateBulkJdResumeRouter.get('/:id', corporateBulkJdResumeController.getCorporateBulkJdResumeById);

// Export CorporateBulkJdResumeRouter
export default CorporateBulkJdResumeRouter;