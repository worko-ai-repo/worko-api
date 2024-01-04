// Load the local daos
import userSkillDao from "../daos/UserSkill.dao";

//Load the local dto
import { UserSkillDTO } from "../dtos/UserSkill.dto";

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
}

// Exporting an instance of the UserSkillService class
export default new UserSkillService();
