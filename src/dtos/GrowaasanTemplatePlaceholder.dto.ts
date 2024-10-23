// import enums
import { ReferralStatus } from "../enums/UserReferral.enum";

/**
 * GrowaasanPlaceholderParamDto
 * 
 * Placeholder parameters for Growaasan message templates to be used internally within the application.
 * 
 * This interface allows for flexible key-value pairs of placeholder types and their corresponding values.
 */
export interface GrowaasanPlaceholderParamDto {
  [key: string]: any;
}

/**
 * GrowaasanTemplatePlaceholderCAND_SIGNUP_CANDIDATE
 * 
 * Placeholder for the candidate welcome message template.
 * Used when sending an initial welcome message to a new candidate.
 * 
 * ## NOTE: The placeholders should be in the same vertical order as they appear in the template
 */
export interface GrowaasanTemplatePlaceholderCAND_SIGNUP_CANDIDATE {
  /**
   * candidateName
   * 
   * The body placeholder in the template containing the candidate's name.
   */
  candidateName: string;
}

/**
 * GrowaasanTemplatePlaceholderEMP_SIGNUP_EMP
 * 
 * Placeholder for the employee welcome message template.
 * Used when sending an initial welcome message to a new employee.
 * 
 * ## NOTE: The placeholders should be in the same vertical order as they appear in the template
 */
export interface GrowaasanTemplatePlaceholderEMP_SIGNUP_EMP {
  /**
   * employeeName
   *
   * The body placeholder in the template containing the employee's name.
   */
  employeeName: string;
}

/**
 * GrowaasanTemplatePlaceholderCAND_REFERRAL_REQUEST_ACCEPTED_CANDIDATE
 * 
 * Placeholder for the candidate referral request accepted notification template.
 * Used to inform a candidate that their referral request has been accepted.
 * 
 * ## NOTE: The placeholders should be in the same vertical order as they appear in the template
 */
export interface GrowaasanTemplatePlaceholderCAND_REFERRAL_REQUEST_ACCEPTED_CANDIDATE {
  /**
   * candidateName
   * 
   * The first body placeholder, containing the candidate's name.
   */
  candidateName: string;

  /**
   * companyName
   * 
   * The second body placeholder, containing the company name
   */
  companyName: string;

  /**
   * jobUrl
   * 
   * The third body placeholder, containing the job URL.
   */
  jobUrl: string;

  /**
   * employeeName
   * 
   * The fourth body placeholder, containing the referee's name.
   */
  employeeName: string;
}

/**
 * GrowaasanTemplatePlaceholderCAND_REFERRAL_REQUEST_COMPLETED_CANDIDATE
 * 
 * Placeholder for the candidate referral request completed notification template.
 * Used to inform a candidate that their referral check has been completed.
 * 
 * ## NOTE: The placeholders should be in the same vertical order as they appear in the template
 */
export interface GrowaasanTemplatePlaceholderCAND_REFERRAL_REQUEST_COMPLETED_CANDIDATE {
  /**
   * candidateName
   *
   * The first body placeholder, containing the candidate's name.
   */
  candidateName: string;

  /**
   * companyName
   *
   * The second body placeholder, containing the company name
   */
  companyName: string;

  /**
   * jobUrl
   *
   * The third body placeholder, containing the job URL.
   */
  jobUrl: string;

  /**
   * employeeName
   *
   * The fourth body placeholder, containing the referee's name.
   */
  employeeName: string;
}

/**
 * GrowaasanTemplatePlaceholderEMP_NEW_REFERRAL_REQUEST_EMPLOYEE
 * 
 * Placeholder for the employee received referral request notification template.
 * Used to notify an employee that they have received a new referral request.
 * 
 * ## NOTE: The placeholders should be in the same vertical order as they appear in the template
 */
export interface GrowaasanTemplatePlaceholderEMP_NEW_REFERRAL_REQUEST_EMPLOYEE {
  /**
   * employeeName
   *
   * The first body placeholder, containing the employee's name.
   */
  employeeName: string;

  /**
   * candidateName
   *
   * The second body placeholder, containing the candidate's name.
   */
  candidateName: string;

  /**
   * matchingScore
   *
   * The third body placeholder, containing a matching score.
   */
  matchingScore: string;

  /**
   * jobUrl
   *
   * The fourth body placeholder, containing the job URL.
   */
  jobUrl: string;
}

/**
 * GrowaasanTemplatePlaceholderEMP_REFERRAL_REQUEST_PENDING_EMPLOYEE
 * 
 * Placeholder for the employee pending accepted referral request notification template.
 * Used to remind employee about referral request that the employee has accepted but haven't completed.
 * 
 * ## NOTE: The placeholders should be in the same vertical order as they appear in the template
 */
