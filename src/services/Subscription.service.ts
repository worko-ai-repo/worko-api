// subscription.service.ts
import SubscriptionDTO from "../dtos/Subscription.dto";
import UserDao from "../daos/User.dao";

class SubscriptionService {
  constructor() {}

  async createNewSubscription(subscriptionDto: SubscriptionDTO, email: string) {
    try {
      // subscriptionDto.PK = USER_CONSTANTS.PK + "#" + email;
      // subscriptionDto.SK = SUBSCRIPTION_CONSTANTS.SK_INIT + UlidService.getUlidId();
      return UserDao.addSubscription(subscriptionDto, email);
    } catch (error) {
      throw error;
    }
  }
}

export default new SubscriptionService();
