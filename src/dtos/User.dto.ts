export interface UserSignUpDTO {
  name: string;
  email: string;
  number: string;
  linkedinUrl?: string;
  ECTC?: number;
  YOE: number;
  CV?: string;
  userId: string;
}

export interface UserReferralRequestDTO {
  companySK: string;
  jobUrl: string;
}

export interface UserDetailResponseDto {
  name: string;
  email: string;
  isEmailVerified: boolean;
  isNumberVerified: boolean;
  isSubscribed: boolean;
}

export interface UserEmployeeSignUpDTO {
  name: string;
  email: string;
  number: string;
  linkedinUrl: string;
  YOE: number;
  companyName: string;
  companySK: string;
  companyEmailId: string;
  department: string;
  designation: string;
  designationTag: number;
  userId: string;
}

export interface UserProfileResponse {
  name: string;
  lastAccessedDash: string;
  profileImage: string;
}
