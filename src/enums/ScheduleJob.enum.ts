/**
 * ScheduleJobType
 * 
 * @enum {string}
 * @description Enumeration for different types of scheduled jobs. These jobs are typically used to automate reminders and notifications within the system.
 */
export enum ScheduleJobType {
  /**
   * REFERRAL_REVIEW_ACCEPTANCE_STATUS
   * 
   * @description Scheduled job type for reviewing the acceptance status of a referral. This job triggers checks to ensure that the acceptance or rejection of referrals is properly recorded and updated.
   */
  REFERRAL_REVIEW_ACCEPTANCE_STATUS = "REFERRAL_REVIEW_ACCEPTANCE_STATUS",

  /**
   * REFERRAL_DONE_STATUS_REMINDER
   * 
   * @description Scheduled job type for sending reminder emails to users, reminding them to done a referral. This ensures that pending referral requests are not overlooked in accepted state , it reminds employee to done the referral .
   */
  REFERRAL_DONE_STATUS_REMINDER = "REFERRAL_DONE_STATUS_REMINDER",

  /**
   * EMP_WORK_EMAIL_VERIFICATION_REMINDER
   * 
   * @description Scheduled job type for sending WhatsApp reminders to employers to verify their work email. This job ensures that employers complete their email verification, which is crucial for maintaining account authenticity.
   */
  EMP_WORK_EMAIL_VERIFICATION_REMINDER = "EMP_WORK_EMAIL_VERIFICATION_REMINDER",

  /**
   * CORPORATE_BULK_JD_RESUME_SEND_EMAIL_AND_WHATSAPP_NOTIFICATIONS
   * 
   * @description Scheduled job type for sending email and WhatsApp notifications to bulk resumes candidates by corporate bulk jd id.
   */
  CORPORATE_BULK_JD_RESUME_SEND_EMAIL_AND_WHATSAPP_NOTIFICATIONS = "CORPORATE_BULK_JD_RESUME_SEND_EMAIL_AND_WHATSAPP_NOTIFICATIONS",
}

/**
 * ScheduleJobStatus
 * 
 * @enum {string}
 * @description Enumeration for the status of scheduled jobs. These statuses reflect the current state of a scheduled job, from scheduling to completion or failure.
 */
export enum ScheduleJobStatus {
  /**
   * @description Indicates that the job has been successfully scheduled and is awaiting execution. The job is in the queue and will be triggered at the specified time.
   */
  SCHEDULED = "SCHEDULED",

  /**
   * @description Indicates that the job's trigger process has successfully started. This means the scheduled job has begun execution as intended.
   */
  TRIGGER_PROCESS_SUCCESS = "TRIGGER_PROCESS_SUCCESS",

  /**
   * @description Indicates that the job's trigger process failed to start. This could be due to system errors or issues in the job's configuration, requiring intervention to retry or reschedule.
   */
  TRIGGER_PROCESS_FAILED = "TRIGGER_PROCESS_FAILED",

  /**
   * @description Indicates that the job has failed during its execution. The failure could be due to various reasons such as network issues, system errors, or invalid job parameters.
   */
  FAILED = "FAILED",

  /**
   * @description Indicates that the job has been completed successfully. The job has executed all its tasks and processes as expected without errors.
   */
  COMPLETED = "COMPLETED"
}
