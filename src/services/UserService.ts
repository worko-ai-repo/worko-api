// import userDetailDao from "../daos/UserDetail.dao";
// import UserreferralDao from "../daos/Userreferral.dao";
// import UsersubscriptionDao from "../daos/Usersubscription.dao";
// import {
//   UserLinkedinSignUpDTO,
//   UserReferralRequestDTO,
// } from "../dtos/User.dto";

// class UserService {
//   /**
//    *
//    * @param email
//    * @returns
//    */
//   async getUserByEmail(email: string) {
//     try {
//       return userDetailDao.getUserDetails(email);
//     } catch (error) {
//       console.log("Error -> ", error);
//       throw error;
//     }
//   }

//   /**
//    *
//    * @param email
//    * @returns
//    */
//   async getsubscriptionDetails(email: string) {
//     try {
//       return UsersubscriptionDao.subscriptionDetails(email);
//     } catch (error) {
//       console.log("Error -> ", error);
//       throw error;
//     }
//   }
//   /**
//    *
//    * @param userSignUpDTO
//    */
//   async addUser(userSignUpDTO: UserLinkedinSignUpDTO, email: string) {
//     try {
//       userDetailDao.add(userSignUpDTO, email);
//     } catch (error) {
//       throw error;
//     }
//   }

//   /**
//    *
//    * @param referralRequest
//    */
//   async referralRequest(
//     referralRequest: UserReferralRequestDTO,
//     email: string
//   ) {
//     try {
//       UserreferralDao.requestReferral(referralRequest, email);
//     } catch (error) {
//       throw error;
//     }
//   }
// }
// // Export an instance of the UserService class
// export default new UserService();
