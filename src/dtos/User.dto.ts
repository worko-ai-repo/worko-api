import { WorkoDTO } from "./Worko.dto";

// export interface UserLinkedinSignUpDTO extends WorkoDTO {
//   email: string;
//   name: string;
//   role: string;
// }

export interface UserLinkedinSignUpDTO extends WorkoDTO {
  firstName: string;
  lastName: string;
  emailList: string[];
}

export interface UserReferralRequestDTO extends WorkoDTO {
  status: string;
  company: string;
  GSI1PK: string;
  GSI1SK: string;
}
