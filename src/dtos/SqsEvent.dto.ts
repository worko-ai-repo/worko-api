/**
* Base interface for SQS message request data transfer objects (DTOs).
* 
* @interface SqsMsgBaseReqDto
* 
* @property {string} event - The name of the event.
* @property {string} userId - The user's unique identifier.
* @property {string} userEmail - The user's email address.
*/
export interface SqsMsgBaseReqDto {
    event: string;
    userId: string;
    userEmail: string;
 }
 
 /**
 * Interface for SQS message request DTO related to referral validation and matching score.
 * 
 * Extends the `SqsMsgBaseReqDto` interface.
 * 
 * @interface SqsMsgReferralValidateMatchingScoreReqDto
 * @extends SqsMsgBaseReqDto
 * @property {Object} context - Additional context information.
 * @property {string} context.referralId - The unique identifier of the referral.
 */
 export interface SqsMsgReferralValidationMatchingScoreReqDto extends SqsMsgBaseReqDto {
    context: {
        referralId: string;
    };
 }

 /**
  * Interface for SQS message request DTO related to corporate bulk JD resume send email and whatsapp notification.
  * 
  * NOTE: `userId` and `userEmail` attributes are recieved as empty strings.
  * 
  * @todo: Need to optimize `SqsMsgBaseReqDto` interface
  * @see `CorporateBulkJdResume.dao.ts` - For PK and SK details
  */
 export interface SqsMsgCorporateBulkJDResumeSendEmailAndWhatsappNotificationReqDto extends SqsMsgBaseReqDto {
    context: {
        corporateBulkJdResumeId: string; // Refer `CorporateBulkJdResume.model.ts`
    };
 }

 /**
 * Interface for SQS message request DTO related to reviewing referral acceptance status.
 * 
 * Extends the `SqsMsgBaseReqDto` interface.
 * 
 * @interface SqsMsgReviewReferralAcceptanceStatusReqDto
 * @extends SqsMsgBaseReqDto
 * @property {Object} context - Additional context information.
 * @property {string} context.referralId - The unique identifier of the referral.
 */
export interface SqsMsgReviewReferralAcceptanceStatusReqDto extends SqsMsgBaseReqDto {
    context: {
        referralId: string;
    };
}

/**
 * SqsMsgSendWelcomeEmailAndWhatsappNotificationToUserReqDto
 */
export interface SqsMsgSendWelcomeEmailAndWhatsappNotificationToUserReqDto extends SqsMsgBaseReqDto {
    /**
     * NOTE: As of now this interface is empty, we can add more attributes later
     */
}

export interface SqsMsgUpdateCvCentralCandProfileReqDto extends SqsMsgBaseReqDto {

}