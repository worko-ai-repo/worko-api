import { WorkoDTO, WorkoDTOWithGSI } from "./Worko.dto";

export interface UserLinkedinSignUpDTO extends WorkoDTO {
  name: string;
  emailList: { [key: string]: string };
  number: number;
  linkedinUrl: string;
  isEmailVerified: boolean;
  isNumberVerified: boolean;
  ECTC: number;
  YOE: number;
  CV: string;
}

export interface UserReferralRequestDTO extends WorkoDTOWithGSI {
  status: string;
  company: string;
}
