
// Import the dynamoose types
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import { DbUserAchievementDto, UserAchievementModel } from "../db/models/UserAchievement.model";

//Load the local dtos
import { UserAchievementDTO } from "../dtos/UserAchievement.dto";

// UserAchievementDao class implementing the BaseDao interface
class UserAchievementDao implements BaseDao {
  modelName = "userAchievement";
  partitianKey = "USR#EML#{primaryEmail}"; // Partition key structure for user emails
  sortKeys = { SK_ID: "ACHIEVEMENT#" }; // Sort key structure using unique IDs

  /**
   * Fetches user Achievement based on the provided email.
   * @param email - Email address of the user
   * @returns User Achievement corresponding to the email
   */
  async get(email: string) {
    logger.info("Fetching user Achievement by email [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    const SK = this.sortKeys.SK_ID;
    return UserAchievementModel.query("PK").eq(PK).where("SK").eq(SK).exec();
  }

  async getUserAchievementBasicDetails(email: string): Promise<QueryResponse<DbUserAchievementDto>> {
    global.logger.info("Fetching user Achievement by email [DAO]");
    const PK: string = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    const SK: string = this.sortKeys.SK_ID;
    return UserAchievementModel.query("PK").eq(PK).where("SK").eq(SK).attributes([
      "achievements"
    ]).exec();
  }

  /**
   * Creates user Achievement.
   * @param email - Email address of the user
   * @param userAchievementDTO - User Achievement data
   * @returns Created user Achievements
   */
  async create(email: string, userAchievementDTO: UserAchievementDTO) {
    logger.info("Creating user Achievement [DAO]");
    const userAchievement = {
      PK: this.partitianKey.strtr({
        "{primaryEmail}": email,
      }),
      SK: this.sortKeys.SK_ID,
      ...userAchievementDTO,
    };
    global.logger.debug("userAch", userAchievement);
    return UserAchievementModel.create(userAchievement);
  }

  /**
   * Updates user Achievement uri.
   * @param email - Email address of the user
   * @param userAchievementDTO - User Achievement data to update
   * @returns Updated user Achievements
   */
  async update(email: string, userAchievementDTO: UserAchievementDTO) {
    logger.info("Updating user Achievements [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    const SK = this.sortKeys.SK_ID;
    return UserAchievementModel.update({ PK: PK, SK: SK }, userAchievementDTO);
  }
}

const userAchievementDao = new UserAchievementDao();

export default userAchievementDao;
