/**
 * APP_CONSTANTS
 * 
 * These are the generic constants common for all applications/services.
 * For the application/service specific constants consider respective constant config file.
 */
const APP_CONSTANTS = {
    // Application default timezone
    APP_DEFAULT_TIMEZONE: process.env.TZ ?? "GMT",

    // The stages/environments supported by the application.
    STAGES: {
        LOCAL: "local",
        DEV: "dev",
        PROD: "prod",
    },

    /**
     * Date formates
     */
    DATE_FORMAT_BASE_ERROR_TIMESTAMP: "ddd, DD MMM YYYY HH:mm:ss z", // Date format for the "BaseError.timeStamp" class property    
    MYSQL_DATE_FORMATE: "YYYY-MM-DD", // MySQL Date formates

    // This is unknow exception error message
    ERROR_MESSAGE_UNKNOWN_EXCEPTION: "Something went wrong!!!",
    ERROR_MESSAGE_REQUEST_FOR_AUTHORISED_RESOURSE_ACCESS: "",
    ERROR_MESSAGE_RESOURCE_NOT_FOUND: "The requested resource is not found with the provided details.",

    /**
     * Signed URL expires in the given seconds.
     * Formula: {NUMBER OF MINUTES} * 60 [Unit: Seconds]
     */
    AWS_S3_SIGNED_URL_TO_UPLOAD_FILE_EXPIRY_IN_SECONDS: 15 * 60, // Pre-Signed url to upload the files expires in 15 minutes
    AWS_S3_SIGNED_URL_TO_VIEW_FILE_EXPIRY_IN_SECONDS: 15 * 60, // Pre-Signed url to view the files expires in 15 minutes

    /**
     * AWS S3 directory paths for different types of files.
     * @awsS3Bucket "verif-y-{env}-transcript-storage"
     */
    AWS_S3_DIR_PATHS: {
        USER_RESUME: "users/{userId}/resumes", // To upload the individual user's resume
    },

    /**
     * AWS S3 file names for different types of files.
     * @awsS3Bucket "worko-{env}"
     */
    AWS_S3_FILE_NAMES: {

    },

    // The possible options for the page sizes that is expected in the request payload.
    PAGE_LENGTH_OPTIONS: [10, 25, 50, 100],
    
    // If "pageSize" from the request does not match with one of the "PAGE_LENGTH_OPTIONS" value, then this value would be used.
    PAGE_LENGTH_DEFAULT: 25, 
};

export default APP_CONSTANTS;