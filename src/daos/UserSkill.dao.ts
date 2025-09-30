// Import the dynamoose types
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import the dynamoose types
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import { DbUserSkillDto, UserSkillModel } from "../db/models/UserSkill.model";
import { DbUserSkillDto, UserSkillModel } from "../db/models/UserSkill.model";

//Load the local dtos
import { UserSkillDTO } from "../dtos/UserSkill.dto";

// UserSkillDao class implementing the BaseDao interface
class UserSkillDao implements BaseDao {
  modelName = "UserSkill";
  modelName = "UserSkill";
  partitianKey = "USR#EML#{primaryEmail}"; // Partition key structure for user emails
  sortKeys = { SK_ID: "SKILL#" }; // Sort key structure using unique IDs

  /**
   * Fetches user Skill based on the provided email.
   * @param email - Email address of the user
   * @returns User details corresponding to the email
   */
  async get(email: string) {
    logger.info("Fetching user Skill by email [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    const SK = this.sortKeys.SK_ID;
    return UserSkillModel.query("PK").eq(PK).where("SK").eq(SK).exec();
  }

  /**
   * Creates user Skill.
   * @param email - Email address of the user
   * @param userSkillDTO - User skill data
   * @returns Created user skills
   */
  async create(email: string, userSkillDTO: UserSkillDTO) {
    logger.info("Creating user Skill [DAO]");
    const userSkill = {
      PK: this.partitianKey.strtr({
        "{primaryEmail}": email,
      }),
      SK: this.sortKeys.SK_ID,
      ...userSkillDTO,
    };
    return UserSkillModel.create(userSkill);
  }

  /**
   * Updates user skill uri.
   * @param email - Email address of the user
   * @param userSkillDTO - User skill data to update
   * @returns Updated user skills
   */
  async update(email: string, userSkillDTO: UserSkillDTO) {
    logger.info("Updating user skills [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    const SK = this.sortKeys.SK_ID;
    return UserSkillModel.update({ PK: PK, SK: SK }, userSkillDTO);
  }

  /**
   * getUserSkillsByEmail
   * 
   * Retrieves user skills by email.
   *
   * @param {string} email - Email of the user
   * @returns {Promise<QueryResponse<DbUserSkillDto>>} - A promise that resolves to the query response containing the user's skills data
   */
  async getUserSkillsByEmail(
    email: string
  ): Promise<QueryResponse<DbUserSkillDto>> {
    // logger
    global.logger.info(`Get user skills by email [DAO]`, {
      filePath: __filename,
      methodName: this.getUserSkillsByEmail.name,
      email,
    });

    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    const SK = this.sortKeys.SK_ID;

    global.logger.debug(`input keys`, {
      PK,
      SK,
    });

    return UserSkillModel.query("PK")
      .eq(PK)
      .where("SK")
      .eq(SK)
      .attributes([
        "softSkills",
        "coreSkills",
        "certifications",
        "technicalSkills",
      ])
      .exec();
  }
}

const userSkillDao = new UserSkillDao();

export default userSkillDao;
