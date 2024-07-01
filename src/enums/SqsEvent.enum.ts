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
}