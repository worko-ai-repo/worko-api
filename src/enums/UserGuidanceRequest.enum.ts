/**
 * UserGuidanceRequestTypeEnum
 *
 * @reference `guidanceRequestType` attribute from `UserGuidanceRequest.model.ts`
 */
export enum UserGuidanceRequestTypeEnum {
  /**
   * INTERVIEW_HAND_HOLDING
   */
  INTERVIEW_HAND_HOLDING = "INTERVIEW_HAND_HOLDING", // if this is selected the company name and jobUrl is mandatory

  /**
   * MOCK_INTERVIEW_PREPARATION
   */
  MOCK_INTERVIEW_PREPARATION = "MOCK_INTERVIEW_PREPARATION",

  /**
   * HELP_WITH_ASSIGNMENT
   */
  HELP_WITH_ASSIGNMENT = "HELP_WITH_ASSIGNMENT", // if this is selected the company name and jobUrl is mandatory

  /**
   * CAREER_GUIDANCE
   */
  CAREER_GUIDANCE = "CAREER_GUIDANCE",

  /**
   * RESUME_REVIEW
   */
  RESUME_REVIEW = "RESUME_REVIEW",

  /**
   * OTHER
   */
  OTHER = "OTHER",
}

/**
 * UserGuidanceRequestStatusEnum
 */
export enum UserGuidanceRequestStatusEnum {
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  MENTOR_ASSIGNED = "MENTOR_ASSIGNED",
  CANCELLED = "CANCELLED",
  PAYMENT_CONFIRMATION_PENDING = "PAYMENT_CONFIRMATION_PENDING",
  PAYMENT_CONFIRMATION_DONE = "PAYMENT_CONFIRMATION_DONE",
  MEETING_CONFIRMED = "MEETING_CONFIRMED",

  MEETING_RESCHEDULE_REQUESTED_BY_CANDIDATE = "MEETING_RESCHEDULE_REQUESTED_BY_CANDIDATE",
  MEETING_RESCHEDULE_REQUESTED_BY_MENTOR = "MEETING_RESCHEDULE_REQUESTED_BY_MENTOR",
  MEETING_RESCHEDULE_CONFIRMED = "MEETING_RESCHEDULE_CONFIRMED",

  PROJECT_COMPLETED = "PROJECT_COMPLETED",
}

/**
 * UserJobApplicationAllowedToWorkoAdminUpdateStatusEnum
 * 
 * @description only below status can be updated by worko admin
 */
export enum UserJobApplicationAllowedToWorkoAdminUpdateStatusEnum {
  REJECTED = "REJECTED",
  MENTOR_ASSIGNED = "MENTOR_ASSIGNED",
  PAYMENT_CONFIRMATION_DONE = "PAYMENT_CONFIRMATION_DONE",
  MEETING_CONFIRMED = "MEETING_CONFIRMED",
  MEETING_RESCHEDULE_CONFIRMED = "MEETING_RESCHEDULE_CONFIRMED",
  PROJECT_COMPLETED = "PROJECT_COMPLETED",
}

/**
 * UserJobApplicationAllowedToCandidateUpdateStatusEnum
 * 
 * @description only below status can be updated by candidate
 */
export enum UserJobApplicationAllowedToCandidateUpdateStatusEnum {
  CANCELLED = "CANCELLED",
  PAYMENT_CONFIRMATION_PENDING = "PAYMENT_CONFIRMATION_PENDING",
  MEETING_RESCHEDULE_REQUESTED_BY_CANDIDATE = "MEETING_RESCHEDULE_REQUESTED_BY_CANDIDATE",
}

/**
 * UserJobApplicationAllowedToMentorUpdateStatusEnum
 * 
 * @description only below status can be updated by employee(mentor)
 */
export enum UserJobApplicationAllowedToMentorUpdateStatusEnum {
  MEETING_RESCHEDULE_REQUESTED_BY_MENTOR = "MEETING_RESCHEDULE_REQUESTED_BY_MENTOR",
}

export enum UserGuidanceRequestUpdateActionResourceKeyEnum {
  WORKO_ADMIN_ACTION = "WORKO_ADMIN_ACTION",
  CANDIDATE_ACTION = "CANDIDATE_ACTION",
  MENTOR_ACTION = "MENTOR_ACTION",
}