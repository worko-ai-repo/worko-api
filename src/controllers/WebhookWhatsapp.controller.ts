// Import necessary dependencies and types
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import { WhatsappWebhookEventCloudApiDto } from "../dtos/WhatsappWebhook.dto";

// Load the shared service
import { whatsappWebhookServiceObj } from "../services/WhatsappWebhook.service";

// Load constants
import { WHATSAPP_APP_CONSTANTS } from "../configs/constants/Whatsapp.constant";

//Load local util statuscode
import HttpStatusCode from "../utils/http-codes.util";

/**
 * WebhookWhatsappController
 * 
 * Controller for handling WhatsApp webhook operations.
 */
class WebhookWhatsappController {
  /**
   * verifyWebhook
   * 
   * This function is to verify/validate the webhook request made by the "WhatsappCloud" API to ensure the request is coming from valid source,
   * if the request is validated then the Whatsapp will make the Webhook request, otherwise if the validation is failed then the Whatsapp will not be able to make the Webhook request.
   * 
   * @param req - The incoming request object.
   * @param res - The outgoing response object.
   */
  async verifyWebhook(req: Request, res: Response): Promise<any> {
    // Extract query parameters from the request
    const hubMode = req.query["hub.mode"] as string;
    const hubToken = req.query["hub.verify_token"] as string;
    const hubChallenge = req.query["hub.challenge"] as string;

    // Verify if the mode is 'subscribe' and the token matches
    if (hubMode === WHATSAPP_APP_CONSTANTS.WEBHOOK_HUB_MODE
      && hubToken === process.env.APP_WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
      // Send the challenge back to complete verification
      global.logger.info("Webhook verified successfully!");
      return res.status(HttpStatusCode.OK_200).send(hubChallenge);
    }
    
    // If verification fails, send a forbidden status
    console.log("Webhook verification failed!");
    return res.sendStatus(HttpStatusCode.FORBIDDEN_403);
  }

  /**
   * handleWebhook
   * 
   * Handles webhook requests made by the WhatsappAPI
   * 
   * @param req - The incoming request object.
   * @param res - The outgoing response object.
   * @param next - The next function in the middleware chain.
   */
  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract the webhook event from the request body
      const webhookEvent: WhatsappWebhookEventCloudApiDto = req.body;

      // Process the webhook event using the service
      const processedWebhook = await whatsappWebhookServiceObj.processWebhookEvent(webhookEvent);

      // Send a successful response with the processed webhook data
      res.status(HttpStatusCode.OK_200).json(processedWebhook);
    } catch (error) {
      // Log and handle any errors that occur during processing
      next(error);
    }
  }
}

// Export the WebhookWhatsappController class
export default WebhookWhatsappController;