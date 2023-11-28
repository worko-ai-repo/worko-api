import { UserDetailsModel } from "../db/models/UserDetail.model";
import UlidService from "../services/Ulid.service";
import { UserLinkedinSignUpDTO } from "../dtos/User.dto";
import BaseDao from "./Base.dao";

class UserDetailDao implements BaseDao {
  modelName = "user";
  partitianKey = "USR#EML#{primaryEmail}";
  sortKeys = { SK_ID: "ID#{uuid}" };
  /**
   *
   * @param email
   * @returns
   */
  async getUserDetails(email: string) {
    try {
      // const PK = this.USER_CONSTANTS.PK.strtr({
      //   "{primaryEmail}": email,
      // });
      const PK = this.partitianKey.replace("{primaryEmail}", email);
      console.log("PK -> ", PK);
      const res = await UserDetailsModel.query("PK").eq(PK).exec();
      console.log(res);
      return res;
    } catch (error) {
      console.error("Error in getUserDetails:", error);
      throw error;
    }
  }

  /**
   *
   * @param userSignUpDTO
   */
  async add(userSignUpDTO: UserLinkedinSignUpDTO, email: string) {
    try {
      /* userSignUpDTO.PK = this.USER_CONSTANTS.PK.strtr({
        "{primaryEmail}": email,
      }); */
      userSignUpDTO.PK = this.partitianKey.replace("{primaryEmail}", email);
      /* userSignUpDTO.SK = this.USER_CONSTANTS.SK_ID.strtr({
        "{uuid}": UlidService.getUlidId(),
      }); */
      userSignUpDTO.SK = this.sortKeys.SK_ID.replace(
        "{uuid}",
        UlidService.getUlidId()
      );
      console.log(userSignUpDTO);
      await UserDetailsModel.create(userSignUpDTO);
    } catch (error) {
      console.log("Addd user -> ", error);
      throw error;
    }
  }
}

export default new UserDetailDao();
