/**
 * APP_CONSTANTS
 * 
 * These are the generic constants common for all applications/services.
 * For the application/service specific constants consider respective constant config file.
 */
const APP_CONSTANTS = {
    // Application default timezone
    APP_DEFAULT_TIMEZONE: process.env.TZ ?? "GMT",

    /**
     * Date formates
     */
    DATE_FORMAT_BASE_ERROR_TIMESTAMP: "ddd, DD MMM YYYY HH:mm:ss z", // Date format for the "BaseError.timeStamp" class property    
    MYSQL_DATE_FORMATE: "YYYY-MM-DD", // MySQL Date formates

    // This is unknow exception error message
    ERROR_MESSAGE_UNKNOWN_EXCEPTION: "Something went wrong!!!",
    ERROR_MESSAGE_REQUEST_FOR_AUTHORISED_RESOURSE_ACCESS: "",
    ERROR_MESSAGE_RESOURCE_NOT_FOUND: "The requested resource is not found with the provided details.",
};

export default APP_CONSTANTS;