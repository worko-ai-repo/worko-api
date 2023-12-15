// Load the local daos
import masterSubscriptionDao from "../daos/MasterSubscription.dao";

// Load the local dtos
import { MasterSubscriptionDTO } from "../dtos/MasterSubscription.dto";

/**
 * MasterSubscriptionService
 *
 *  Responsible for handling MasterSubscription-related operations.
 */
class MasterSubscriptionService {
  constructor() {}
  /**
   *
   * Creates a new master subscription based on provided details.
   *
   * @param masterSubscriptionDto - master Subscription details
   * @returns
   */
  async createNewMasterSubscription(
    masterSubscriptionDto: MasterSubscriptionDTO
  ) {
    console.log("Create new mater subscription plan [service]");
    return masterSubscriptionDao.addMasterSubscription(masterSubscriptionDto);
  }

  /**
   *
   * Get master subscription Plans
   *
   * @returns
   */
  async getMasterSubscriptionPlans() {
    console.log("Get all master subscription plan [service]");
    return masterSubscriptionDao.getMasterSubscriptionPlans();
  }

  /**
   *
   * Get subscription plan details
   *
   * @returns
   */
  async getSubscriptionPlanDetail(plan: string) {
    console.log("Get subscription plan details [service]");
    const subPlanDetail = await masterSubscriptionDao.getSubscriptionPlanDetail(
      plan
    );
    return subPlanDetail[0];
  }
}

// Export an instance of the MasterSubscriptionService class
export default new MasterSubscriptionService();
