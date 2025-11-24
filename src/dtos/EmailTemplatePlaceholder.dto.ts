
export interface EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  instagramUrl: string;
  instagramLogoUrl: string;
  linkedInUrl: string;
  linkedInLogoUrl: string;
  workoLogoUrl: string;
}

export interface EmailTemplatePlaceholderCAND_REFERRAL_REQ_ACCEPTED extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  candName: string;
  companyName: string;
  refereeName: string;

  /**
   * @example: `https://worko.ai/`
   */
  workoAppUrl: string;
}

export interface EmailTemplatePlaceholderCAND_REFERRAL_REQ_COMPLETED extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
    candName: string;
    companyName: string;
}

export interface EmailTemplatePlaceholderCAND_WELCOME_MSG extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
    candName: string;
    workoAppUrl: string;
}

export interface EmailTemplatePlaceholderCAND_PROFILE_COMPLETION_REMINDER {
    candName: string;
}

export interface EmailTemplatePlaceholderUSER_WORK_EMAIL_VERIFICATION_OTP extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
    userFullName: string;
    otp: string;
    verificationUrl: string;
}

export interface EmailTemplatePlaceholderCAND_PREMIUM_UPGRADE_NOTIFICATION extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
    candName: string;
    candPremiumUpgradeNowMsg: string;
}

export interface EmailTemplatePlaceholderCAND_PROFILE_SWITCH_NOTIFICATION {
    candName: string;
}

export interface EmailTemplatePlaceholderEMP_WELCOME_MSG extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
    empName: string;
    workoAppUrl: string;
}

export interface EmailTemplatePlaceholderEMP_PROFILE_COMPLETION_REMINDER {
    empName: string;
}

export interface EmailTemplatePlaceholderEMP_ACCEPTED_REFERRAL_REQ_NOTIFCATION extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
    empName: string;
    candName: string;
    workoChatUrl: string;
}

export interface EmailTemplatePlaceholderEMP_REFFERAL_DONE_FOR_CAND extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
    empName: string;
    candidateName: string;
    workoReferralUrl: string;
}

export interface EmailTemplatePlaceholderCAND_PREMIUM_EXPIRED_NOTIFICATION extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
    candName: string;
    candRenewNowMsg: string;
}

export interface EmailTemplatePlaceholderEMP_SWITCH_PROFILE_NOTIFICATION extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
    empName: string;
    workoLoginUrl: string;
}

export interface EmailTemplatePlaceholderEMP_REVIEW_RATING_BY_CAND extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
    empName: string;
    feedback: string;
    rating: number;
    workoFeedbackUrl: string;
}

export interface EmailTemplatePlaceholderEMP_QUERY_FOR_REFERRAL_BY_CAND extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
    empName: string;
    query: string;
    workoReferralUrl: string;
}

export interface EmailTemplatePlaceholderUSER_CORPORATE_REQUEST_EMAIL_OTP extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
    userFullName: string;
    logoUrl: string;
    otp: string;
    verificationUrl: string;
}
export interface EmailTemplatePlaceholderEMP_RECEIVED_REFERRAL_REQ_NOTIFICATION extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
    emp_first_name: string;
    candidate_name: string;
    workoReferralUrl: string;
}

/**
 * Represents the placeholders for the email template used when a candidate's referral is automatically cancelled after a specified number of days.
 */
export interface EmailTemplatePlaceholderCAND_REF_AUTO_CANCEL_AFTER_X_DAYS extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
    candName: string;
    jobUrl: string;
    companyName: string;
    workoAppUrl: string;
}

/**
 * Represents the placeholders for the email template used when a candidate's referral is automatically rejected after a specified number of days.
 */
export interface EmailTemplatePlaceholderCAND_REF_AUTO_REJECT_AFTER_X_DAYS extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
    candName: string;
    jobUrl: string;
    companyName: string;
    rejectedReasons : string;
    workoAppUrl: string;
}

/**
 * Represents the placeholders for the email template used when a worko employee wants to add new user as a company admin.
 */

export interface EmailTemplatePlaceholderCORP_ADMIN_ACCESS_INVITE extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS{
    role: string,
    userName:string,
    companyName:string,
    signupUrl:string,
    loginUrl:string
}

/**
 * Represents the placeholders for the email template used when a worko user signs up as a corporate user.
 */
export interface EmailTemplatePlaceholderCORP_USER_SUCCESSFUL_SIGNUP {
    userName:string,
    companyName:string,
    userRole:string,
    loginUrl:string
}

