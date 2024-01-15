//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import { UserProfilePercentageModel } from "../db/models/UserProfilePercentage.model";

//Load the local dtos
import { UserProfilePercentageDTO } from "../dtos/UserProfilePercentage.dto";

//Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";

// UserProfilePercentageDao class implementing the BaseDao interface
class UserProfilePercentageDao implements BaseDao {
  modelName = "userProfilePercentage";
  partitianKey = "USR#EML#{primaryEmail}"; // Partition key structure for user emails
  sortKeys = { SK_ID: "PFL#PERC#" }; // Sort key structure

  /**
   * Fetches user ProfilePercentage based on the provided email.
   * @param email - Email address of the user
   * @returns User ProfilePercentage corresponding to the email
   */
  async get(email: string) {
    logger.info("Fetching user ProfilePercentage by email [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    const SK = this.sortKeys.SK_ID;
    return UserProfilePercentageModel.query("PK")
      .eq(PK)
      .where("SK")
      .eq(SK)
      .exec();
  }

  /**
   * Creates user ProfilePercentage.
   * @param email - Email address of the user
   * @param userProfilePercentageDTO - User ProfilePercentage data
   * @returns Created user ProfilePercentages
   */
  async create(
    email: string,
    userProfilePercentageDTO: UserProfilePercentageDTO
  ) {
    logger.info("Creating user ProfilePercentage [DAO]");
    const userProfilePercentage = {
      PK: this.partitianKey.strtr({
        "{primaryEmail}": email,
      }),
      SK: this.sortKeys.SK_ID,
      ...userProfilePercentageDTO,
    };
    return UserProfilePercentageModel.create(userProfilePercentage);
  }

  /**
   * Updates user ProfilePercentage uri.
   * @param email - Email address of the user
   * @param userProfilePercentageDTO - User ProfilePercentage data to update
   * @returns Updated user ProfilePercentages
   */
  async update(
    email: string,
    userProfilePercentageDTO: UserProfilePercentageDTO
  ) {
    logger.info("Updating user ProfilePercentages [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    const SK = this.sortKeys.SK_ID;
    return UserProfilePercentageModel.update(
      { PK: PK, SK: SK },
      userProfilePercentageDTO
    );
  }
}

const userProfilePercentageDao = new UserProfilePercentageDao();

export default userProfilePercentageDao;
