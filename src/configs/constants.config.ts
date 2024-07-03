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
  ERROR_MESSAGE_RESOURCE_NOT_FOUND:
    "The requested resource is not found with the provided details.",

  /**
   * Signed URL expires in the given seconds.
   * Formula: {NUMBER OF MINUTES} * 60 [Unit: Seconds]
   */
  AWS_S3_SIGNED_URL_TO_UPLOAD_FILE_EXPIRY_IN_SECONDS: 15 * 60, // Pre-Signed url to upload the files expires in 15 minutes
  AWS_S3_SIGNED_URL_TO_VIEW_FILE_EXPIRY_IN_SECONDS: 15 * 60, // Pre-Signed url to view the files expires in 15 minutes

  /**
   * AWS S3 directory paths for different types of files.
   * @awsS3Bucket "worko-{env}"
   */
  AWS_S3_DIR_PATHS: {
    USER_RESUME: "users/{userId}/resumes", // To upload the individual user's resume
    USER_PROFILE_PIC: "users/{userId}/profilePics", // To upload the individual user's profile pics
    CAREER_RESUME: "career-resumes" // To upload the resumes uplaoded via career page
  },

  /**
   * AWS S3 file names for different types of files.
   * @awsS3Bucket "worko-{env}"
   */
  AWS_S3_FILE_NAMES: {},

  // The possible options for the page sizes that is expected in the request payload.
  PAGE_LENGTH_OPTIONS: [10, 25, 50, 100],

  // If "pageSize" from the request does not match with one of the "PAGE_LENGTH_OPTIONS" value, then this value would be used.
  PAGE_LENGTH_DEFAULT: 25,

  /**
   * AWS Lambada Configurations related to triggering "Resume Extraction" and "Matching JS Score" Lambda functions.
   */
  RESUME_EXTRACTION_LAMBDA_NAME: "resume-parser",
  MATCHING_SCORE_LAMBDA_NAME: "worko-jd-resume-matching",
  MATCHING_SCORE_PROMPT:
    "From above mentioned Resume and Job description, please match on following parameters and provide score(out of 10) and brief explanation for every parameters and also provide overall matching score.\n1. experience in year\n2. Role \n3.  skills(technical, soft and core)\n4. education\n5. industry experience\n6. responsibilities\n7. certifications\nAssistant:",

  /**
   * SOURCE_EMAIL_ADDRESS
   * 
   * Possible source email addresses & names would be used as sender while sending emails outside the application.
   * 
   * Here you may consider adding additional sources for different use cases and use them in the application.
   */
  SOURCE_EMAIL_ADDRESS: {
    WORKO_DEFAULT: {
      email: "hello@worko.ai",
      fullName: "Worko.ai"
    },
    WORKO_NO_REPLY: {
      email: "no-reply@worko.ai",
      fullName: "Worko.ai"
    },
  },

  /**
   * PROFILE_COMPLETION_PERCENTAGE
   * 
   * These are the minimum profile percentages required to complete the profile for respective dashboards.
   * 
   * If the profile is not completed with minimum percentage then the user should not be able to access the certain features of the application.
   */
  PROFILE_COMPLETION_PERCENTAGE: {
    CAND: 80,
    EMP: 80,
  },

  FRONTEND_URLS: {
    SUBS_PREMIUM_RENEW: "https://app.worko.ai/",
    SUBS_PREMIUM_UPGRADE: "https://app.worko.ai/",
  },

  SCHEDULE_JOB:{
    GROUP: "worko",
    TIME_ZONE: "Asia/Calcutta",
    LAMBDA_TRIGGER_ARN: "arn:aws:lambda:ap-south-1:787066054733:function:pankaj-test-function",
    ROLE_ARN: "arn:aws:iam::787066054733:role/worko-schedule-invoke-lambda-role"
  },
  
  WORKO_LOGO_URL: "https://worko.ai/wp-content/uploads/2023/06/footer-logo.png",

  /**
   * REFERRAL_MINIMUM_MATCHING_SCORE
   * 
   * Required constants for Referral score as matching score
   */
  REFERRAL_MINIMUM_MATCHING_SCORE: 70,

  /**
   * REFERRAL_REVIEW_ACCEPTANCE_STATUS_AFTER_X_DAYS
   * 
   * This is for the number of days after which the referral will be considered as rejected
   * as per AWAITING status.
   */
  get REFERRAL_REVIEW_ACCEPTANCE_STATUS_AFTER_X_DAYS(): number {
    return process.env.APP_SLS_STAGE === this.STAGES.PROD
    ? 5 // 5 days for production
    : 2 / 24; // 2 hours converted to days for dev
  },
};

export default APP_CONSTANTS;