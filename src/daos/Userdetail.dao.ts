//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import { UserDetailModel } from "../db/models/UserDetail.model";

//Load the local dtos
import { UserLinkedinSignUpDTO } from "../dtos/User.dto";

//Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";

// UserDetailDao class implementing the BaseDao interface
class UserDetailDao implements BaseDao {
  modelName = "user";
  partitianKey = "USR#EML#{primaryEmail}"; // Partition key structure for user emails
  sortKeys = { SK_ID: "ID#{uuid}" }; // Sort key structure using unique IDs

  /**
   * Fetches user details based on the provided email.
   * @param email - Email address of the user
   * @returns User details corresponding to the email
   */
  async getUserDetails(email: string) {
    try {
      const PK = this.partitianKey.strtr({
        "{primaryEmail}": email,
      });
      return UserDetailModel.query("PK").eq(PK).exec();
    } catch (error) {
      console.error("Error in getUserDetails:", error);
      throw error;
    }
  }

  /**
   * Adds a new user by creating a user sign-up DTO and saving it.
   *
   * @param userSignUpDTO - User sign-up data transfer object
   * @param email - Email address of the user
   */
  async add(userSignUpDTO: UserLinkedinSignUpDTO) {
    try {
      userSignUpDTO.PK = this.partitianKey.strtr({
        "{primaryEmail}": userSignUpDTO.emailList.primary,
      });
      userSignUpDTO.SK = this.sortKeys.SK_ID.strtr({
        "{uuid}": UlidService.getUlidId(),
      });
      userSignUpDTO.isEmailVerified = false;
      userSignUpDTO.isNumberVerified = false;
      return UserDetailModel.create(userSignUpDTO);
    } catch (error) {
      console.log("Addd user -> ", error);
      throw error;
    }
  }
}

const userDetailDao = new UserDetailDao();

export default userDetailDao;
