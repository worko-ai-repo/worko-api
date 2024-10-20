// import dtos
import { GrowaasanPlaceholderParamDto } from "./GrowaasanTemplatePlaceholder.dto";
import { GrowaasanPhoneNumberDto, GrowaasanSendMessageResponseDto } from "./Growaasan.dto";

// import enums
import { UserContextTypeEnum } from "../enums/User.enum";

/**
 * GrowaasanMessageLogCreateDto
 * 
 * Interface for creating a Growaasan message log entry.
 */
export interface GrowaasanMessageLogCreateDto {
  userId: string; // The user id of the user initiating the message.
  growaasanMessageId?: string; // Unique ID for the Growaasan message.
  templateName: string; // The name of the Growaasan message template.
  status?: string; // Current status of the Growaasan message.
  fromPhoneNumber: GrowaasanPhoneNumberDto; // Phone number from which the message is sent.
  toPhoneNumber: GrowaasanPhoneNumberDto; // Phone number to which the message is sent.
  templatePlaceholders: GrowaasanPlaceholderParamDto; // Placeholder parameters for the message template.
  contextType?: UserContextTypeEnum; // Optional context type for the message.
  contextId?: string; // Optional context ID for the message.
  createdByUserId: string; // ID of the user who created the message.
  growaasanSendMessageResponse?: GrowaasanSendMessageResponseDto; // Response received from the Growaasan cloud API to store in the Growaasan logs.
}

/**
 * GrowaasanMessageLogCreateApiDto
 * 
 * Interface for creating a Growaasan message log entry.
 */
export interface GrowaasanMessageLogCreateApiDto extends GrowaasanMessageLogCreateDto {
  userEmail: string; // The email of the user initiating the message.
}