// import dynamoose types 
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import the necessary DAOs
import userExperienceDao from "../../daos/UserExperience.dao";
import companyDetailDao from "../../daos/CompanyDetail.dao";

// Import the necessary models
import { DbUserExperienceDto } from "../../db/models/UserExperience.model";

/**
 * UserExperienceService
 * 
 * Service class for handling user experience operations by admin.
 */
class UserExperienceService {
  /**
   * getUserExperiencesByEmail
   * 
   * Retrieves user experiences by email id.
   *
   * @param userEmail - Email of the user
   * @returns {Promise<QueryResponse<DbUserExperienceDto>>} - A promise that resolves to the query response containing the user's experience data
   */
  async getUserExperiencesByEmail(userEmail: string): Promise<QueryResponse<DbUserExperienceDto>> {
    // Log the action of getting user experience
    global.logger.info("Get user experience by email [admin experience service]");

    // Retrieve the user experiences based on the email
    return userExperienceDao.get(userEmail);
  }

  /**
   * getUserExperiencesWithCompanyInfoByEmail
   *
   * Retrieves user experiences with company details by email id.
   *
   * @param userEmail - Email of the user
   */
  async getUserExperiencesWithCompanyInfoByEmail(userEmail: string) {
    // Log the action of getting user experience
    global.logger.info("Get user experiences with company info by email [admin experience service]");

    // Retrieve the user experience based on the email
    const userExperience = await this.getUserExperiencesByEmail(userEmail);

    // If no experiences found for the user, then return an empty array
    if (!userExperience.count) {
      return [];
    }

    // Get company IDs
    const companyIDs: string[] = userExperience.map((obj) => obj.companyId);

    // Get unique company IDs using a Set
    const uniqueCompanyIDs: string[] = Array.from(new Set(companyIDs));

    // Fetch company details for each unique company ID
    const companyDetailsResults = await companyDetailDao.getCompanyDetailsByIds(
      uniqueCompanyIDs
    );

    // Prepare response data with company details
    const finalUserExperience = userExperience.map(
      (item: DbUserExperienceDto) => {
        const companyDetails = companyDetailsResults.find(
          (companyDetail) => companyDetail.id === item.companyId
        );
        return {
          ...item,
          companyLogoUrl: companyDetails?.logoUrl || null,
          companyLogo: companyDetails?.logo || null,
          isCompanyEmailVerified: item?.isEmailVerified || false,
        };
      }
    );

    // Send successful response with user data and company details
    return finalUserExperience;
  }
}

// Create an instance of the UserExperienceService
const userExperienceServiceObj = new UserExperienceService();

// Export an instance of the UserExperienceService class and the UserExperienceService class
export {
  userExperienceServiceObj,
  UserExperienceService
}