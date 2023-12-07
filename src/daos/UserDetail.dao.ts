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
  async add(userSignUpDTO: UserLinkedinSignUpDTO, userType: string) {
    try {
      if (!userSignUpDTO.CV) {
        userSignUpDTO.CV = "";
      }
      const { email, ...copyUserSignUpDTO } = userSignUpDTO;
      const emailList = { primary: email };
      const newUserSignUpDTO = {
        PK: this.partitianKey.strtr({
          "{primaryEmail}": email,
        }),
        SK: this.sortKeys.SK_ID.strtr({
          "{uuid}": UlidService.getUlidId(),
        }),
        ...copyUserSignUpDTO,
        emailList: emailList,
        isEmailVerified: false,
        isNumberVerified: false,
        isSubscribed: false,
        userType: [userType],
      };
      return UserDetailModel.create(newUserSignUpDTO);
    } catch (error) {
      console.log("Addd user -> ", error);
      throw error;
    }
  }

  /**
   *
   * @param email
   * @returns
   */
  async updateEmailVerify(email: string) {
    try {
      const PK = this.partitianKey.strtr({
        "{primaryEmail}": email,
      });

      const SK = this.sortKeys.SK_ID.strtr({
        "{uuid}": "",
      });

      const users = await UserDetailModel.query("PK").eq(PK).exec();

      console.log("USERS: ", users);

      if (users && users.length > 0) {
        const user = users[0];

        // Check if user object is defined
        if (user) {
          // Update the isEmailVerified field to true
          // Update the isEmailVerified field to true
          await UserDetailModel.update(
            { PK: user.PK, SK: user.SK },
            { isEmailVerified: true }
          );
        } else {
          // Handle the case where user is undefined
          throw new Error("User not found");
        }
      } else {
        // Handle the case where users array is empty
        throw new Error("User not found");
      }
    } catch (error) {
      console.log("Update email verification -> ", error);
      throw error;
    }
  }

  async updateCv(email: string, resume: string) {
    try {
      const PK = this.partitianKey.strtr({
        "{primaryEmail}": email,
      });

      const users = await UserDetailModel.query("PK").eq(PK).exec();

      console.log("USERS: ", users);

      if (users && users.length > 0) {
        const user = users[0];

        // Check if user object is defined
        if (user) {
          /* await UserDetailModel.update(
            { PK: user.PK, SK: user.SK },
            { CV: resume }
          ); */
        } else {
          // Handle the case where user is undefined
          throw new Error("User not found");
        }
      } else {
        // Handle the case where users array is empty
        throw new Error("User not found");
      }
    } catch (error) {
      console.log("error CV: ", error);
    }
  }
}

const userDetailDao = new UserDetailDao();

export default userDetailDao;
