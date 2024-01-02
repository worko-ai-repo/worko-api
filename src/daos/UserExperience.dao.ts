//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import { UserExperienceModel } from "../db/models/UserExperience.model";

//Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";

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
    console.log("Get user experience by id [DAO]");
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
   * @param email
   * @param department
   * @param designation
   * @returns
   */
  async create(
    email: string,
    department: string,
    designation: string,
    designationTag: number
  ) {
    try {
      console.log("Create employee Work Experience [DAO]");
      const userExperienceDTO = {
        PK: this.partitianKey.strtr({
          "{primaryEmail}": email,
        }),
        SK: this.sortKeys.SK_ID.strtr({
          "{uuid}": UlidService.getUlidId(),
        }),
        department: department,
        designation: designation,
        designationTag: designationTag,
      };
      await UserExperienceModel.create(userExperienceDTO);
    } catch (error) {
      console.log("Addd user Experience -> ", error);
      throw error;
    }
  }
}

const userExperienceDao = new UserExperienceDao();

export default userExperienceDao;
