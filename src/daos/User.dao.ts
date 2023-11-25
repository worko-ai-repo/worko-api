import * as dynamoose from "dynamoose";
import Worko from "../db/Dynamoose.config";
import { DB_CONSTANTS, DBSchema } from "../db/DB.constants";
import SubscriptionDTO from "../dtos/Subscription.dto";
import {
  UserLinkedinSignUpDTO,
  UserReferralRequestDTO,
} from "../dtos/User.dto";
import UlidService from "../services/Ulid.service";
import { UserModel } from "../db/models/UserDetailsModel";
import { UserReqModel } from "../db/models/UserRequestModel";
// Subscription related constants here
const USER_CONSTANTS = {
  MODEL: "User",
  PK: "USR#EML#{primaryEmail}",

  // Sort key prefixes
  SK_ID: "ID#{uuid}",
  SK_ROLE: "ROLE#",
  SK_TYPE: "TYPE#",
  SK_SKILL: "SKILL#",
  SK_SUBS: "SUBS#",
  SK_EMAILS: "EMAILS#",
  SK_REFERRAL: "REF#ID#{reqId}",
};

// Strongly typed model for Subscription
class UserDao extends Worko {
  // "name": String;
  // "amount": Number;
  // "duration": Number;
  static UserModel = dynamoose.model(USER_CONSTANTS.MODEL, DBSchema);

  static UserTable = new dynamoose.Table(DB_CONSTANTS.WORKO_TABLE_NAME, [
    UserDao.UserModel,
  ]);

  /**
   *
   * @param email
   * @returns
   */
  static async fullDetails(email: string) {
    try {
      const PK = USER_CONSTANTS.PK.replace("{primaryEmail}", email);
      console.log("Before", PK);
      return this.UserModel.query("PK").eq(PK).exec();
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param email
   * @returns
   */
  static async subscriptionDetails(email: string) {
    try {
      const PK = USER_CONSTANTS.PK.replace("{primaryEmail}", email);
      const SK = USER_CONSTANTS.SK_SUBS;

      return this.UserModel.query({
        PK,
        SK,
      }).exec();
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param userSignUpDTO
   */
  static async add(userSignUpDTO: UserLinkedinSignUpDTO, email: string) {
    try {
      userSignUpDTO.PK = USER_CONSTANTS.PK.replace("{primaryEmail}", email);
      userSignUpDTO.SK = USER_CONSTANTS.SK_ID.replace(
        "{uuid}",
        UlidService.getUlidId()
      );
      console.log(userSignUpDTO);
      UserModel.create(userSignUpDTO);
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param subscriptionDto
   * @param email
   */
  static async addSubscription(
    subscriptionDto: SubscriptionDTO,
    email: string
  ) {
    try {
      subscriptionDto.PK = USER_CONSTANTS.PK.replace("{primaryEmail}", email);
      subscriptionDto.SK = USER_CONSTANTS.SK_SUBS;
      console.log(subscriptionDto);
      this.UserModel.create(subscriptionDto);
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param referralRequest
   * @param email
   */
  static async requestReferral(
    referralRequest: UserReferralRequestDTO,
    email: string
  ) {
    try {
      referralRequest.PK = USER_CONSTANTS.PK.replace("{primaryEmail}", email);
      referralRequest.SK = USER_CONSTANTS.SK_REFERRAL.replace(
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
  }
}

export default UserDao;
