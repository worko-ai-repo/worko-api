// Import Dtos
import {
  WhatsappWebhookEventCloudApiDto,
  WhatsappWebhookValueCloudApiDto,
  WhatsappWebhookStatusCloudApiDto,
  WhatsappWebhookMessageCloudApiDto
} from "../dtos/WhatsappWebhook.dto";

// Import Models
import { WhatsappWebhookLogRecievedCreateDto } from "../dtos/WhatsappMessageLog.dto";
import { DbWhatsappMessageLogDto } from "../db/models/WhatsappMessageLog.model";

// Import Services
import { whatsappMessageLogServiceObj } from "./WhatsappMessageLog.service";

// Import Utilities
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

// Import Enums
import { WhatsappWebhookStatusTypeEnum } from "../enums/WhatsappWebhook.enum";
import { WhatsappMessageTypeCloudApiEnum } from "../enums/WhatsappMessageLog.enum";

/**
 * Service class for handling WhatsApp webhook events.
 * 
 * This class processes incoming webhook events triggered by WhatsApp.
 * It is responsible for identifying the type of event (e.g., incoming message, message status update)
 * and delegating the event to the appropriate handler function.
 */
class WhatsappWebhookService {

  /**
   * Processes incoming webhook events.
   * 
   * This function is the entry point for handling all webhook events received from WhatsApp.
   * It determines whether the event is related to an incoming message or a status update for an outgoing message,
   * and then calls the appropriate processing function.
   * 
   * @param {WhatsappWebhookEventCloudApiDto} webhookEvent - The incoming webhook event object containing details about the event.
   * @returns {Promise<WhatsappWebhookLogRecievedCreateDto | void>} A promise resolving to the created log entry in the database for message events, or void for unsupported events.
   * @throws {BaseError} If the event type is unsupported or cannot be processed.
   */
  async processWebhookEvent(webhookEvent: WhatsappWebhookEventCloudApiDto): Promise<DbWhatsappMessageLogDto> {
    global.logger.info("Processing Webhook Event in WhatsappWebhookService.");
    const entry = webhookEvent.entry[0];
    const change = entry.changes[0];
    const value = change.value;

    // Determine the type of webhook event and process accordingly
    if (value.messages && value.messages.length > 0) {
      // Process incoming message event
      return this.processIncomingMessage(webhookEvent, value.messages[0]);
    } else if (value.statuses && value.statuses.length > 0) {
      // Process outgoing message status event
      return this.processOutgoingMessageStatus(webhookEvent, value, value.statuses[0]);
    } else {
      // If the event type is not supported, throw an error
      throw new BaseError("Unsupported webhook event type", HttpStatusCode.BAD_REQUEST_400);
    }
  }

  /**
   * Processes outgoing message status events.
   * 
   * This function is called when the webhook event is related to the status of an outgoing message.
   * It extracts relevant information such as the status of the message (e.g., delivered, read) and logs it in the database.
   * 
   * @param {WhatsappWebhookEventCloudApiDto} webhookEvent - The original webhook event object containing details about the event.
   * @param {WhatsappWebhookValueCloudApiDto} value - The value object from the webhook event, which contains metadata and status information.
   * @param {WhatsappWebhookStatusCloudApiDto} status - The status object containing details about the status update of the message.
   * @returns {Promise<any>} A promise resolving to the created database entry for the status update.
   * @todo : Review the below function and haandle it to manage the outgoing messages. This is remaining due to we are not handling outgoing messages
   */
  async processOutgoingMessageStatus(
    webhookEvent: WhatsappWebhookEventCloudApiDto,
    value: WhatsappWebhookValueCloudApiDto,
    status: WhatsappWebhookStatusCloudApiDto
  ): Promise<any> {
    const whatsappWebhookCreateDto = {
      ...webhookEvent,
      senderPhoneNumber: value.metadata.display_phone_number,
      recipientPhoneNumber: status.recipient_id,
      timestamp: status.timestamp,
      messageContent: status.status,
      originalMessageId: status.id,
      isReply: false,
      conversationId: status.conversation?.id ?? "NA",
      status: status.status,
    };

    return whatsappWebhookCreateDto;
  }

