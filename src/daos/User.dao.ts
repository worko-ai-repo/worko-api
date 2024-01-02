import { UserModel } from "../db/models/User.model";
//Load the base dao
import BaseDao from "./Base.dao";

// Strongly typed model for Subscription
class UserDao implements BaseDao {
  modelName = "user";
  partitianKey = "USR#EML#{primaryEmail}";
  sortKeys = {};

  /**
   * Fetches user details based on the provided email.
   * @param email - Email address of the user
   * @returns User details corresponding to the email
   */
  async getUserInfo(email: string) {
    console.log("Get user info by id [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    return UserModel.query("PK").eq(PK).exec();
  }
}

const userDao = new UserDao();

export default userDao;
