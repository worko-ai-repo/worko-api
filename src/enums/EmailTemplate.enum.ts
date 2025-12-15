/**
 * EmailTemplateStatus
 *
 * Description: Enum representing the possible statuses of a Email Template.
 */
export enum EmailTemplateStatusEnum {
  ENABLED = "ENABLED",
  DISABLED = "DISABLED",
}

export enum EmailTemplateEnum {
  CAND_REFERRAL_REQ_ACCEPTED = "CAND_REFERRAL_REQ_ACCEPTED",
  CAND_REFERRAL_REQ_COMPLETED = "CAND_REFERRAL_REQ_COMPLETED",
  CAND_WELCOME_MSG = "CAND_WELCOME_MSG",
  CAND_PROFILE_COMPLETION_REMINDER = "CAND_PROFILE_COMPLETION_REMINDER",

  CAND_PREMIUM_UPGRADE_NOTIFICATION = "CAND_PREMIUM_UPGRADE_NOTIFICATION",
  CAND_PROFILE_SWITCH_NOTIFICATION = "CAND_PROFILE_SWITCH_NOTIFICATION",

  CAND_PREMIUM_EXPIRED_NOTIFICATION = "CAND_PREMIUM_EXPIRED_NOTIFICATION",

  EMP_WELCOME_MSG = "EMP_WELCOME_MSG",
  EMP_PROFILE_COMPLETION_REMINDER = "EMP_PROFILE_COMPLETION_REMINDER",
  EMP_RECEIVED_REFERRAL_REQ_NOTIFICATION = "EMP_RECEIVED_REFERRAL_REQ_NOTIFICATION",
  EMP_ACCEPTED_REFERRAL_REQ_NOTIFCATION = "EMP_ACCEPTED_REFERRAL_REQ_NOTIFCATION",
  EMP_REFFERAL_DONE_FOR_CAND = "EMP_REFFERAL_DONE_FOR_CAND",

  EMP_SWITCH_PROFILE_NOTIFICATION = "EMP_SWITCH_PROFILE_NOTIFICATION",
  EMP_REVIEW_RATING_BY_CAND = "EMP_REVIEW_RATING_BY_CAND",
  EMP_QUERY_FOR_REFERRAL_BY_CAND = "EMP_QUERY_FOR_REFERRAL_BY_CAND",

  USER_WORK_EMAIL_VERIFICATION_OTP = "USER_WORK_EMAIL_VERIFICATION_OTP",
  USER_CORPORATE_REQUEST_EMAIL_OTP = "USER_CORPORATE_REQUEST_EMAIL_OTP",

  CAND_FORCE_CHANGE_PASSWORD_EMAIL_VERIFICATION_OTP = "CAND_FORCE_CHANGE_PASSWORD_EMAIL_VERIFICATION_OTP",

  /**
   * The template name used when a candidate's referral is automatically cancelled
   * after a specified number of days.
   */
  CAND_REF_AUTO_CANCEL_AFTER_X_DAYS = "CAND_REF_AUTO_CANCEL_AFTER_X_DAYS",

  /**
   * The template name used when a candidate's referral is automatically rejected
   * after a specified number of days.
   */
  CAND_REF_AUTO_REJECT_AFTER_X_DAYS = "CAND_REF_AUTO_REJECT_AFTER_X_DAYS",

  /**
   * The template name used when a worko employee wants to add new user as a company admin.
   */
  CORP_ADMIN_ACCESS_INVITE = "CORP_ADMIN_ACCESS_INVITE",

  /**
   * The template name used when a worko user signs up as a corporate user.
   */
  CORP_USER_SUCCESSFUL_SIGNUP = "CORP_USER_SUCCESSFUL_SIGNUP",

  /**
   * The template name used whenever a corporate user screens a job description for bulk resumes of candidates for high matching scores.
   */
  CAND_CORPORATE_BULK_JD_RESUME_HIGH_MATCHING_SCORE = "CAND_CORPORATE_BULK_JD_RESUME_HIGH_MATCHING_SCORE",

  /**
   * The template name used whenever a corporate user screens a job description for bulk resumes of candidates for low matching scores.
   */
  CAND_CORPORATE_BULK_JD_RESUME_LOW_MATCHING_SCORE = "CAND_CORPORATE_BULK_JD_RESUME_LOW_MATCHING_SCORE",

  /**
   * USER_GUIDANCE_REQUEST
   *
   * The template name used to send an email to "worko admin" and "candidate" when a candicate sends guidance request.
   */
  USER_GUIDANCE_REQUEST = "USER_GUIDANCE_REQUEST",

  /**
   * WORKO_ADMIN_CORPORATE_REQUEST
   *
   * The template name used to send an email to "worko admin" when a corporate user sends a request.
   *
   * @reference https://worko.ai/corporate
   */
  WORKO_ADMIN_CORPORATE_REQUEST = "WORKO_ADMIN_CORPORATE_REQUEST",

