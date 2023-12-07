export interface UserLinkedinSignUpDTO {
  name: string;
  email: string;
  number: number;
  linkedinUrl: string;
  ECTC: number;
  YOE: number;
  CV: string;
}

export interface UserReferralRequestDTO {
  status: string;
  company: string;
}

export interface UserDetailResponseDto {
  name: string;
  email: string;
  isEmailVerified: boolean;
  isNumberVerified: boolean;
  isSubscribed: boolean;
}
