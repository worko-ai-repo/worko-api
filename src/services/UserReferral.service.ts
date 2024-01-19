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

  /**
   * Retrieves user Referral by email.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - A Promise that resolves to the Referral of the user
   */
  async get(email: string): Promise<any> {
    // Logging the action of getting user Referral by email in the service layer
    logger.info("Fetching user Referral by email [UserReferralService]");
    return userReferralDao.get(email);
  }

  /**
   *
   * Fetches Referral based on  companySK
   *
   * @param companySK - Company sort key
   * @returns {Promise<any>} - A Promise that resolves to the Referral of the user
   *
   */
  async getByGSI1PK(companySK: string): Promise<any> {
    // Logging the action of getting user Referral by companySK in the service layer
    logger.info("Fetching Referrals by companySK  [UserReferralService]");
    return userReferralDao.getByGSI1PK(companySK);
  }

  /**
   *
   * Fetches Referral based on GSI1PK, companySK, and status.
   *
   * @param companySK - Company sort key
   * @param status - Referral status
   * @returns {Promise<any>} - A Promise that resolves to the Referral of the user
   *
   */
  async getByGSI1PKAndStatus(companySK: string, status: string): Promise<any> {
    // Logging the action of getting user Referral by GSI1PK & status in the service layer
    logger.info("Fetching Referral by GSI1PK and status [UserReferralService]");
    return userReferralDao.getByGSI1PKAndStatus(companySK, status);
  }

  /**
   * Retrieves user Referral by status.
   *
   * @param email - Email of the user
   * @param status - referral status
   * @returns {Promise<any>} - A Promise that resolves to the Referral of the user
   */
  async getByStatus(email: string, status: string): Promise<any> {
    // Logging the action of getting user Referral by status in the service layer
    logger.info("Fetching user Referral by status [UserReferralService]");
    return userReferralDao.getByStatus(email, status);
  }

  /**
   * updates the status of user Referral
   *
   * @param referralId - Referral ID
   * @param email - Email of the user
   * @param status - status
   * @returns {Promise<any>} - A Promise that resolves to the Referral of the user
   */
  async updateStatus(
    referralId: string,
    email: string,
    status: string
  ): Promise<any> {
    // Logging the action of getting user Referral by email in the service layer
    global.logger.info("Updating user Referral status [UserReferralService]");
    return userReferralDao.updateStatus(referralId, email, status);
  }
}

// Export an instance of the UserService class
export default new UserReferralService();
