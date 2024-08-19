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
   * Retrieve the user experiences along with he respective company details for the provided user email address.
   *
   * @param {string} userEmail - The email of the user to retrieve experience for
   */
  async getUserExperiencesByEmail(userEmail: string) {
    // Log the action of getting user experience
    global.logger.info("Get user experience by email [admin experience service]");

    // Retrieve the user experience based on the email
    const userExperience = await userExperienceDao.get(userEmail);

    // If not experience found for the user, then return an empty array
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

    // Prepare response data
    const finalUserExperience = userExperience.map((item: DbUserExperienceDto) => {
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