// Load the local daos
import userReferralDao from "../daos/UserReferral.dao";

// Load the local dtos
import { UserReferralRequestDTO } from "../dtos/User.dto";

/**
 *  UserReferralService class responsible for managing user referral-related operations.
 */
class UserReferralService {
  /**
   * Processes a referral request made by a user(candidate).
   *
   * @param referralRequest - Referral request details
   * @param email - Email of the user making the referral request
   */
  async referralRequest(
    referralRequest: UserReferralRequestDTO,
    email: string
  ) {
    console.log("Create referral [service]");
    return userReferralDao.requestReferral(referralRequest, email);
  }
}

// Export an instance of the UserService class
export default new UserReferralService();
