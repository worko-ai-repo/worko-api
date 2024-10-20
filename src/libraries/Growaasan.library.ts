// import the required types
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// import the DTOs
import { GrowaasanMessageSendCloudApiDto, GrowaasanPhoneNumberDto } from "../dtos/Growaasan.dto";
import { GrowaasanMessageLogCreateApiDto } from "../dtos/GrowaasanMessageLog.dto";
import { GrowaasanPlaceholderParamDto } from "../dtos/GrowaasanTemplatePlaceholder.dto";

// import the enums
import { GrowaasanTemplateNameEnum } from "../enums/GrowaasanTemplate.enum";
import { UserContextTypeEnum } from "../enums/User.enum";
import { GrowaasanMessageEnum } from "../enums/Growaasan.enum";
import { GrowaasanMessageStatusEnum } from "../enums/GrowaasanMessageLog.enum";
import { WhatsappTemplateStatusEnum } from "../enums/WhatsappTemplate.enum";

// import the libraries
import { growaasanCloudApiLibraryObj } from "./GrowaasanCloudApi.library";

// import the models
import { DbWhatsappTemplateDto } from "../db/models/WhatsappTemplate.model";
import { DbUserDetailDto } from "../db/models/UserDetail.model";
import { DbGrowaasanMessageLogDto } from "../db/models/GrowaasanMessageLog.model";

// import the services
import { whatsappTemplateServiceObj } from "../services/WhatsappTemplate.service";
import UserDetailService from "../services/UserDetail.service";
import { growaasanMessageLogServiceObj } from "../services/GrowaasanMessageLog.service";

// import the utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 * GrowaasanLibrary
 * 
 * This class provides methods for sending WhatsApp messages using the Growaasan cloud API.
 * It encapsulates functionalities related to sending WhatsApp messages using templates and managing logs of those messages.
 * The library serves as a wrapper around the Growaasan cloud API, simplifying the process of sending template-based messages
 * and maintaining a record of all sent messages for tracking and analysis purposes.
 */
