// Load npm packages
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Load local dtos
import { ReferralListingFilterOptions } from "../dtos/Referral.dto";

// Load local daos
import userReferralDao from "../../daos/UserReferral.dao";

// Load local models
import { DbUserReferralDto } from "../../db/models/UserReferral.model";

/**
 * UserReferralService
 *
 * Service class for handling user referral related operations.
 */
class UserReferralService {
  /**
   * getReferralDetailById
   *
   * Get referral detail by ID.
   *
   * @param {string} referralId - The ID of the referral.
   * @return {Promise<QueryResponse<DbUserReferralDto>>} A promise that resolves to the query response containing the referral details.
   */
  async getReferralDetailById(
    referralId: string
  ): Promise<QueryResponse<DbUserReferralDto>> {
    // Log the action of getting referral details in the service
    global.logger.info(
      "Get referral detail by id [admin user referral service]"
    );

    // Get referral details by id from the DAO
    return userReferralDao.getByGSI1(referralId);
  }

  /**
   * getReferrals
   *
   * Retrieves referral details from the DAO based on the provided filter options.
   *
   * @param {ReferralListingFilterOptions} referralRecordListingFilterRequest - The filter options for the referral record listing.
   * @return {Promise<QueryResponse<DbUserReferralDto>>} A promise that resolves to the query response containing the retrieved referral details.
   */
  async getReferrals(
    referralRecordListingFilterRequest: ReferralListingFilterOptions
  ): Promise<QueryResponse<DbUserReferralDto>> {
    // Log the action of getting referral details in the service
    global.logger.info("Get all referrals [admin user referral service]");

    // Get all referral data from the DAO
    return userReferralDao.getReferrals(referralRecordListingFilterRequest);
  }

  /**
   * Retrieves referrals by their IDs.
   *
   * get referrals by referralIds and map with jobUrl
   *
   * @param {string[]} referralIds - An array of referral IDs.
   */
  async getReferralsByIds(referralIds: string[]) {
    // Log the action of getting referral details in the service
    global.logger.info("Get referrals by ids [admin service]");

    // get referrals by referralIds
    return userReferralDao.getReferralsByIdsUsingGsis(referralIds);
  }
}

// Create an instance of the "UserReferralService" class to use its methods/functions
const userReferralServiceObj = new UserReferralService();

// Export the UserReferralService instance and class
export { userReferralServiceObj, UserReferralService };
