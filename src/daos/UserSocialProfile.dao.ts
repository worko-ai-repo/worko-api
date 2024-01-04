//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import { UserSocialProfileModel } from "../db/models/UserSocialProfile.model";

//Load the local dtos
import { UserSocialProfileDTO } from "../dtos/UserSocialProfile.dto";

//Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";

// UserSocialProfileDao class implementing the BaseDao interface
class UserSocialProfileDao implements BaseDao {
  modelName = "userSocialProfile";
  partitianKey = "USR#EML#{primaryEmail}"; // Partition key structure for user emails
  sortKeys = { SK_ID: "SOCIAL#" }; // Sort key structure using unique IDs

  /**
   * Fetches user SocialProfile based on the provided email.
   * @param email - Email address of the user
   * @returns User details corresponding to the email
   */
  async get(email: string) {
    logger.info("Fetching user SocialProfile by email [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    const SK = this.sortKeys.SK_ID;
    return UserSocialProfileModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith(SK)
      .exec();
  }

  /**
   * Creates user SocialProfile.
   * @param email - Email address of the user
   * @param userSocialProfileDTO - User social profile data
   * @returns Created user social profile
   */
  async create(email: string, userSocialProfileDTO: UserSocialProfileDTO) {
    logger.info("Creating user SocialProfile [DAO]");
    const userSocialProfile = {
      PK: this.partitianKey.strtr({
        "{primaryEmail}": email,
      }),
      SK: this.sortKeys.SK_ID,
      ...userSocialProfileDTO,
    };
    return UserSocialProfileModel.create(userSocialProfile);
  }

  /**
   * Updates user social profile uri.
   * @param email - Email address of the user
   * @param userSocialProfileDTO - User social profile data to update
   * @returns Updated user social profile
   */
  async update(email: string, userSocialProfileDTO: UserSocialProfileDTO) {
    logger.info("Updating user social profile [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    const SK = this.sortKeys.SK_ID;
    return UserSocialProfileModel.update(
      { PK: PK, SK: SK },
      userSocialProfileDTO
    );
  }
}

const userSocialProfileDao = new UserSocialProfileDao();

export default userSocialProfileDao;
