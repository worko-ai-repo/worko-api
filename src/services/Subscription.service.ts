// subscription.service.ts
import UsersubscriptionDao from "../daos/Usersubscription.dao";
import SubscriptionDTO from "../dtos/Subscription.dto";

class SubscriptionService {
  constructor() {}

  async createNewSubscription(subscriptionDto: SubscriptionDTO, email: string) {
    try {
      return UsersubscriptionDao.addSubscription(subscriptionDto, email);
    } catch (error) {
      throw error;
    }
  }
}

export default new SubscriptionService();
