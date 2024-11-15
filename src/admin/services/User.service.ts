// Import external libraries
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import DAOs
import userDetailDao from "../../daos/UserDetail.dao";

// Import DTOs
import { UserSubscriptionDetailsUpdateDto } from "../../dtos/User.dto";
import { UsersListingFilterOptions } from "../dtos/User.dto";

// Import enums
import { UserType } from "../../enums/User.enum";

// Import models
import { DbUserDetailDto } from "../../db/models/UserDetail.model";

// Import services
import { userExperienceServiceObj } from "./UserExperience.service";

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
   * If userType is CAND, then return the candidate signup list
   * Or if userType is undefined, then return both candidate and employee signup list
   * 
   * If userType is EMP, get the employee signup list and also include currentCompanyName, currentCompanyEmail, isCurrentCompEmailVerified
   * 
   * @param {UsersListingFilterOptions} usersRecordListingFilterRequest - The filter options for user details.
   */
  async getUsers( usersRecordListingFilterRequest: UsersListingFilterOptions ) {
    // Log the action of getting user details by CAND/EMP
    global.logger.info("Get user details by CAND/EMP [admin user service]");

    /*
    If userType is CAND, then return the candidate signup list
    Or if userType is undefined or any falsy value, then return both candidate and employee signup list
    */
    if (
      usersRecordListingFilterRequest.userType === UserType.CAND ||
      !usersRecordListingFilterRequest.userType
    ) {
      return userDetailDao.getUsers(usersRecordListingFilterRequest);
    }

    // If userType is EMP, get the employee signup list
    const userDetails = await userDetailDao.getUsers(usersRecordListingFilterRequest);

    // Destructure the fetched user details
    const { lastKey, count, timesQueried, queriedCount, ...remainingUserDetails } = userDetails;
    
    // Convert the remainingUserDetails object to an array
    const userDetailsArray = Object.values(remainingUserDetails) as unknown as DbUserDetailDto[];

    /*
    Extract email from the PK and get all experiences by email and 
    find the current experience which has "isCurrent" attribute as true(boolean) and 
    return the employee details including currentCompanyName, currentCompanyEmail, isCurrentCompEmailVerified 
    */
    const empWithExperience = await Promise.all(
      userDetailsArray.map(async (eachUserDetail: DbUserDetailDto) => {
        // Extract employee email from the PK
        const empEmail = eachUserDetail.PK.split("#")[2];

        // get all experiences by employee email
        const empExperience =
          await userExperienceServiceObj.getUserExperiencesWithCompanyInfoByEmail(
            empEmail
          );

        // Find the current employee experience which has isCurrent true
        const empCurrentExperience = empExperience.find((exp) => exp.isCurrent);

        // Return the employee details including currentCompanyName, currentCompanyEmail, isCurrentCompEmailVerified
        return {
          ...eachUserDetail, // Include all original employee details
          currentCompanyName: empCurrentExperience?.companyName || "",
          currentCompanyEmail: empCurrentExperience?.emailId || "",
          isCurrentCompEmailVerified:
            empCurrentExperience?.isEmailVerified || false,
        };
      })
    );

    // Return the employee details including currentCompanyName, currentCompanyEmail, isCurrentCompEmailVerified with pagination
    return {
      ...empWithExperience,
      lastKey,
      count,
      timesQueried,
      queriedCount
    };
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