  /**
   * Processes incoming WhatsApp messages from webhook events.
   * 
   * This function is invoked when a webhook event indicates the arrival of a new message.
   * It handles different types of incoming messages (e.g., text, media, location) and creates a log entry
   * in the database with the message details.
   * 
   * @param {WhatsappWebhookEventCloudApiDto} webhookEvent - The complete webhook event data received from WhatsApp.
   * @param {WhatsappWebhookMessageCloudApiDto} message - The specific message object extracted from the webhook event.
   * @returns { Promise<DbWhatsappMessageLogDto>} A promise resolving to the created log entry in the database for the incoming message.
   */
  async processIncomingMessage(webhookEvent: WhatsappWebhookEventCloudApiDto, message: WhatsappWebhookMessageCloudApiDto): Promise<DbWhatsappMessageLogDto> {
    // Extract the message content based on the message type
    const messageContent = this.getMessageContent(message);

    // Extract the value object from the webhook event for easier access
    const value = webhookEvent.entry[0].changes[0].value;

    // Construct the DTO for logging the received message
    const whatsappWebhooklogDto: WhatsappWebhookLogRecievedCreateDto = {
      messageId: message.context?.id ?? message.id,
      messageType: message.type,
      messageContent: messageContent,
      messageOriginalContent: message,
      conversationId: value.conversation?.id ?? "NA",
      isReply: !!message.context,
      status: WhatsappWebhookStatusTypeEnum.RECEIVED,
    };

    // Process and store the log entry
    return whatsappMessageLogServiceObj.processWhatsappReceivedMessageLog(whatsappWebhooklogDto);
  }

  /**
   * Extracts the content of the WhatsApp message based on its type.
   * 
   * This method handles different types of messages such as text, media, location, button, and interactive messages.
   * It is called internally by `processIncomingMessage` to parse the message content appropriately before logging.
   * 
   * @param {WhatsappWebhookMessageCloudApiDto} message - The WhatsApp message object containing various message details.
   * @returns {string} A string representation of the message content, based on the message type.
   */
  private getMessageContent(message: WhatsappWebhookMessageCloudApiDto): string {
    switch (message.type) {
      case WhatsappMessageTypeCloudApiEnum.TEXT:
        // For text messages, return the body of the text message.
        return message.text?.body || "";

      case WhatsappMessageTypeCloudApiEnum.IMAGE:
      case WhatsappMessageTypeCloudApiEnum.VIDEO:
      case WhatsappMessageTypeCloudApiEnum.AUDIO:
      case WhatsappMessageTypeCloudApiEnum.DOCUMENT:
        // For media messages (image, video, audio, document), return the caption if available.
        return message[message.type]?.caption || "";

      case WhatsappMessageTypeCloudApiEnum.LOCATION:
        // For location messages, return the latitude and longitude in a formatted string.
        return `${message.location?.latitude}, ${message.location?.longitude}`;

      case WhatsappMessageTypeCloudApiEnum.BUTTON:
        // For button messages, return the text of the button that was clicked.
        return message.button?.text || "";

      case WhatsappMessageTypeCloudApiEnum.INTERACTIVE:
        // For interactive messages, determine the type and return the corresponding response.
        if (message.interactive?.type === "list_reply") {
          // If the interactive message is a list reply, return the selected list item's title.
          return message.interactive.list_reply?.title || "";
        } else if (message.interactive?.type === "button_reply") {
          // If the interactive message is a button reply, return the button's title.
          return message.interactive.button_reply?.title || "";
        }
        // If the interactive type is unknown, return a generic message.
        return "The returned message value could not be identified by our system. Please check logs.";

      default:
        // If the message type is unsupported, return a default message.
        return "Unsupported message type";
    }
  }
}

// Create an instance of the service
const whatsappWebhookServiceObj = new WhatsappWebhookService();

// Export the service instance
export {
  whatsappWebhookServiceObj,
  WhatsappWebhookService
};