/**
 * EmailTemplatePlaceholderCORP_RECEIVED_JOB_APPLICATION_NOTIFICATION
 * 
 * Represents the placeholders for the email template used when a worko corporate user receives a job application notification.
 */
export interface EmailTemplatePlaceholderCORP_RECEIVED_JOB_APPLICATION_NOTIFICATION {
  corporateUserFullName: string;
  candidateName: string;
  jobTitle: string;
  matchingScore: number;
  scoreDetails: string;
}

/**
 * EmailTemplatePlaceholderCORP_REQUEST_FEEDBACK_NOTIFICATION
 */
export interface EmailTemplatePlaceholderCORP_REQUEST_FEEDBACK_NOTIFICATION {
  jobPosterName: string;
  candidateName: string;
  jobTitle: string;
  applicationDate: string;
  status: string;
}

/**
 * EmailTemplatePlaceholderCORP_RECEIVED_JOB_APPLICATION_STATUS_UPDATE_NOTIFICATION
 */
export interface EmailTemplatePlaceholderCORP_RECEIVED_JOB_APPLICATION_STATUS_UPDATE_NOTIFICATION {
  jobPosterName: string;
  jobTitle: string;
  candidateName: string;
  updatedStatus: string;
}

/**
 * EmailTemplatePlaceholderCAND_RECEIVED_JOB_APPLICATION_NOTIFICATION
 */
export interface EmailTemplatePlaceholderCAND_RECEIVED_JOB_APPLICATION_NOTIFICATION {
  candidateName: string;
  jobTitle: string;
  companyName: string;
}

/**
 * EmailTemplatePlaceholderCAND_RECEIVED_JOB_APPLICATION_CV_DOWNLOADED_STATUS_UPDATE
 */
export interface EmailTemplatePlaceholderCAND_RECEIVED_JOB_APPLICATION_CV_DOWNLOADED_STATUS_UPDATE {
  candName: string;
  companyName: string;
  jobTitle: string;
  workoAppUrl: string;
  guidanceEmail: string;
}

/**
 * EmailTemplatePlaceholderCAND_RECEIVED_JOB_APPLICATION_UNDER_EVALUATION_STATUS_UPDATE
 */
export interface EmailTemplatePlaceholderCAND_RECEIVED_JOB_APPLICATION_UNDER_EVALUATION_STATUS_UPDATE {
  candName: string;
  companyName: string;
  jobTitle: string;
  workoAppUrl: string;
  guidanceEmail: string;
}

/**
 * EmailTemplatePlaceholderCAND_RECEIVED_JOB_APPLICATION_HIRED_STATUS_UPDATE
 */
export interface EmailTemplatePlaceholderCAND_RECEIVED_JOB_APPLICATION_HIRED_STATUS_UPDATE {
  candName: string;
  jobTitle: string;
  companyName: string;
  workoAppUrl: string;
}

/**
 * EmailTemplatePlaceholderCAND_RECEIVED_JOB_APPLICATION_REJECTED_STATUS_UPDATE
 */
export interface EmailTemplatePlaceholderCAND_RECEIVED_JOB_APPLICATION_REJECTED_STATUS_UPDATE {
  candName: string;
  jobTitle: string;
  companyName: string;
  hrFeedback: string;
  workoAppUrl: string;
}

/**
 * EmailTemplatePlaceholderCAND_CORPORATE_BULK_JD_RESUME_HIGH_MATCHING_SCORE
 */
export interface EmailTemplatePlaceholderCAND_CORPORATE_BULK_JD_RESUME_HIGH_MATCHING_SCORE extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  candidateName: string;
  companyName: string;
  jobTitle: string;
  matchingScore: number;
  signUpUrl: string;
}

/**
 * EmailTemplatePlaceholderCAND_CORPORATE_BULK_JD_RESUME_LOW_MATCHING_SCORE
 */
export interface EmailTemplatePlaceholderCAND_CORPORATE_BULK_JD_RESUME_LOW_MATCHING_SCORE extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  candidateName: string;
  companyName: string;
  jobTitle: string;
  signUpUrl: string;
}

/**
 * EmailTemplatePlaceholder_USER_GUIDANCE_REQUEST
 * 
 * @emailTemplateName "USER_GUIDANCE_REQUEST"
 */
export interface EmailTemplatePlaceholder_USER_GUIDANCE_REQUEST extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  /**
   * @reference `userName` and `userPhoneNumber` are from `UserDetail.model.ts`
   */
  userName: string;
  userPhoneNumber: string;

  /**
   * dateOfGuidanceRequest
   *
   * @description By when you need the guidance
   * @format "d'th' MMMM yyyy"
   */
  dateOfGuidanceRequest: string;

  companyName: string;

  guidanceRequestType: string;
  
  jobUrl: string;
}

