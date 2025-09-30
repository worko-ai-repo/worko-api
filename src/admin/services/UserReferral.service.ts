// Load npm packages
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Load local dtos
import { ReferralListingFilterOptions } from "../dtos/UserReferral.dto";

// Load local daos
import userReferralDao from "../../daos/UserReferral.dao";
import userReferralResponseDao from "../../daos/UserReferralResponse.dao"
import { PaginatedResultsWithMatchingConditionsInternalResponse, PaginatedResultsWithMatchingConditionsResponse } from "../../dtos/Common.dto";

// Import helpers
import { injectEntityDetailsHelperObj } from "../../helpers/injectEntityDetails.helper";

// Load local models
import { DbUserReferralDto } from "../../db/models/UserReferral.model";
import { DbUserDetailDto } from "../../db/models/UserDetail.model";

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


  async getReferrals(
    referralRecordListingFilterRequest: ReferralListingFilterOptions
  ): Promise<
    PaginatedResultsWithMatchingConditionsInternalResponse<
      (DbUserReferralDto & {
      userDetails?: DbUserDetailDto;
      employeeDetails?: DbUserDetailDto;
    })[]
    >
  >  {
    // Log the action of getting referral details in the service
    global.logger.info("Get all referrals [admin user referral service]");

    // Get all referral data from the DAO
    const referrals: PaginatedResultsWithMatchingConditionsResponse<DbUserReferralDto> = await userReferralDao.getReferrals(referralRecordListingFilterRequest);

    const { lastKey, count, timesQueried, queriedCount, ...referralDetails } = referrals;
    const referralArray: DbUserReferralDto[] = Object.values(referralDetails);

    if(referralArray.length === 0) {
      return {
        lastKey,
        count,
        timesQueried,
        queriedCount,
        data: []
      };
    }

    const userReferralWithCandidateDetails: (DbUserReferralDto & {
      userDetails?: DbUserDetailDto;
      employeeDetails?: DbUserDetailDto;
    })[] =
      await injectEntityDetailsHelperObj.injectEntityWithUserDetails<DbUserReferralDto>(
        referralArray,
        true,
        true,
      );

    return {
      data: userReferralWithCandidateDetails,
      lastKey,
      count,
      timesQueried,
      queriedCount,
    };
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

  /**
   * getReferralResponsesByEmpEmail
   *
   * Retrieves user referral responses by email, including rejected, accepted, done, and passed referrals with job URLs.
   *
   * @param {string} userEmail - The email of the user.
   */
  async getReferralResponsesByEmpEmail(userEmail: string) {
    // Log the action of getting user referral responses
    global.logger.info(
      "Get user referral responses by email [admin user service]"
    );

    // Fetch user referral responses by email from the DAO
    const referralResponsesByEmpEmail = await userReferralResponseDao.get(
      userEmail
    );

    // If no user referral responses found, return an empty object
    if (!referralResponsesByEmpEmail.count) {
      return {};
    }

    // extract refResponsesByEmpEmail from the response
    const refResponsesByEmpEmail = referralResponsesByEmpEmail[0];

    // get rejected, accepted, done, and passed referrals with jobUrl and if no referrals found, return an empty array
    const rejectedRef =
      refResponsesByEmpEmail.rejectedRefIds.length > 0
        ? await this.getReferralsByIds(
            refResponsesByEmpEmail.rejectedRefIds
          )
        : [];
    const acceptedRef =
      refResponsesByEmpEmail.acceptedRefIds.length > 0
        ? await this.getReferralsByIds(
            refResponsesByEmpEmail.acceptedRefIds
          )
        : [];
    const doneRef =
      refResponsesByEmpEmail.doneRefIds.length > 0
        ? await this.getReferralsByIds(
            refResponsesByEmpEmail.doneRefIds
          )
        : [];
    const passedRef =
      refResponsesByEmpEmail.passedRefIds.length > 0
        ? await this.getReferralsByIds(
            refResponsesByEmpEmail.passedRefIds
          )
        : [];

    // response structure of referral responses with jobUrl
    const refRespByEmpEmailWithJobUrl = {
      rejectedRef,
      acceptedRef,
      doneRef,
      passedRef,
      PK: refResponsesByEmpEmail.PK,
      SK: refResponsesByEmpEmail.SK,
    };

    // Fetch user referral response from the DAO
    return refRespByEmpEmailWithJobUrl;
  }
}

// Create an instance of the "UserReferralService" class to use its methods/functions
const userReferralServiceObj = new UserReferralService();

// Export the UserReferralService instance and class
export { userReferralServiceObj, UserReferralService };
