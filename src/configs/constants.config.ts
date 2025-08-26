/**
 * APP_CONSTANTS
 *
 * These are the generic constants common for all applications/services.
 * For the application/service specific constants consider respective constant config file.
 */
const APP_CONSTANTS = {
  // Application default timezone
  APP_DEFAULT_TIMEZONE: process.env.TZ ?? "GMT",

  // Application stage
  APP_SLS_STAGE: process.env.APP_SLS_STAGE,

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
    CAREER_RESUME: "career-resumes", // To upload the resumes uplaoded via career page
    COMPANY_JOB_DESCRIPTION: "companies/{companyId}/company-job-descriptions", // To upload the company job description uplaoded via `corporate dashboard` or `admin dashboard`
    BULK_CVS: "companies/{companyId}/bulk-cvs/{corporateBulkJdId}", // To upload the bulk cvs uplaoded via `corporate dashboard` or `admin dashboard`

    /**
     * @NOTE:
     *  1. Currently, company logos are being stored in the following S3 path:
     *     "worko-ui-comp-logo-{dev|prod}/images/"
     *     This is not an ideal structure for storing company logos. However, since this path is already in use
     *     and contains existing logos, we are continuing to use it to maintain backward compatibility.
     *
     *  2. The ideal S3 path structure should be:
     *     worko-ui-comp-logo-{dev|prod}/companies/{companyId}/{companyLogoFileName}
     *     This structure ensures better organization and scalability but don't update the existing structure.
     */
    COMPANY_LOGO: "images",

    /**
     * BLOG_IMAGE
     * 
     * To store the blog cover images
     */
    BLOG_IMAGE: "blog-images",
  },

  /**
   * AWS S3 file names for different types of files.
   * @awsS3Bucket "worko-{env}"
   */
  AWS_S3_FILE_NAMES: {},

  // The possible options for the page sizes that is expected in the request payload.
  PAGE_LENGTH_OPTIONS: [10, 25, 50, 100, 150, 200],

  // If "pageSize" from the request does not match with one of the "PAGE_LENGTH_OPTIONS" value, then this value would be used.
  PAGE_LENGTH_DEFAULT: 25,

  LAMBDA_FUNCTION_NAMES: {
    /**
     * RESUME_EXTRACTION_LAMBDA_NAME
     *
     * Lambda function name for "Resume Extraction"
     * AWS Lambada Configurations related to triggering "Resume Extraction"
     */
    RESUME_EXTRACTION_LAMBDA_NAME: "resume-parser",

    /**
     * MATCHING_SCORE_LAMBDA_NAME
     *
     * Lambda function name for "Matching Score"
     * AWS Lambada Configurations related to triggering "Matching Score"
     */
    MATCHING_SCORE_LAMBDA_NAME: "worko-jd-resume-matching",

    /**
     * JOB_DESCRIPTION_PARSER_LAMBDA_NAME
     *
     * Lambda function name for "Job Description Parser"
     * AWS Lambada Configurations related to triggering "Job Description Parser"
     */
    JOB_DESCRIPTION_PARSER_LAMBDA_NAME: "worko-job-description-parser",
  },

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
      fullName: "Worko.ai",
    },
    WORKO_NO_REPLY: {
      email: "no-reply@worko.ai",
      fullName: "Worko.ai",
    },
    GUIDANCE_EMAIL: {
      email: "guidance@worko.ai",
      fullName: "Worko.ai",
    },
    WORKO_PRODUCT_MANAGERS: {
      Jeetesh: {
        email: "jeetesh@worko.ai",
        fullName: "Worko.ai",
      },
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
    SUBS_PREMIUM_RENEW: "https://worko.ai/", // Previously "https://app.worko.ai/",
    SUBS_PREMIUM_UPGRADE: "https://worko.ai/", // Previously "https://app.worko.ai/",
    CORP_LOGIN: `${process.env.APP_WORKO_FRONTEND_BASE_URL}/v1/auth/corporate/login`,
    CORP_SIGNUP: `${process.env.APP_WORKO_FRONTEND_BASE_URL}/v1/auth/corporate/signup/{token}`,
    WORKO_LOGO_URL:
      "https://worko.ai/wp-content/uploads/2023/06/footer-logo.png",
  },

  FRONTEND_ORIGINS: {
    PROD: [
      "https://worko.ai",
    ],
    DEV: [
      "https://dev-ui.worko.work", 
      "https://dev.worko.work",    
      "http://localhost:4200",
      "http://localhost:8080",
      "http://localhost:3001", 
      "http://localhost:3002",  
    ],
  },

  /**
   * COGNITO_READABLE_GROUPS
   *
   * This is the readable groups of the cognito user
   * which is used in the email body to be sent to the end user
   */
  COGNITO_READABLE_GROUPS: {
    WORKO_ADMIN: "Admin",
    CORPORATE_ADMIN: "Corporate Admin",
    CORPORATE_RECRUITER: "Corporate Recruiter",
  },

  SCHEDULE_JOB: {
    GROUP: "worko",
    TIME_ZONE: "Asia/Calcutta",
    LAMBDA_TRIGGER_ARN:
      "arn:aws:lambda:ap-south-1:787066054733:function:pankaj-test-function",
    ROLE_ARN:
      "arn:aws:iam::787066054733:role/worko-schedule-invoke-lambda-role",
  },

  /**
   * MATCHING_SCORES
   */
  MATCHING_SCORES: {
    /**
     * REFERRAL_MINIMUM_MATCHING_SCORE
     *
     * Required constants for Referral score as matching score
     */
    REFERRAL_MINIMUM_MATCHING_SCORE: 70,

    /**
     * CORPORATE_BULK_JD_RESUME_MINIMUM_MATCHING_SCORE
     * 
     * Whenever the corporate admin/recruiter uploads resumes for a particular job description, this is the minimum matching score required for
     * the candidate to be selected.
     */
    CORPORATE_BULK_JD_RESUME_MINIMUM_MATCHING_SCORE: 70,
  },

  /**
   * REFERRAL_REVIEW_ACCEPTANCE_STATUS_AFTER_X_HOURS
   *
   * This is the number of hours after which the referral will be considered as rejected
   * if still in AWAITING status.
   */
  get REFERRAL_REVIEW_ACCEPTANCE_STATUS_AFTER_X_HOURS(): number {
    const PROD_HOURS = 7 * 24; // 7 days converted to hours
    const DEV_HOURS = 45 / 60; // 45 minutes converted to hours
    // return the time based on the environment
    return this.APP_SLS_STAGE === this.STAGES.PROD
      ? PROD_HOURS
      : DEV_HOURS;
  },

  /**
   * CORPORATE_BULK_JD_RESUME_SEND_EMAIL_AND_WHATSAPP_NOTIFICATIONS_AFTER_X_MINUTES
   *
   * This is the number of minutes after which the email and whatsapp notifications will be sent
   * to the candidates for bulk resumes upload by particular job description.
   *
   * The time is different in prod and dev environments.
   * In prod, the time is 10 minutes.
   * In dev, the time is 10 minutes.
   */
  get CORPORATE_BULK_JD_RESUME_SEND_EMAIL_AND_WHATSAPP_NOTIFICATIONS_AFTER_X_MINUTES(): number {
    const PROD_MINUTES = 10; // 10 minutes
    const DEV_MINUTES = 5; // 5 minutes

    // return the time based on the environment
    return this.APP_SLS_STAGE === this.STAGES.PROD
      ? PROD_MINUTES
      : DEV_MINUTES;
  },

  /**
   * SOCIAL_PROFILE_KEYS
   *
   * These are the keys for the social profiles, we are currently used for profile percentage logic,
   * we can add more in the future if those were updated in `UserSocialProfileDTO`(refer `UserSocialProfile.dto.ts` file).
   */
  SOCIAL_PROFILE_KEYS: ["twitter", "github", "linkedin"],

  /**
   * CORPORATE_USER_INVITE_DATE_EXPIRATION
   *
   * This constant defines the duration in days for which a corporate user invite remains valid.
   * The duration is determined based on the current environment:
   * - Production (PROD): 15 days
   * - Development/Testing: 1 day
   *
   * @returns {number} - The expiration duration in days.
   */
  get CORPORATE_USER_INVITE_DATE_EXPIRATION(): number {
    const PROD_DAYS = 15; // 15 days
    const DEV_DAYS = 15; // 15 days

    // return the time based on the environment
    return this.APP_SLS_STAGE === this.STAGES.PROD
      ? PROD_DAYS
      : DEV_DAYS;
  },

  /**
   * Cognito Identity Pool Groups
   * * ADMIN
   * * CORPORATE-ADMIN
   * * CORPORATE-RECRUITER
   */
  COGNITO_IDENTITY_POOL_GROUPS: {
    ADMIN: "admin",
    CORPORATE_ADMIN: "corporate-admin",
    CORPORATE_RECRUITER: "corporate-recruiter",
  },

  // Worko App Domain
  WORKO_APP_DOMAIN: "www.worko.ai.",
};

export default APP_CONSTANTS;