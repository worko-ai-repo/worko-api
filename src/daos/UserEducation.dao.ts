//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import { UserEducationModel } from "../db/models/UserEducation.model";

//Load the local dtos
import { UserEducationDTO } from "../dtos/UserEducation.dto";

// import { UserEducationDTO } from "../dtos/UserEducation.dto";

//Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";

// UserEducationDao class implementing the BaseDao interface
class UserEducationDao implements BaseDao {
  modelName = "userEducation";
  partitianKey = "USR#EML#{primaryEmail}"; // Partition key structure for user emails
  sortKeys = { SK_ID: "EDU#ID#{eduId}" }; // Sort key structure using unique IDs

  /**
   * Fetches user Education based on the provided email.
   * @param email - Email address of the user
   * @returns User details corresponding to the email
   */
  async get(email: string) {
    logger.info("Get user Education by id [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    // const SK = this.sortKeys.SK_ID;
    return UserEducationModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith("EDU#ID#")
      .exec();
  }

  /**
   * @param email
   * @param department
   * @param designation
   * @returns
   */
  async create(email: string, userEducationDTO: UserEducationDTO) {
    logger.info("Create employee Work Education [DAO]");
    const SK = this.sortKeys.SK_ID.strtr({
      "{eduId}": UlidService.getUlidId(),
    });
    console.log("SK: ", SK);
    const userEducation = {
      PK: this.partitianKey.strtr({
        "{primaryEmail}": email,
      }),
      SK: SK,
      ...userEducationDTO,
    };
    return await UserEducationModel.create(userEducation);
  }

  /**
   *
   * @param email
   * @returns
   */
  async update(email: string, SK: string, userEducationDTO: UserEducationDTO) {
    logger.info("Update user education [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    return UserEducationModel.update({ PK: PK, SK: SK }, userEducationDTO);
  }
}

const userEducationDao = new UserEducationDao();

export default userEducationDao;
