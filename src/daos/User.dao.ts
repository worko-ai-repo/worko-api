//Load the base dao
import BaseDao from "./Base.dao";

// Strongly typed model for Subscription
class UserDao implements BaseDao {
  modelName = "user";
  partitianKey = "";
  sortKeys = {};
  // "name": String;
  // "amount": Number;
  // "duration": Number;
  // User related constants here
  // private USER_CONSTANTS = {
  //   MODEL: "User",
  //   PK: "USR#EML#{primaryEmail}",
  //   // Sort key prefixes
  //   SK_ID: "ID#{uuid}",
  //   SK_ROLE: "ROLE#",
  //   SK_TYPE: "TYPE#",
  //   SK_SKILL: "SKILL#",
  //   SK_SUBS: "SUBS#CAND#ID#{subsId}",
  //   SK_EMAILS: "EMAILS#",
  //   SK_REFERRAL: "REF#ID#{reqId}",
  // };
  // userDao = new UserDao();
  // UserModel = dynamoose.model(this.USER_CONSTANTS.MODEL, DBSchema);
  // UserTable = new dynamoose.Table(DB_CONSTANTS.WORKO_TABLE_NAME, [
  //   this.userDao.UserModel,
  // ]);
  /**
   *
   * @param email
   * @returns
   */
  /* async fullDetails(email: string) {
    try {
      // console.log("here i n DAo", this.USER_CONSTANTS.PK);
      const PK = this.USER_CONSTANTS.PK.strtr({
        "{primaryEmail}": email,
      });
      console.log("Before", PK);
      const res = await UserDetailsModel.query("PK").eq(PK).exec();
      console.log(res);
      return res;
    } catch (error) {
      console.error("Error in fullDetails:", error);
      throw error;
    }
  } */
  /**
   *
   * @param email
   * @returns
   */
  /* async subscriptionDetails(email: string) {
    try {
      const PK = this.USER_CONSTANTS.PK.strtr({
        "{primaryEmail}": email,
      });
      // const SK = this.USER_CONSTANTS.SK_SUBS;
      const SK = this.USER_CONSTANTS.SK_SUBS.strtr({
        "ID#{subsId}": "",
      });

      return UserSubModel.query({
        PK,
        SK,
      }).exec();
    } catch (error) {
      console.log(error);
      throw error;
    }
  } */
  /**
   *
   * @param userSignUpDTO
   */
  /* async add(userSignUpDTO: UserLinkedinSignUpDTO, email: string) {
    try {
      userSignUpDTO.PK = this.USER_CONSTANTS.PK.strtr({
        "{primaryEmail}": email,
      });
      userSignUpDTO.SK = this.USER_CONSTANTS.SK_ID.strtr({
        "{uuid}": UlidService.getUlidId(),
      });
      console.log(userSignUpDTO);
      await UserDetailsModel.create(userSignUpDTO);
    } catch (error) {
      console.log("Addd user -> ", error);
      throw error;
    }
  } */
  /**
   *
   * @param subscriptionDto
   * @param email
   */
  /* async addSubscription(subscriptionDto: SubscriptionDTO, email: string) {
    try {
      subscriptionDto.PK = this.USER_CONSTANTS.PK.replace(
        "{primaryEmail}",
        email
      );
      subscriptionDto.SK = this.USER_CONSTANTS.SK_SUBS.replace(
        "{subsId}",
        UlidService.getUlidId()
      );
      subscriptionDto.GSI1PK = this.USER_CONSTANTS.SK_SUBS.replace(
        "ID#(subsId}",
        ""
      );
      subscriptionDto.GSI1SK = this.USER_CONSTANTS.PK.replace(
        "{primaryEmail}",
        email
      );
      const timestamp = Date.now();
      subscriptionDto.expiryDate = new Date(timestamp);
      subscriptionDto.purchaseDate = new Date(timestamp);
      console.log(subscriptionDto);
      await UserSubModel.create(subscriptionDto);
    } catch (error) {
      console.log(error);
      throw error;
    }
  } */
  /**
   *
   * @param referralRequest
   * @param email
   */
  /* async requestReferral(
    referralRequest: UserReferralRequestDTO,
    email: string
  ) {
    try {
      referralRequest.PK = this.USER_CONSTANTS.PK.replace(
        "{primaryEmail}",
        email
      );
      referralRequest.SK = this.USER_CONSTANTS.SK_REFERRAL.replace(
        "{reqId}",
        UlidService.getUlidId()
      );
      // Splitting referralRequest.SK into two parts based on '#' delimiter
      const [refPrefix, refId, refNum] = referralRequest.SK.split("#");
      // Assigning values to GSI1PK and GSI1SK
      referralRequest.GSI1PK = `${refPrefix}#`;
      referralRequest.GSI1SK = `${refId}#${refNum}`;
      console.log(referralRequest);
      UserReqModel.create(referralRequest);
    } catch (error) {
      throw error;
    }
  } */
}

export default new UserDao();