  /**
   * CAND_USER_GUIDANCE_REQUEST_MENTOR_ASSIGNED_UPDATE_STATUS
   *
   * The template name used to send an email to "candidate" when the "worko-admin" assign a mentor(employee) to candidate guidance request.
   */
  CAND_USER_GUIDANCE_REQUEST_MENTOR_ASSIGNED_UPDATE_STATUS = "CAND_USER_GUIDANCE_REQUEST_MENTOR_ASSIGNED_UPDATE_STATUS",

  /**
   * The template name used to send an email to candidate, when the worko-admin assign a mentor to candidate guidance request.
   */
  CAND_USER_GUIDANCE_REQUEST_REJECTED_UPDATE_STATUS = "CAND_USER_GUIDANCE_REQUEST_REJECTED_UPDATE_STATUS",

  /**
   * The template name used to send an email to candidate, when the guidance request cancelled by himself.
   */
  CAND_USER_GUIDANCE_REQUEST_CANCELLED_UPDATE_STATUS = "CAND_USER_GUIDANCE_REQUEST_CANCELLED_UPDATE_STATUS",

  /**
   * The template name used to send an email to candidate, when the guidance request payment confirmation done by worko-admin.
   */
  CAND_USER_GUIDANCE_REQUEST_PAYMENT_CONFIRMATION_DONE = "CAND_USER_GUIDANCE_REQUEST_PAYMENT_CONFIRMATION_DONE",

  /**
   * The template name used to send an email to candidate, when the worko-admin submit meeting link.
   */
  CAND_USER_GUIDANCE_REQUEST_MEETING_CONFIRMED_UPDATE_STATUS = "CAND_USER_GUIDANCE_REQUEST_MEETING_CONFIRMED_UPDATE_STATUS",

  /**
   * The template name used to send an email to mentor, when the worko-admin assign a mentor to candidate guidance request.
   */
  MENTOR_USER_GUIDANCE_REQUEST_MENTOR_ASSIGNED_UPDATE_STATUS = "MENTOR_USER_GUIDANCE_REQUEST_MENTOR_ASSIGNED_UPDATE_STATUS",

  /**
   * The template name used to send an email to candidate, when the worko-admin confirm meeting reschedule which was raised either by candidate or employee(mentor).
   */
  CAND_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_CONFIRMED = "CAND_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_CONFIRMED",

  /**
   * The template name used to send an email to employee(mentor), when the worko-admin confirm meeting reschedule which was raised by either employee(mentor) or candidate.
   */
  MENTOR_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_CONFIRMED = "MENTOR_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_CONFIRMED",

  /**
   *The template name used to send an email to candidate, when the meeting is requested for re-scheduled by candidate.
   */
  CAND_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_REQUESTED_BY_CAND = "CAND_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_REQUESTED_BY_CAND",

  /**
   * The template name used to send an email to worko admin, when the meeting is requested for re-scheduled by candidate.
   */
  ADMIN_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_REQUESTED_BY_CAND = "ADMIN_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_REQUESTED_BY_CAND",

  /**
   * The template name used to send an email to candidate, when the meeting is requested for re-scheduled by mentor(employee).
   */
  CAND_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_REQUESTED_BY_EMP = "CAND_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_REQUESTED_BY_EMP",

  /**
   * The template name used to send an email to worko admin, when the meeting is requested for re-scheduled by mentor(employee).
   */
  ADMIN_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_REQUESTED_BY_EMP = "ADMIN_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_REQUESTED_BY_EMP",

  /**
   * The template name used to send an email to candidate, when the project is completed.
   */
  CAND_USER_GUIDANCE_REQUEST_PROJECT_COMPLETED = "CAND_USER_GUIDANCE_REQUEST_PROJECT_COMPLETED",

  /**
   * The template name used to send an email to mentor, when the guidance request cancelled by candidate.
   */
  MENTOR_USER_GUIDANCE_REQUEST_CANCELLED_UPDATE_STATUS = "MENTOR_USER_GUIDANCE_REQUEST_CANCELLED_UPDATE_STATUS",

  /**
   * The template name used to send an email to mentor, when the worko-admin submit meeting link.
   */
  MENTOR_USER_GUIDANCE_REQUEST_MEETING_CONFIRMED_UPDATE_STATUS = "MENTOR_USER_GUIDANCE_REQUEST_MEETING_CONFIRMED_UPDATE_STATUS",

  /**
   * The template name used to send an email to candidate when the interview is requested by corporate user.
   */
  INTERVIEW_REQUEST_BY_CORPORATE_USER = "INTERVIEW_REQUEST_BY_CORPORATE_USER",

}