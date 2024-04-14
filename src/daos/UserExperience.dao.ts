//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import { DbUserExperienceDto, UserExperienceModel } from "../db/models/UserExperience.model";

//Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";

// Load dtos and other packages
import { UserExperienceDTO } from "../dtos/UserExperience.dto";
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// UserExperienceDao class implementing the BaseDao interface
class UserExperienceDao implements BaseDao {
  modelName = "userExperience";
  partitianKey = "USR#EML#{primaryEmail}"; // Partition key structure for user emails
  sortKeys = { SK_ID: "EXP#ID#{uuid}" }; // Sort key structure using unique IDs

  /**
   * Fetches user experience based on the provided email.
   * @param email - Email address of the user
   * @returns User details corresponding to the email
   */
  async get(email: string) {
    global.logger.info("Get user experience by id [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    const [skBegins] = this.sortKeys.SK_ID.split("#", 2);
    return UserExperienceModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith(skBegins)
      .exec();
  }

  /**
   * getByUserPrimaryEmailAndId
   *
   * Retrieves user experience data by primary email and ID asynchronously.
   *
   * @param {string} email - The primary email of the user.
   * @param {string} id - The ID of the experience to retrieve.
   * @returns {Promise<QueryResponse<DbUserExperienceDto>>} A promise that resolves with the query response containing the user's experience data.
   */
  async getByUserPrimaryEmailAndId(
    email: string,
    id: string
  ): Promise<QueryResponse<DbUserExperienceDto>> {
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    
    const SK = this.sortKeys.SK_ID.strtr({
      "{uuid}": id,
    });

    return UserExperienceModel
      .query("PK")
      .eq(PK)
      .where("SK")
      .eq(SK)
      .exec();
  }

  /**
   * @param email
   * @param UserExperienceDto
   * @returns
   */
  async create(email: string, userExperienceDto: UserExperienceDTO) {
    global.logger.info("Create employee Work Experience [DAO]");
    const id = UlidService.getUlidId();
    const userExperienceDTO = {
      PK: this.partitianKey.strtr({
        "{primaryEmail}": email,
      }),
      SK: this.sortKeys.SK_ID.strtr({
        "{uuid}": id,
      }),
      id: id,
      isEmailVerified: false,
      ...userExperienceDto,
      companyId: userExperienceDto.companySK.split("#").pop(),
    };
    return UserExperienceModel.create(userExperienceDTO);
  }

  /**
   *
   * @param email
   * @returns
   */
  async update(
    email: string,
    SK: string,
    userExperienceDTO: UserExperienceDTO
  ) {
    global.logger.info("Update user Experience [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    return UserExperienceModel.update({ PK: PK, SK: SK }, userExperienceDTO);
  }
  
  /**
   * verifyWorkEmail
   * 
   * A description of the entire function.
   *
   * @param {string} primaryEmail - description of parameter
   * @param {string} id - description of parameter
   * @return {Promise<DbUserExperienceDto>} description of return value
   */
  async verifyWorkEmail(
    primaryEmail: string,
    id: string
  ): Promise<DbUserExperienceDto> {
    let inputKey = {
      PK: this.partitianKey.strtr({
        "{primaryEmail}": primaryEmail,
      }),
      SK: this.sortKeys.SK_ID.strtr({
        "{uuid}": id,
      }),
    };
    return UserExperienceModel.update(inputKey, { isEmailVerified: true });
  }
}

const userExperienceDao = new UserExperienceDao();

export default userExperienceDao;
