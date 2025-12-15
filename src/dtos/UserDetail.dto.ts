
// Import dtos
import { UserDetailDbResponsibilitiesDto } from "./User.dto";

// Import enums
import { UserDetailDbGenderEnum } from "../enums/User.enum";

export interface UserDetailDTO {
  name: string;
  gender?: UserDetailDbGenderEnum;
  emailList: { [key: string]: string };
  number: string;
  userType: string[];
  isEmailVerified: boolean;
  isNumberVerified: boolean;
  isSubscribed: boolean;
  referralCount: number;
  location?: string;
  about?: string;
  CTC?: number;
  ECTC?: number;
  noticePeriod?: number;
  isNoticePeriodNegotiable?: boolean;
  YOE?: number;
  CV?: string;
  coverLetter?: string;
  lastAccessedDash: string;
  profileImage?: string;
  country?: string;
  isCandidateFresher: boolean;
  candidateExperience?: UserDetailDbCandidateExperienceDto;
  multipleCandidateExperience: UserDetailDbCandidateExperienceDto[];
  responsibilities: UserDetailDbResponsibilitiesDto[];

  /**
   * isWhatsappNotificationEnabled
   *
   * This field is used to enable/disable the whatsapp notification.
   * @type {boolean}
   *
   * Note: For example, if a user logs in as an employee and wants to disable WhatsApp notifications on the employee dashboard while keeping them enabled on the candidate dashboard,
   * this `isWhatsappNotificationEnabled` setting won't work that way.
   * When `isWhatsappNotificationEnabled` is set to `false` on the employee dashboard,
   * it will also be `false` on the candidate dashboard, applying globally across all user roles.
   */
  isWhatsappNotificationEnabled?: boolean;
}

export interface UserDetailDbCandidateExperienceDto {
  companyId?: string;
  companyName: string;
  designation: string;
  department?: string;
  YOE?: number;
  startDate?: string;

  /**
   * endDate
   * 
   * @description if endDate is not provided or empty string, it will be considered as ongoing experience
   */
  endDate?: string;
};

export interface UserDetailUpdateApiDto {
  isNumberVerified?: boolean;
  isEmailVerified?: boolean;

  /**
   * This is used for `linkedin` signup, frontend is 
   * making emailverified as true but we need to make it verify in dynamodb also
   */
  isAlreadyVerifiedInCognito?: boolean;
}

export interface UserDetailCommonUpdateDto {
  isNumberVerified: boolean;
  isEmailVerified: boolean;
  YOE: number;
  CTC: number;
  noticePeriod: number;
}

export interface UserDetailForceChangePasswordSendOtpApiDto {
  candidateRegisteredEmail: string;
}

export interface UserDetailForceChangePasswordVerifyOtpApiDto {
  candidateRegisteredEmail: string;
  otp: string;
}