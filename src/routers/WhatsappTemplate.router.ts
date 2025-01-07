// Import the Router class from the express library
import { Router } from "express";

// Importb controllers 
import WhatsappTemplateController from "../controllers/WhatsappTemplate.controller";

// Create a new instance of the WhatsappTemplateController
const whatsappTemplateController = new WhatsappTemplateController();

// Create a new Router instance
const WhatsappTemplateRouter = Router();

/**
 * Define a POST router create a new WhatsApp template
 * 
 * @authorisedRoles 
 */
WhatsappTemplateRouter.post("/", whatsappTemplateController.createWhatsappTemplate);

/**
 * Define a GET router to retrieve a WhatsApp template by its name
 * 
 * @authorisedRoles 
 */
WhatsappTemplateRouter.get("/:templateName", whatsappTemplateController.getWhatsappTemplateByName);

/**
 * Define a GET router to retrive all Whatsapp templates in Local.
 * 
 * @authorisedRoles 
 */
WhatsappTemplateRouter.get("/", whatsappTemplateController.getAllWhatsappTemplates);

// Commented out routes for updating and deleting WhatsApp templates
// WhatsappTemplateRouter.put("/:templateName", whatsappTemplateController.updateWhatsappTemplate);
// WhatsappTemplateRouter.delete("/:templateName", whatsappTemplateController.deleteWhatsappTemplateByName);

// Export the WhatsappTemplateRouter to be used in other parts of the application
export default WhatsappTemplateRouter;
