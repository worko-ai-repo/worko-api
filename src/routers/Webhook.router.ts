import { Router } from "express";
import WebhookWhatsappController from "../controllers/WebhookWhatsapp.controller";

const webhookWhatsappController = new WebhookWhatsappController();
const WebhookRouter = Router();

/**
 * to verify the webhoook endpoint 
 * 
 * @authorisedRoles 
 */
WebhookRouter.get("/whatsapp", webhookWhatsappController.verifyWebhook);

/**
 * to handle the webhook events
 * 
 * @authorisedRoles 
 */
WebhookRouter.post("/whatsapp", webhookWhatsappController.handleWebhook);

export default WebhookRouter;