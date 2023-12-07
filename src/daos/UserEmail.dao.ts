//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import { UserEmailModel } from "../db/models/UserEmail.model";

//Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";

// UserEmailDao class implementing the BaseDao interface
class UserEmailDao implements BaseDao {
  modelName = "userEmail";
  partitianKey = "USR#EML#{primaryEmail}"; // Partition key structure for user emails
  sortKeys = { SK_ID: "EMAIL#ID#{uuid}" }; // Sort key structure using unique IDs

  /**
   * Fetches user details based on the provided email.
   * @param email - Email address of the user
   * @returns User details corresponding to the email
   */
  /* async get(email: string) {
    try {
      const PK = this.partitianKey.strtr({
        "{primaryEmail}": email,
      });
      return UserEmailModel.query("PK").eq(PK).exec();
    } catch (error) {
      console.error("Error in getUserDetails:", error);
      throw error;
    }
  } */

  /**
   * Adds a new user by creating a user sign-up DTO and saving it.
   *
   * @param userSignUpDTO - User sign-up data transfer object
   * @param email - Email address of the user
   */
  async create(email: string, companyName: string, companyEmailId: string) {
    try {
      const userEmailDTO = {
        PK: this.partitianKey.strtr({
          "{primaryEmail}": email,
        }),
        SK: this.sortKeys.SK_ID.strtr({
          "{uuid}": UlidService.getUlidId(),
        }),
        companyName: companyName,
        emailId: companyEmailId,
        isEmailVerified: false,
      };
      return UserEmailModel.create(userEmailDTO);
    } catch (error) {
      console.log("Addd user email -> ", error);
      throw error;
    }
  }
}

const userEmailDao = new UserEmailDao();

export default userEmailDao;