export interface GrowaasanTemplatePlaceholderEMP_REFERRAL_REQUEST_PENDING_EMPLOYEE {
  /**
   * employeeName
   * 
   * The first body placeholder, likely containing the employee's name.
   */
  employeeName: string;

  /**
   * candidateName
   * 
   * The second body placeholder, possibly containing the candidate's name.
   */
  candidateName: string;
}

/**
 * GrowaasanTemplatePlaceholderCAND_REFEREE_RAISE_DISPUTE_CANDIDATE
 * 
 * Placeholder for the candidate referral query by employee template.
 * Used when an employee asks a question or seeks clarification about a candidate's referral.
 * 
 * ## NOTE: The placeholders should be in the same vertical order as they appear in the template
 */
export interface GrowaasanTemplatePlaceholderCAND_REFEREE_RAISE_DISPUTE_CANDIDATE {
  /**
   * candidateName
   * 
   * The first body placeholder, likely containing the candidate's name.
   */
  candidateName: string;

  /**
   * employeeName
   * 
   * The second body placeholder, possibly containing the employee's (referee's) name.
   */
  employeeName: string;

  /**
   * referralStatus
   *
   * The third body placeholder, containing the referral status.
   * 
   * @see ReferralStatus
   */
  referralStatus: string;

  /**
   * companyName
   * 
   * The third body placeholder, potentially containing the query or question.
   */
  companyName: string;
}

/**
 * GrowaasanTemplatePlaceholderEMP_CANDIDATE_RAISE_DISPUTE_EMPLOYEE
 * 
 * Placeholder for the employee referral query by candidate template.
 * Used when a candidate asks a question or seeks clarification about their referral to an employee.
 * 
 * ## NOTE: The placeholders should be in the same vertical order as they appear in the template
 */
export interface GrowaasanTemplatePlaceholderEMP_CANDIDATE_RAISE_DISPUTE_EMPLOYEE {
  /**
   * employeeName
   * 
   * The first body placeholder, likely containing the employee's name.
   */
  employeeName: string;

  /**
   * candidateName
   * 
   * The second body placeholder, possibly containing the candidate's name.
   */
  candidateName: string;

  /**
   * referralStatus
   * 
   * The third body placeholder, containing the referral status.
   * 
   * @see ReferralStatus
   */
  referralStatus: string;
}

/**
 * GrowaasanTemplatePlaceholderEMP_PENDING_WORK_EMAIL_VERIFICATION
 * 
 * Placeholder for the employee work email verification pending notification template.
 * Used to remind employees to verify their work email.
 * 
 * ## NOTE: The placeholders should be in the same vertical order as they appear in the template
 */
export interface GrowaasanTemplatePlaceholderEMP_PENDING_WORK_EMAIL_VERIFICATION {
  /**
   * employeeName
   * 
   * The body placeholder, typically containing the employee's name.
   */
  employeeName: string;
}

/**
 * GrowaasanTemplatePlaceholderEMP_PENDING_REQUEST_COUNT_EMPLOYEE
 * 
 * Placeholder for the employee pending awaiting referral request counts notification template.
 * Used to inform employees about the number of referral requests awaiting their action.
 * 
 * ## NOTE: The placeholders should be in the same vertical order as they appear in the template
 */
export interface GrowaasanTemplatePlaceholderEMP_PENDING_REQUEST_COUNT_EMPLOYEE {
  /**
   * employeeName
   *
   * The first body placeholder, containing the employee's name.
   */
  employeeName: string;

  /**
   * countOfPendingAwaitedReferralRequests
   * 
   * The second body placeholder, containing the count of pending awaiting referral requests.
   */
  countOfPendingAwaitedReferralRequests: string;
}

/**
 * GrowaasanTemplatePlaceholderEMP_ACCEPTED_REQUEST_COUNT_EMPLOYEE
 * 
 * Placeholder for the employee pending accepted referral request counts notification template.
 * Used to inform employees about the number of referral requests they've accepted but haven't completed.
 * 
 * ## NOTE: The placeholders should be in the same vertical order as they appear in the template
 */
export interface GrowaasanTemplatePlaceholderEMP_ACCEPTED_REQUEST_COUNT_EMPLOYEE {
  /**
   * employeeName
   * 
   * The first body placeholder, containing the employee's name.
   */
  employeeName: string;

  /**
   * countOfPendingAcceptedReferralRequests
   * 
   * The second body placeholder, containing the count of pending accepted referral requests.
   */
  countOfPendingAcceptedReferralRequests: string;
}