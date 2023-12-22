// Load the local daos
import userReferralDao from "../daos/UserReferral.dao";
import UserService from "./User.service";

// Load the local dtos
import { UserReferralRequestDTO } from "../dtos/User.dto";
import CompanyJobService from "./CompanyJob.service";

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

    // To decrease the referral count by 1 every time the candidate request for referral
    // UserService.decreaseReferralCount(email);

    //below block checks gets the ExtractedJd from db if it is there
    /* const jdExtract = await CompanyJobService.getJdUrl(
      referralRequest.jobUrl,
      referralRequest.companySK
    );
    if (jdExtract.count == 0) {
      //create new entery for company related jobUrl
      CompanyJobService.addCompanyRelatedJob(
        referralRequest.jobUrl,
        referralRequest.companySK
      );
    }

    console.log("cTesting: ", jdExtract); */
    return userReferralDao.requestReferral(referralRequest, email);
  }

  /**
   *
   *
   *
   * @param referralId Referral request Id
   * @param email Email of the user
   * @returns matchingScore
   */
  async matchingScore(referralId: string, email: string) {
    console.log("Get referral matching score [service]");
    return userReferralDao.getScore(email, referralId);
  }
}

// Export an instance of the UserService class
export default new UserReferralService();
