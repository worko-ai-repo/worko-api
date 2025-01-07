// Load the npm packages
import { Router } from "express";

// Import controllers
import EmailTemplateController from "../controllers/EmailTemplate.controller";

// Create instance of the "EmailTemplateController" class to read the methods/functions from the same.
const emailTemplateController = new EmailTemplateController();

// Route to hold the routes (CRUD, etc) related to "EmailTemplate"
const EmailTemplateRouter = Router();

/**
 * Create Email Template
 * 
 * @authorisedRoles ["admin"]
 */
EmailTemplateRouter.post("/", emailTemplateController.createEmailTemplate);

/**
 * Update Email Template
 * 
 * @authorisedRoles ["admin"]
 */
EmailTemplateRouter.put("/:templateName", emailTemplateController.updateEmailTemplate);

/**
 * Get Email Template by Template Name
 * 
 * @authorisedRoles ["admin"] 
 */
EmailTemplateRouter.get("/:templateName", emailTemplateController.getEmailTemplateByTemplateName);

/**
 * Delete Email Template by Template Name
 * 
 * @authorisedRoles ["admin"] 
 */
EmailTemplateRouter.delete("/:templateName", emailTemplateController.deleteEmailTemplateByName);

// Export the "EmailTemplateRouter"
export default EmailTemplateRouter;