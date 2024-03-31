// Load the npm packages
import { Router } from "express";

// Import controllers
import EmailTemplateController from "../controllers/EmailTemplate.controller";

// Create instance of the "EmailTemplateController" class to read the methods/functions from the same.
const emailTemplateController = new EmailTemplateController();

// Route to hold the routes (CRUD, etc) related to "EmailTemplate"
const EmailTemplateRouter = Router();

// Create Email Template
EmailTemplateRouter.post("/", emailTemplateController.createEmailTemplate);
EmailTemplateRouter.put("/:templateName", emailTemplateController.updateEmailTemplate);
EmailTemplateRouter.get("/:templateName", emailTemplateController.getEmailTemplateByTemplateName);
EmailTemplateRouter.delete("/:templateName", emailTemplateController.deleteEmailTemplateByName);

// Export the "EmailTemplateRouter"
export default EmailTemplateRouter;