import { WorkoDTO } from "./Worko.dto";

interface SubsList {
  name: String;
  duration: Number;
  amount: Number;
}

export default interface SubscriptionDTO extends WorkoDTO {
  subList: Partial<SubsList>;
  // name: String;
  // amount: Number;
  // duration: Number;
  // UserType: string;
}
