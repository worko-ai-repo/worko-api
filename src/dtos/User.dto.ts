import { WorkoDTO, WorkoDTOWithGSI } from "./Worko.dto";

export interface UserLinkedinSignUpDTO extends WorkoDTO {
  firstName: string;
  lastName: string;
  emailList: { [key: string]: string };
}

export interface UserReferralRequestDTO extends WorkoDTOWithGSI {
  status: string;
  company: string;
}
