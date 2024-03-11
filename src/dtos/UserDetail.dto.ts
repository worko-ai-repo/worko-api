export interface UserDetailDTO {
  name: string;
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
  YOE: number;
  CV?: string;
  coverLetter?: string;
  lastAccessedDash: string;
  profileImage?: string;
  country: string;
  isCandidateFresher: boolean;
}
