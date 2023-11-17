import { WorkoDTO } from "./Worko.dto";
export default interface SubscriptionDTO extends WorkoDTO {
  name: String;
  amount: Number;
  duration: Number;
  UserType: string;
}
