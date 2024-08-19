// Import external libraries
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import DAOs
import userDetailDao from "../../daos/UserDetail.dao";
import userReferralResponseDao from "../../daos/UserReferralResponse.dao";
import userReferralDao from "../../daos/UserReferral.dao";

// Import DTOs
import { UserSubscriptionDetailsUpdateDto } from "../../dtos/User.dto";
import { UsersListingFilterOptions } from "../dtos/User.dto";

// Import enums
import { UserType } from "../../enums/User.enum";

// Import models
import { DbUserDetailDto } from "../../db/models/UserDetail.model";

// Import services
import { userExperienceServiceObj } from "./UserExperience.service";
import {userReferralServiceObj} from "../services/UserReferral.service";

/**
 * UserService
 *
 * Service class for user details related operations
 * */
class UserService {
  /**
   * getUsers
   * 
   * Retrieves user details based on the provided filter options.
   *
   * @param {UsersListingFilterOptions} usersRecordListingFilterRequest - The filter options for user details.
   * @return {Promise<QueryResponse<DbUserDetailDto> | DbUserDetailDto[] | any[]>} A promise that resolves to the user details.
   */
  async getUsers(
    usersRecordListingFilterRequest: UsersListingFilterOptions
  ): Promise<QueryResponse<DbUserDetailDto> | DbUserDetailDto[] | any[]> {
    // Log the action of getting user details by CAND/EMP
    global.logger.info("Get user details by CAND/EMP [admin user service]");

    // Fetch all user details from the DAO including candidates and employees
    let userDetails = await userDetailDao.getUsers(
      usersRecordListingFilterRequest
    );

    // If no user details found, return an empty array
    if (!userDetails.count) {
      return [];
    }

    /*
    @todo: try filtering by userType in DAO
    ->tried in DAO using query.where("userType").contains([userType]) but it didn't work,
    ->tried in DAO using query.where("userType").contains(userType) but it didn't work,
    ->tried filter expressions in query but it didn't work
    ->tried "in" operator but it didn't work
    ->Refer the docs:- https://dynamoosejs.com/guide/Query#modelqueryfilter
    */

    // if userType is not provided, return all userDetails
    // The return type is "QueryResponse<DbUserDetailDto>"
    if (!usersRecordListingFilterRequest.userType) {
      return userDetails;
    }

    // Filter userDetails manually to ensure specified userType is returned
    const filteredUserDetails = userDetails.filter(
      (eachUserDetail: DbUserDetailDto) => {
        return (
          usersRecordListingFilterRequest.userType &&
          eachUserDetail.userType.includes(
            usersRecordListingFilterRequest.userType
          )
        );
      }
    );

    // If userType is CAND, return the filtered user details
    // The return type is "DbUserDetailDto[]"
    if (usersRecordListingFilterRequest.userType === UserType.CAND) {
      return filteredUserDetails;
    }

    // If userType is EMP, modify the response structure with the currentCompanyName, currentCompanyEmail, isCurrentCompEmailVerified
    const empWithExperience = await Promise.all(
      filteredUserDetails.map(async (eachUserDetail) => {
        // Extract email from the PK
        const email = eachUserDetail.PK.split("#")[2];

        // get all experiences by email
        const experiences =
          await userExperienceServiceObj.getUserExperiencesByEmail(email);

        // Find the current experience which has isCurrent true
        const currentExperience = experiences.find((exp) => exp.isCurrent);

        // Return the employee details with currentCompanyName, currentCompanyEmail, isCurrentCompEmailVerified
        return {
          ...eachUserDetail, // Include all original employee details
          currentCompanyName: currentExperience?.companyName || "",
          currentCompanyEmail: currentExperience?.emailId || "",
          isCurrentCompEmailVerified:
            currentExperience?.isEmailVerified || false,
        };
      })
    );

    // Return the employee details with currentCompanyName, currentCompanyEmail, isCurrentCompEmailVerified
    // The return type "any[]"
    return empWithExperience;
  }

  /**
   * getUserDetailById
   *
   * Retrieves the user detail by ID.
   *
   * @param {string} userId - The ID of the user.
   * @return {Promise<QueryResponse<DbUserDetailDto>>} A promise that resolves to the user detail.
   */
  async getUserDetailById(
    userId: string
  ): Promise<QueryResponse<DbUserDetailDto>> {
    // Log the action of getting user details
    global.logger.info("Get user details by id [admin user service]");

    // Fetch user details by id from the DAO
    return userDetailDao.getUserById(userId);
  }

  /**
   * getUserDetailByEmail
   *
   * Retrieves the user detail by email.
   *
   * @param {string} userEmail - The email of the user.
   * @return {Promise<QueryResponse<DbUserDetailDto>>} A promise that resolves to the user detail.
   */
  async getUserDetailByEmail(
    userEmail: string
  ): Promise<QueryResponse<DbUserDetailDto>> {
    // Log the action of getting user details
    global.logger.info("Get user details by email by [admin user service]");

    // Fetch user details by email from the DAO
    return userDetailDao.get(userEmail);
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
    const referralResponsesByEmpEmail = await userReferralResponseDao.get(userEmail);

    // If no user referral responses found, return an empty object
    if (!referralResponsesByEmpEmail.count) {
      return {};
    }

    // extract refResponsesByEmpEmail from the response
    const refResponsesByEmpEmail = referralResponsesByEmpEmail[0];

    // get rejected, accepted, done, and passed referrals with jobUrl and if no referrals found, return an empty array
    const rejectedRef =
      refResponsesByEmpEmail.rejectedRefIds.length > 0
        ? await userReferralServiceObj.getReferralsByIds(
            refResponsesByEmpEmail.rejectedRefIds
          )
        : [];
    const acceptedRef =
      refResponsesByEmpEmail.acceptedRefIds.length > 0
        ? await userReferralServiceObj.getReferralsByIds(
            refResponsesByEmpEmail.acceptedRefIds
          )
        : [];
    const doneRef =
      refResponsesByEmpEmail.doneRefIds.length > 0
        ? await userReferralServiceObj.getReferralsByIds(
            refResponsesByEmpEmail.doneRefIds
          )
        : [];
    const passedRef =
      refResponsesByEmpEmail.passedRefIds.length > 0
        ? await userReferralServiceObj.getReferralsByIds(
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

  /**
   * updateReferralCount
   *
   * Updates the referral count for a user.
   *
   * @param {string} id - The ID of the user.
   * @param {string} candEmail - The candidate's email address.
   * @param {UserSubscriptionDetailsUpdateDto} updateBodyObject - The object containing updated subscription details.
   * @returns {Promise<DbUserDetailDto>} - A promise that resolves to the updated user details.
   */
  async updateReferralCount(
    id: string,
    candEmail: string,
    updateBodyObject: UserSubscriptionDetailsUpdateDto
  ): Promise<DbUserDetailDto> {
    return userDetailDao.updateReferralCount(id, candEmail, updateBodyObject);
  }
}

// Create an instance of UserService
const userServiceObj = new UserService();

// Export the UserService instance and class
export { userServiceObj, UserService };