/**
 * EmailTemplatePlaceholderWORKO_ADMIN_CORPORATE_REQUEST
 */
export interface EmailTemplatePlaceholderWORKO_ADMIN_CORPORATE_REQUEST {
  corporateFullName: string;
  corporateCompanyName: string;
  corporateDesignation: string;
  corporateEmail: string;
  corporatePhoneNumber: string;
  requestedPricingPlan: string;
  corporateMessage: string;
  submittedAt: string;
}

export interface EmailTemplatePlaceholderCAND_USER_GUIDANCE_REQUEST_MENTOR_ASSIGNED_UPDATE_STATUS
  extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  candidateName: string;
  mentorName: string;
  mentorCompanyName: string;
}

export interface EmailTemplatePlaceholderCAND_USER_GUIDANCE_REQUEST_REJECTED_UPDATE_STATUS extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  candidateName: string;
}

export interface EmailTemplatePlaceholderCAND_USER_GUIDANCE_REQUEST_CANCELLED_UPDATE_STATUS extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  candidateName: string;
}

export interface EmailTemplatePlaceholderADMIN_USER_GUIDANCE_REQUEST_CANCELLED_UPDATE_STATUS extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  candidateName: string;
  mentorName: string;
  guidanceRequestType: string;
  workoAppUrl: string;
}

export interface EmailTemplatePlaceholderCAND_USER_GUIDANCE_REQUEST_PAYMENT_CONFIRMATION_DONE extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  candidateName: string;
  mentorName: string;
}

export interface EmailTemplatePlaceholderCAND_USER_GUIDANCE_REQUEST_MEETING_CONFIRMED_UPDATE_STATUS extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  candidateName: string;
  mentorName: string;
  date: string;
  time: string;
  duration: string;
  videoCallLink: string;
}

export interface EmailTemplatePlaceholderMENTOR_USER_GUIDANCE_REQUEST_MEETING_CONFIRMED_UPDATE_STATUS
  extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  candidateName: string;
  mentorName: string;
  date: string;
  time: string;
  guidanceRequestType: string;
  workoAppUrl: string;
}

export interface EmailTemplatePlaceholderMENTOR_USER_GUIDANCE_REQUEST_MENTOR_ASSIGNED_UPDATE_STATUS
  extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  candidateName: string;
  mentorName: string;
  guidanceRequestType: string;
  companyName: string;
  jobUrl: string;
}

export interface EmailTemplatePlaceholderCAND_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_CONFIRMED extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  candidateName: string;
  mentorName: string;
  date: string;
  time: string;
  duration: string;
  videoCallLink: string;
}

export interface EmailTemplatePlaceholderMENTOR_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_CONFIRMED
  extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  candidateName: string;
  mentorName: string;
  date: string;
  time: string;
  workoAppUrl: string;
}

export interface EmailTemplatePlaceholderCAND_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_REQUESTED_BY_CAND extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  candidateName: string;
  mentorName: string;
}

export interface EmailTemplatePlaceholderADMIN_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_REQUESTED_BY_CAND
  extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  candidateName: string;
  mentorName: string;
  workoAppUrl: string;
}

export interface EmailTemplatePlaceholderCAND_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_REQUESTED_BY_EMP extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  candidateName: string;
  mentorName: string;
  workoAppUrl: string;
}

export interface EmailTemplatePlaceholderADMIN_USER_GUIDANCE_REQUEST_MEETING_RESCHEDULE_REQUESTED_BY_EMP
  extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  candidateName: string;
  mentorName: string;
  workoAppUrl: string;
}

export interface EmailTemplatePlaceholderCAND_USER_GUIDANCE_REQUEST_PROJECT_COMPLETED extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  candidateName: string;
  mentorName: string;
}

export interface EmailTemplatePlaceholderMENTOR_USER_GUIDANCE_REQUEST_CANCELLED_UPDATE_STATUS
  extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  candidateName: string;
  mentorName: string;
}

/**
 * EmailTemplatePlaceholderINTERVIEW_REQUEST_BY_CORPORATE_USER
 * 
 * Represents the placeholders for the email template used when a corporate user requests an interview for a candidate.
 */
export interface EmailTemplatePlaceholderINTERVIEW_REQUEST_BY_CORPORATE_USER {
  recipientEmail: string;
  recipientName: string;
  companyName: string;
  position: string;
  jobUrl: string;
  interviewUrl: string;
  requesterName: string;
}