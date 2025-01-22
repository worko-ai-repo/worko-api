// import express types
import { Router } from 'express';

// Import controllers
import CorporateBulkJdController from "../controllers/CorporateBulkJd.controller";
import CorporateBulkJdResumeController from '../controllers/CorporateBulkJdResume.controller';

// Create the instance of CorporateBulkJdController and CorporateBulkJdResumeController
const corporateBulkJdController = new CorporateBulkJdController();
const corporateBulkJdResumeController = new CorporateBulkJdResumeController();

// Create a new mountable router for the Corporate Bulk JD APIs
const CorporateBulkJdRouter = Router(); 

/**
 * createCorporateBulkJd
 * 
 * This endpoint is used to create a new Corporate Bulk Job Description
 * 
 * @authorisedRoles ["admin", "corporate-admin", "corporate-recruiter"]
 */
CorporateBulkJdRouter.post('/', corporateBulkJdController.createCorporateBulkJd);

/**
 * createCorporateBulkJdResumes
 * 
 * This endpoint is used to create a new Corporate Bulk Job Description Resumes
 * and generate pre-signed urls for bulk cvs
 * 
 * @authorisedRoles ["admin", "corporate-admin", "corporate-recruiter"]
 */
CorporateBulkJdRouter.post('/:id/resumes', corporateBulkJdResumeController.createCorporateBulkJdResumes);

/**
 * getAllCorporateBulkJdByFilterOptions
 * 
 * This endpoint is used to get all Corporate Bulk Job Description by filter options
 * 
 * @authorisedRoles ["admin", "corporate-admin", "corporate-recruiter"]
 */
CorporateBulkJdRouter.get("/", corporateBulkJdController.getAllCorporateBulkJdByFilterOptions);

/**
 * getCorporateBulkJdById
 * 
 * Get Corporate Bulk Job Description by id
 * 
 * @authorisedRoles ["admin", "corporate-admin", "corporate-recruiter"]
 */
CorporateBulkJdRouter.get("/:id", corporateBulkJdController.getCorporateBulkJdById);

// Export CorporateBulkJdRouter
export default CorporateBulkJdRouter;