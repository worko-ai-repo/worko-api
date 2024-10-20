// import types
import { GrowaasanMessageType } from "../types/Growaasan.type";

/**
 * GrowaasanMessageSendCloudApiDto
 * 
 * This interface defines the structure for sending a WhatsApp message using the Growaasan cloud API.
 */
export interface GrowaasanMessageSendCloudApiDto {
  templateName: string; // Name of the WhatsApp template
  templateLang: string; // Language for the template (e.g., 'en')
  countryCode: string; // Country code without the '+' sign
  customerMobile: string; // Customer's mobile number
  varCount: string; // Number of variables to be replaced in the template
  variables: string[]; // Array of variables to be inserted into the template
  messageType: GrowaasanMessageType; // Type of message
  mediaUrl?: string; // Optional: URL for the media
}

/**
 * GrowaasanMessageSendCloudApiQueryParamDTO
 * 
 * This interface defines the structure for the query parameters for sending a WhatsApp message using the Growaasan cloud API.
 */
export interface GrowaasanMessageSendCloudApiQueryParamDTO {
  /**
   * clietnId
   * 
   * @todo: Here the spelling `clietnId` is not appropriate, but the `Growaasan` team expect in that way,
   * Need to discuss with `Growaasan` team to use the spelling appropriately like `clientId`
   */
  clietnId: string;  
  authKey: string;
  communicationType: string;
  waTemplateName: string;
  waTemplateLang: string;
  country_code: string;
  customerMobile: string;
  varCount: string;
}

/**
 * GrowaasanPhoneNumberDto
 * 
 * This interface is used as below:
 * - passing as `arguments` and `parameters` in functions
 * - used for storing in Growaasan Log dto 
 * - but not used for sending request to growaasan cloud api  
 */
export interface GrowaasanPhoneNumberDto {
  countryCode: number; // Country code without the '+' sign like `91` for India
  phoneNumber: number; // Customer's mobile number
}

/**
 * GrowaasanSendMessageResponseDto
 * 
 * This interface defines the structure for the response received from the Growaasan cloud API to store in the Growaasan logs.
 */
export interface GrowaasanSendMessageResponseDto {
  status?: number;
  message?: string;
  whatasappUniqueId?: string;
  growaasanException?: boolean;
}
