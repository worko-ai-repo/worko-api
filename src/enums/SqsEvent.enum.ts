/**
 * Enum representing the different types of SQS message events.
 *
 * @enum {SqsMsgEventEnum}
 */
export enum SqsMsgEventEnum {
  /**
   * Event type for sending a welcome email to a user.
   */
  USER_SEND_WELCOME_EMAIL = "USER_SEND_WELCOME_EMAIL",

  /**
   * Event type for validating the matching score of a referral.
   */
  REFERRAL_VALIDATE_MATCHING_SCORE = "REFERRAL_VALIDATE_MATCHING_SCORE",
  
  /**
   * Event type for validating the matching score of a referral.
  *
  * This event is triggered during the review process to determine if the referral's
  * acceptance status is valid based on the matching score criteria.
  */
 REFERRAL_REVIEW_ACCEPTANCE_STATUS = "REFERRAL_REVIEW_ACCEPTANCE_STATUS",

 /**
  * CORPORATE_BULK_JD_RESUME_SEND_EMAIL_AND_WHATSAPP_NOTIFICATIONS
  * 
  * Event type for sending email and whatsapp notification for corporate bulk JD resume upload.
  * 
  * When corporate admin/recruiter or worko-admin upload a bulk resumes for a particular job description, 
  * And after the process of matching is done, then this event will be triggered to send email and whatsapp notification
  * to the candidate(Who is not registered user on worko).
  */
 CORPORATE_BULK_JD_RESUME_SEND_EMAIL_AND_WHATSAPP_NOTIFICATION = "CORPORATE_BULK_JD_RESUME_SEND_EMAIL_AND_WHATSAPP_NOTIFICATION",

 /**
  * USER_SEND_WELCOME_EMAIL_AND_WHATSAPP_NOTIFICATION
  * 
  * Whenever a user signs up and verifies his email using one time password (OTP), 
  * then In `worko-api-cognito-post-confirmation-trigger` lambda function will trigger this SQS event to send email and whatsapp welcome notification to the user.
  */
 USER_SEND_WELCOME_EMAIL_AND_WHATSAPP_NOTIFICATION = "USER_SEND_WELCOME_EMAIL_AND_WHATSAPP_NOTIFICATION"
}