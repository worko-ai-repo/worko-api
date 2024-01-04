//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import { UserSkillModel } from "../db/models/UserSkill.model";

//Load the local dtos
import { UserSkillDTO } from "../dtos/UserSkill.dto";

//Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";

// UserSkillDao class implementing the BaseDao interface
class UserSkillDao implements BaseDao {
  modelName = "userSkill";
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
}

const userSkillDao = new UserSkillDao();

export default userSkillDao;