class GrowaasanLibrary {
  /**
   * sendGrowaasanWhatsappMessage
   *
   * Sends a WhatsApp message to a user using a Growaasan API.
   *
   * @param templateName - The name of the Growaasan template to use for sending the message.
   * @param userEmail - The email address of the user to send the message to.
   * @param toPhoneNumber - The phone number of the user to send the message to.
   * @param templatePlaceholders - An object containing the placeholder values to be replaced in the template.
   * @param contextType - The type of context for the message (optional).
   * @param contextId - The ID of the context for the message (optional).
   * @param fromPhoneNumber - The phone number to send the message from (optional). If not provided, it will be sourced from environment variables.
   * @returns {Promise<{ growaasanMessageId: string | null | undefined; systemLogId: string | null }>} An object containing the ID of the sent message and the ID of the system log entry.
   * @throws {BaseError} If the user is not found or the message is not sent successfully.
   */
  async sendGrowaasanWhatsappMessage(
    templateName: GrowaasanTemplateNameEnum,
    userEmail: string,
    toPhoneNumber: GrowaasanPhoneNumberDto,
    templatePlaceholders: GrowaasanPlaceholderParamDto,
    contextType?: UserContextTypeEnum,
    contextId?: string,
    fromPhoneNumber?: GrowaasanPhoneNumberDto
  ): Promise<{
    growaasanMessageId: string | null | undefined;
    systemLogId: string | null;
  }> {
    global.logger.info(
      "Send growaasan whatsapp message using `sendGrowaasanWhatsappMessage` function [library]",
      {
        filePath: __filename,
        methodName: this.sendGrowaasanWhatsappMessage.name,
      }
    );

    // Retrieve the Growaasan WhatsApp template details and If not found, log the message and return appropriate response
    let growaasanTemplateDetails: DbWhatsappTemplateDto = await whatsappTemplateServiceObj.getWhatsappTemplateByName(templateName);
    if (!growaasanTemplateDetails) {
      global.logger.info(
        `WhatsApp template with name "${templateName}" not found.`,
        {
          filePath: __filename,
          methodName: this.sendGrowaasanWhatsappMessage.name,
        }
      );
      return {
        growaasanMessageId: null,
        systemLogId: null,
      };
    }

    // Check if the status is not ENABLED and if it was not enabled, log the message and return appropriate response
    if (
      growaasanTemplateDetails.status !== WhatsappTemplateStatusEnum.ENABLED
    ) {
      // Logger message
      global.logger.info(
        `Unable to send the "${templateName}" because growaasan template is disabled or soft deleted in database."`,
        {
          filePath: __filename,
          methodName: this.sendGrowaasanWhatsappMessage.name,
        }
      );

      return {
        growaasanMessageId: null,
        systemLogId: null,
      };
    }

    // Prepare the Growaasan WhatsApp template message data to be sent
    const sendTemplateMessage: GrowaasanMessageSendCloudApiDto = {
      templateName: growaasanTemplateDetails.whatsappTemplateName, // Name of the WhatsApp template
      templateLang: growaasanTemplateDetails.whatsappLanguage, // Language for the template (e.g., 'en')

      /**
       * Country code without the '+' sign (e.g., '91')
       */
      countryCode: toPhoneNumber.countryCode.toString(),

      customerMobile: toPhoneNumber.phoneNumber.toString(), // Customer's mobile number
      varCount: Object.keys(templatePlaceholders).length.toString(), // Number of variables to be replaced in the template
      variables: Object.values(templatePlaceholders), // Array of variables to be inserted into the template

      /**
       * Type of message to be sent
       * @todo: Discuss with team lead like we need to use dynamic message type here from parameters
       */
      messageType: GrowaasanMessageEnum.TEXT,
    };

    /**
     * Send the WhatsApp template message to the customer using the Growaasan cloud API
     *
     * Sample success output of `growaasanTemplateSendMessage`:
     * {
     *  status: 1,
     *  message: 'Message sent successfully',
     *  whatsapp_uniqueid: '{"status":"success","message":"Message Sent Successfully","whatsapp_uniqueid":"wamid.HBgMOTE5NjY2MzA4MTAwFQIAERgSQTExRDYxMDU4RkVGRDQ5MDdGAA=="}'
     * }
     * 
     * @todo add sample failure response;
     * @todo add sample exception response;
     */
    const growaasanTemplateSendMessage = await growaasanCloudApiLibraryObj.sendTemplateMessage(
      sendTemplateMessage
    );
    console.log("growaasanTemplateSendMessage=", growaasanTemplateSendMessage);

    // @todo This code can be improved by checking the status first then based on the status check other fields like whatsapp_uniqueid.
    // Kindly make the required changes for this.
    let growaasanMessageId: string | undefined;
    let growaasanWhatsappUniqueIdStatus: string | undefined; // success or failed
    if (growaasanTemplateSendMessage.whatsapp_uniqueid) {
      // Parse the 'whatsapp_uniqueid' JSON string present in the `growaasanTemplateSendMessage` object
      const parsedData = JSON.parse(
        growaasanTemplateSendMessage.whatsapp_uniqueid
      );

      /**
       * Retrieve the 'whatsapp_uniqueid' value from parsed data
       *
       * Sample Output for `growaasanMessageId`: wamid.HBgMOTE5NjY2MzA4MTAwFQIAERgSQTExRDYxMDU4RkVGRDQ5MDdGAA==
       */
      growaasanMessageId = parsedData.whatsapp_uniqueid.toString();
      growaasanWhatsappUniqueIdStatus = parsedData.status.toString(); // success or failed
    }

    let growaasanMessageLogStatus: string | undefined;
    if (growaasanTemplateSendMessage.status === 1) {
      switch (growaasanWhatsappUniqueIdStatus) {
        case GrowaasanMessageStatusEnum.SUCCESS:
          growaasanMessageLogStatus = GrowaasanMessageStatusEnum.SUCCESS;
          break;
        case GrowaasanMessageStatusEnum.FAILED:
          growaasanMessageLogStatus = GrowaasanMessageStatusEnum.FAILED;
        default :
          growaasanMessageLogStatus = growaasanWhatsappUniqueIdStatus;
      }
    } else if (growaasanTemplateSendMessage.status === 0) {
      growaasanMessageLogStatus = GrowaasanMessageStatusEnum.FAILED;
    }

    /**
     * finalFromPhoneNumber
     *
     * Initializes the variable `finalFromPhoneNumber` with the type `GrowaasanPhoneNumberDto`.
     * This object will contain both the `countryCode` and `phoneNumber` properties.
     *
     * @type {GrowaasanPhoneNumberDto} finalFromPhoneNumber - An object containing the phone number details.
     */
    let finalFromPhoneNumber: GrowaasanPhoneNumberDto;

    // Set the `finalFromPhoneNumber` variable based on the provided `fromPhoneNumber` parameter
    if (fromPhoneNumber) {
      finalFromPhoneNumber = fromPhoneNumber;
    } else {
      /**
       * Set the `finalFromPhoneNumber` variable based on the environment variables
       * 
       * The `countryCode` is parsed from the environment variable
       * `APP_GROWAASAN_CLOUD_API_FROM_PHONE_NUMBER_COUNTRY_CODE`, and the `phoneNumber`
       * is parsed from the environment variable `APP_GROWAASAN_CLOUD_API_FROM_PHONE_NUMBER`.
       */
      finalFromPhoneNumber = {
        countryCode: parseInt(
          process.env
            .APP_GROWAASAN_CLOUD_API_FROM_PHONE_NUMBER_COUNTRY_CODE as string
        ),
        phoneNumber: parseInt(
          process.env.APP_GROWAASAN_CLOUD_API_FROM_PHONE_NUMBER as string
        ),
      };
    }

    // Retrieve user details using the provided email
    // @todo this code can be moved in the begining before actually sending the whatsapp message for simplicity
    let userDetails: QueryResponse<DbUserDetailDto> = await UserDetailService.get(userEmail);
    if (!userDetails.count) {
      global.logger.info("If user not found", {
        filePath: __filename,
        methodName: this.sendGrowaasanWhatsappMessage.name,
        userEmail: userEmail,
      });
      throw new BaseError(
        `User with email "${userEmail}" not found.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    // Create a log entry for the sent message
    const growaasanMessagelogEntry: GrowaasanMessageLogCreateApiDto = {
      userEmail,
      userId: userDetails[0].id,
      growaasanMessageId,
      templateName,
      status: growaasanMessageLogStatus,
      fromPhoneNumber: finalFromPhoneNumber,
      toPhoneNumber: {
        countryCode: toPhoneNumber.countryCode, // Customer's country code
        phoneNumber: toPhoneNumber.phoneNumber, // Customer's mobile number
      },
      templatePlaceholders,
      contextType,
      contextId,
      createdByUserId: userDetails[0].id,
      growaasanSendMessageResponse: {
        status: growaasanTemplateSendMessage.status,
        message: growaasanTemplateSendMessage.message.toString(),
        whatasappUniqueId: growaasanTemplateSendMessage.whatsapp_uniqueid
          ? growaasanTemplateSendMessage.whatsapp_uniqueid.toString()
          : undefined, // The growaasan sending `whatsapp_uniqueid` as `number` type instead of `string` sometimes, so we need to convert it to `string`
        growaasanException: typeof growaasanTemplateSendMessage === "object",
      },
    };

    /**
     * After the whatsapp message is sent to user from growaasan, create a log entry in the database.
     * Because we want to store the log entry in the database to be track the sent message from growaasan to user.
     * This will help us to know how many messages are sent to each user.
     */
    const growaasanMessageLog: DbGrowaasanMessageLogDto = await growaasanMessageLogServiceObj.createGrowaasanMessageLog(
      growaasanMessagelogEntry
    );
    console.log("growaasanMessageLog=", growaasanMessageLog);

    return {
      growaasanMessageId: growaasanMessageLog.growaasanMessageId,
      systemLogId: growaasanMessageLog.id,
    };
  }
}

// create an instance of the GrowaasanLibrary class
const growaasanLibraryObj = new GrowaasanLibrary();

// Export an instance of the GrowaasanLibrary class and the GrowaasanLibrary class
export { growaasanLibraryObj, GrowaasanLibrary }