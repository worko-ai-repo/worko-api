/**
 * GROWAASAN_APP_CONSTANTS
 * 
 * This object contains constants and configuration details specifically for the Growaasan WhatsApp api integration.
 */
const GROWAASAN_APP_CONSTANTS = {

  /**
   * ENABLED
   * 
   * This constant defines whether the Growaasan whatsapp send message to users is enabled or not at system level.
   */
  ENABLED: true,

   /**
    * COUNTRY_CODE
    * 
    * This constant defines the default country code for the Growaasan whatsapp integration.
    */
   COUNTRY_CODE: 91,

   /**
    * COUNTRY_CODE_WITH_PLUS_SIGN
    * 
    * This constant defines the default country code with plus sign for the Growaasan whatsapp integration.
    * 
    * NOTE : This constant is used to remove the `+91` from the `COUNTRY_CODE` 
    */
   COUNTRY_CODE_WITH_PLUS_SIGN: "+91",

   /**
    * COMMUNICATION_TYPE
    * 
    * This constant defines the default communication type for the Growaasan whatsapp integration.
    */
   COMMUNICATION_TYPE: "2",

   /**
    * DEFAULT_TEMPLATE_LANGUAGE
    * 
    * This constant defines the default template language for the Growaasan whatsapp integration.
    */
   DEFAULT_TEMPLATE_LANGUAGE: "en",
}

/**
 * GROWAASAN_CLOUD_API_ENDPOINTS
 *
 * This object contains endpoint URLs for various Growaasan Cloud API operations.
 * The URLs are parameterized and should be populated with actual values before use.
 */
const GROWAASAN_CLOUD_API_ENDPOINTS = {
  // In Near future we will add endpoints
};

// export constants
export { GROWAASAN_APP_CONSTANTS, GROWAASAN_CLOUD_API_ENDPOINTS };