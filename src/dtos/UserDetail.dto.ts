export interface UserDetailDTO {
  name: string;
  emailList: { [key: string]: string };
  number: number;
  userType: string[];
  linkedinUrl: string;
  isEmailVerified: boolean;
  isNumberVerified: boolean;
  isSubscribed: boolean;
  referralCount: number;
  location?: string;
  about?: string;
  CTC?: number;
  ECTC?: number;
  noticePeriod?: number;
  YOE: number;
  CV?: string;
  coverLetter?: string;
  lastAccessedDash: string;
  profileImage?: string;
}
