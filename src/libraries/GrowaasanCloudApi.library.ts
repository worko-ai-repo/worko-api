// import axios library for making HTTP requests
import axios, { AxiosResponse } from "axios";

// import constants
import { GROWAASAN_APP_CONSTANTS } from "../configs/constants/Growaasan.constant";

// import dtos
import { GrowaasanMessageSendCloudApiDto, GrowaasanMessageSendCloudApiQueryParamDTO } from "../dtos/Growaasan.dto";

/**
 * GrowaasanCloudApiLibrary
 */
class GrowaasanCloudApiLibrary {
  /**
   * @private - Private properties for the Growaasan Cloud API
   * @property {string} baseUrl - The base URL for the Growaasan Cloud API, retrieved from the environment variable `APP_GROWAASAN_CLOUD_API_BASE_URL`.
   * @property {string} clientId - The client ID for the Growaasan Cloud API, retrieved from the environment variable `APP_GROWAASAN_CLOUD_API_CLIENT_ID`.
   * @property {string} authKey - The authentication key used for accessing the Growaasan Cloud API, retrieved from the environment variable `APP_GROWAASAN_CLOUD_API_AUTHENTICATION_KEY`.
   */
  private baseUrl: string;
  private clientId: string;
  private authKey: string;
  
  constructor() {
    /**
     * Initializes a new instance of the GrowaasanCloudApiLibrary.
     * Sets up the necessary configuration from environment variables.
     */
    this.baseUrl = process.env.APP_GROWAASAN_CLOUD_API_BASE_URL as string;
    this.clientId = process.env.APP_GROWAASAN_CLOUD_API_CLIENT_ID as string;
    this.authKey = process.env.APP_GROWAASAN_CLOUD_API_AUTHENTICATION_KEY as string;
  }

  /**
   * sendTemplateMessage
   * 
   * Sends a template message using the Growaasan Cloud API
   * 
   * @param {GrowaasanMessageSendCloudApiDto} sendTemplateMessage - The object containing the template message details
   * @throws {Error} - Throws an error if there's an issue with the request
   */
  async sendTemplateMessage(
    sendTemplateMessage: GrowaasanMessageSendCloudApiDto
  ) {
    try {
      global.logger.info("send template message [library]", {
        filePath: __filename,
        methodName: this.sendTemplateMessage.name,
      });

      /**
       * apiQueryParams
       *
       * Build the query parameters for the Growaasan Cloud API
       */
      const apiQueryParams: GrowaasanMessageSendCloudApiQueryParamDTO = {
        /**
         * @todo: Here the spelling `clietnId` is not appropriate, but the `Growaasan` team provided in that way,
         * Need to discuss with `Growaasan` team to use the spelling appropriately like `clientId`
         */
        clietnId: this.clientId,
        authKey: this.authKey,
        communicationType: GROWAASAN_APP_CONSTANTS.COMMUNICATION_TYPE,
        waTemplateName: sendTemplateMessage.templateName,
        waTemplateLang: sendTemplateMessage.templateLang ?? GROWAASAN_APP_CONSTANTS.DEFAULT_TEMPLATE_LANGUAGE,
        country_code: sendTemplateMessage.countryCode ?? GROWAASAN_APP_CONSTANTS.COUNTRY_CODE.toString(),
        customerMobile: sendTemplateMessage.customerMobile,
        varCount: sendTemplateMessage.varCount,
      };
      console.log("apiQueryParams: ", apiQueryParams);

      /**
       * queryParams
       *
       * Create URLSearchParams instance to handle the query parameters
       * @see https://nodejs.org/api/url.html#class-urlsearchparams
       *
       *
       * The expression `apiQueryParams as unknown as Record<string, string>` is used in TypeScript
       * when you want to bypass type checks and enforce a specific type on an object.
       *
       * ### Reasons for Using `as unknown as`:-
       * 1. Bypassing Type Constraints: Sometimes, TypeScript’s type inference might not recognize that an object conforms to a specific type,
       * even if you know it does. By first casting the object to unknown, you essentially tell TypeScript to ignore the type checking on that object temporarily.
       *
       * 2. Type Safety for the Next Assertion: After casting to unknown, you can then cast to your desired type (Record<string, string> in this case).
       * This two-step process allows you to enforce that the object should be treated as a record with string keys and values,
       * without TypeScript throwing errors about the initial type.
       *
       * 3. Flexibility with External Libraries: If you’re working with data from external libraries or APIs where the types might not be well-defined or are too broad (like any),
       * using unknown can help you safely narrow down the type for your specific use case.
       *
       *
       * SAMPLE OUTPUT for `queryParams`:
       * `clietnId=12345&authKey=abcdef&communicationType=2&waTemplateName=signup_emp&waTemplateLang=en&country_code=91&customerMobile=9876543210&varCount=2`
       */
      const queryParams: string = new URLSearchParams(
        apiQueryParams as unknown as Record<string, string>
      ).toString();
      console.log("queryParams: ", queryParams);

      /**
       * endpoint
       *
       * Construct the endpoint URL with the query parameters
       *
       * SAMPLE OUTPUT for `endpoint`:
       * `https://api.growaasan.com/api/sendPosCommunication?clietnId=12345&authKey=abcdef&communicationType=2&waTemplateName=signup_emp&waTemplateLang=en&country_code=91&customerMobile=9876543210&varCount=2`
       */
      // @todo this "sendPosCommunication" should be read from the constant.
      const endpoint: string = `${this.baseUrl}/sendPosCommunication?${queryParams}`;
      console.log("endpoint: ", endpoint);

      /**
       * variableParams
       *
       * Build the variable parameters for the message
       *
       * SAMPLE OUTPUT for `variableParams`:
       * `var1=value1&var2=value2`
       */
      let variableParams: string = sendTemplateMessage.variables
        .map((value, index) => `var${index + 1}=${value}`)
        .join("&");
      console.log("variableParams: ", variableParams);

      // Build the final URL with the variable parameters
      // @todo prepare the all the query params in one go, you may prepare the object with all possible keys and values, and finally convert it to query string.
      const finalUrl: string = `${endpoint}&${variableParams}&messageType=${
        sendTemplateMessage.messageType
      }${
        sendTemplateMessage.mediaUrl
          ? `&mediaUrl=${sendTemplateMessage.mediaUrl}`
          : ""
      }`;
      console.log("finalUrl: ", finalUrl);

      /**
       * Send the request to the Growaasan Cloud API
       *
       * @todo: We are using `get` instead of `post` for sending template messages, which is
       * not a good practice. We should use `post` instead, but the `post` method is not supported
       * by the Growaasan Cloud API. Need to check with the Growaasan Cloud API team and use the appropriate method.
       */
      const response: AxiosResponse<any, any> = await axios.get(finalUrl);

      // return the response data
      return response.data;
    } catch (error) {
      console.error("Error sending template message:", error);
      throw error;
    }
  }
}

// Create an instance of the GrowaasanCloudApiLibrary class
let growaasanCloudApiLibraryObj = new GrowaasanCloudApiLibrary();

// Export an instance of the GrowaasanCloudApiLibrary class and the GrowaasanCloudApiLibrary class
export { growaasanCloudApiLibraryObj, GrowaasanCloudApiLibrary };