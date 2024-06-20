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