import UserDao from "../daos/User.dao";
import {
  UserLinkedinSignUpDTO,
  UserReferralRequestDTO,
} from "../dtos/User.dto";

class UserService {
  /**
   *
   * @param email
   * @returns
   */
  async getUserByEmail(email: string) {
    try {
      return UserDao.fullDetails(email);
    } catch (error) {
      console.log("Error -> ", error);
      throw error;
    }
  }

  /**
   *
   * @param email
   * @returns
   */
  async getsubscriptionDetails(email: string) {
    try {
      return UserDao.subscriptionDetails(email);
    } catch (error) {
      console.log("Error -> ", error);
      throw error;
    }
  }
  /**
   *
   * @param userSignUpDTO
   */
  async addUser(userSignUpDTO: UserLinkedinSignUpDTO, email: string) {
    try {
      UserDao.add(userSignUpDTO, email);
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param referralRequest
   */
  async referralRequest(
    referralRequest: UserReferralRequestDTO,
    email: string
  ) {
    try {
      UserDao.requestReferral(referralRequest, email);
    } catch (error) {
      throw error;
    }
  }
}

// Export an instance of the UserService class
export default new UserService();
