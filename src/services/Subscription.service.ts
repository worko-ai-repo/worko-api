// subscription.service.ts
// import { DB_CONSTANTS } from "../db/DB.constants";
import {
  SubscriptionModel,
  SUBSCRIPTION_CONSTANTS,
} from "../daos/Subscription.dao";
import UlidService from "../services/Ulid.service";
import SubscriptionDTO from "../dtos/Subscription.dto";

class SubscriptionService {
  constructor() {}

  // async createNewSubscription(subscriptionDto: SubscriptionDTO) {
  //   try {
  //     subscriptionDto.PK = DB_CONSTANTS.SUBSCRIPTION_PK;
  //     subscriptionDto.SK =
  //       DB_CONSTANTS.SUBSCRIPTION_SK_INIT + UlidService.getUlidId();
  //     const result = await SubscriptionModel.create(subscriptionDto);
  //     console.log(result);
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async createNewSubscription(subscriptionDto: SubscriptionDTO) {
    try {
      subscriptionDto.PK = SUBSCRIPTION_CONSTANTS.PK;

      // Determine the subscription type and set the SK accordingly
      if (subscriptionDto.UserType === SUBSCRIPTION_CONSTANTS.TYPES.CANDIDATE) {
        subscriptionDto.SK =
          SUBSCRIPTION_CONSTANTS.SK_INIT +
          SUBSCRIPTION_CONSTANTS.TYPES.CANDIDATE +
          "#" +
          UlidService.getUlidId();
      } else if (
        subscriptionDto.UserType === SUBSCRIPTION_CONSTANTS.TYPES.EMPLOYEE
      ) {
        subscriptionDto.SK =
          SUBSCRIPTION_CONSTANTS.SK_INIT +
          SUBSCRIPTION_CONSTANTS.TYPES.EMPLOYEE +
          "#" +
          UlidService.getUlidId();
      } else {
        // Handle invalid userType or provide a default behavior
        throw new Error("Invalid userType");
      }

      const result = await SubscriptionModel.create(subscriptionDto);
      console.log(result);
    } catch (error) {
      throw error;
    }
  }

  async getSubscriptionList() {
    try {
      return SubscriptionModel.query("PK").eq(SUBSCRIPTION_CONSTANTS.PK).exec();
    } catch (error) {
      throw error;
    }
  }
}

export default new SubscriptionService();
