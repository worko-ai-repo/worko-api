// Import enums
import { UserOtpSentViaEnum } from "../enums/User.enum";

/**
 * UserOtpCreateDto
 * 
 * The DTO for creating a new user otp in database.
 */
export interface UserOtpCreateDto {
    logId: string;
    otp: string;
    userIpAddress: string;
    sentTo: string;
    sentVia: UserOtpSentViaEnum.EMAIL;
}