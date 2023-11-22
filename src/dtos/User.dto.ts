import { WorkoDTO } from "./Worko.dto";

export default interface UserLinkedinSignUpDTO extends WorkoDTO {
  email: string;
  name: string;
  role: string;
}
