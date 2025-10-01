// Load the local daos
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import daos
import userSkillDao from "../daos/UserSkill.dao";

//Load the local dto
import { UserSkillDTO, UserSkillPartialCvExtractUpdateDto } from "../dtos/UserSkill.dto";

// Import models
import { DbUserSkillDto } from "../db/models/UserSkill.model";

/**
 * UserSkillService class is responsible for managing user Skill-related operations.
 */
class UserSkillService {
  /**
   * Retrieves user Skill by email.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - A Promise that resolves to the Skill of the user
   */
  async get(email: string): Promise<any> {
    // Logging the action of getting user Skill by email in the service layer
    logger.info("Fetching user Skill by email [UserSkillService]");
    return userSkillDao.get(email);
  }

  /**
   * Creates a new user Skill.
   *
   * @param email - Email of the user
   * @param userSkillDTO - Data Transfer Object containing user Skill details
   * @returns {Promise<any>} - A Promise that resolves when the Skill is successfully created
   */
  async create(email: string, userSkillDTO: UserSkillDTO): Promise<any> {
    // Logging the action of creating user Skill in the service layer
    logger.info("Creating user Skill [UserSkillService]");
    return userSkillDao.create(email, userSkillDTO);
  }

  /**
   * Updates an existing user Skill.
   *
   * @param email - Email of the user
   * @param userSkillDTO - Data Transfer Object containing updated user Skill details
   * @returns {Promise<any>} - A Promise that resolves when the Skill is successfully updated
   */
  async update(email: string, userSkillDTO: UserSkillDTO): Promise<any> {
    // Logging the action of updating user Skill in the service layer
    logger.info("Updating user Skill [UserSkillService]");

    return userSkillDao.update(email, userSkillDTO);
  }

  /**
   * getUserSkillsByEmail
   * 
   * Retrieves user skills by email.
   *
   * @param {string} email - The email address of the user.
   * @returns {Promise<QueryResponse<DbUserSkillDto>>} - A promise that resolves to the query response containing the user's skills data.
   */
  async getUserSkillsByEmail(
    email: string
  ): Promise<QueryResponse<DbUserSkillDto>>  {
    // logger
    global.logger.info("Fetching user Skill by email [UserSkillService]", {
      filePath: __filename,
      methodName: this.getUserSkillsByEmail.name,
      email,
    });

    return userSkillDao.getUserSkillsByEmail(email);
  }

  async createOrUpdateUserSkillForPartialCvExtract(
    email: string,
    userSkillData: UserSkillPartialCvExtractUpdateDto
  ): Promise<DbUserSkillDto> {
    global.logger.info(
      "Create or update user skill for partial cv extract [Service]"
    );

    const existingUserSkill: QueryResponse<DbUserSkillDto> =
      await this.getUserSkillsByEmail(email);
    if (existingUserSkill.count) {
      const existingUserSkillData: DbUserSkillDto = existingUserSkill[0]; 

      const mergedSkills = [
        ...(existingUserSkillData?.coreSkills ?? []),
        ...(userSkillData?.coreSkills ?? []),
      ];

      // Deduplicate by skillName (case-insensitive)
      const uniqueSkills = Array.from(
        new Map(
          mergedSkills.map(skill => [skill.skillName.toLowerCase(), skill])
        ).values()
      );

      const finalUpdateData: UserSkillDTO = {
        coreSkills: uniqueSkills,
      };
      return this.update(email, finalUpdateData);
    }

    return this.create(email, {
      ...userSkillData,
    });
  }
}

// Exporting an instance of the UserSkillService class
export default new UserSkillService();
