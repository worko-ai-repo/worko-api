//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import { UserDetailModel } from "../db/models/UserDetail.model";

//Load the local dtos
import { UserSignUpDTO } from "../dtos/User.dto";
import { UserDetailDTO } from "../dtos/UserDetail.dto";

//Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";

//Load enums
import { UserType } from "../dtos/Company.dto";

// UserDetailDao class implementing the BaseDao interface
class UserDetailDao implements BaseDao {
  modelName = "userDetail";
  partitianKey = "USR#EML#{primaryEmail}"; // Partition key structure for user emails
  sortKeys = { SK_ID: "ID#{uuid}" }; // Sort key structure using unique IDs

  /**
   * Fetches user details based on the provided email.
   * @param email - Email address of the user
   * @returns User details corresponding to the email
   */
  async get(email: string) {
    global.logger.info("Get user experience by id [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    const [skBegins] = this.sortKeys.SK_ID.split("#", 1);
    return UserDetailModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith(skBegins)
      .exec();
  }

  /**
   * @param email
   * @returns
   */
  async create(email: string, userDetailDTO: UserDetailDTO) {
    logger.info("Create user detail [DAO]");
    const SK = this.sortKeys.SK_ID.strtr({
      "{uuid}": UlidService.getUlidId(),
    });
    console.log("SK: ", SK);
    const userDetail = {
      PK: this.partitianKey.strtr({
        "{primaryEmail}": email,
      }),
      SK: SK,
      ...userDetailDTO,
    };
    global.logger.debug("userDetail", userDetail);
    return UserDetailModel.create(userDetail);
  }

  /**
   * Fetches user details based on the provided email.
   * @param email - Email address of the user
   * @returns User details corresponding to the email
   */
  async getUserDetails(email: string, SK: string) {
    global.logger.info("Get user detail by id [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    return UserDetailModel.query("PK").eq(PK).where("SK").eq(SK).exec();
  }

  /**
   * Fetches user Subscription status based on the provided PK and SK.
   * @param email - Email address of the user
   * @returns User Subscription-Status corresponding to the email and SK
   */
  async getUserSubscriptionStatus(email: string, SK: string) {
    global.logger.info("Get user Subscription-Status [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    return UserDetailModel.query("PK")
      .eq(PK)
      .where("SK")
      .eq(SK)
      .attributes(["isSubscribed", "referralCount"])
      .exec();
  }

  async getUserDetailSK(email: string) {
    global.logger.info("get UserDetail SK [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });

    // @todo we should never use the await in DTO unless extremly required. Kindly have await in controller;
    // Or in service if the value is required there.
    const user = await UserDetailModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith("ID#")
      .exec();

    return user[0].SK;
  }

  /**
   * Adds a new user by creating a user sign-up DTO and saving it.
   *
   * @param userSignUpDTO - User sign-up data transfer object
   * @param email - Email address of the user
   */
  async add(userSignUpDTO: UserSignUpDTO, userType: string) {
    global.logger.info("Create candidate/employee [DAO]");
    /* if (!userSignUpDTO.CV) {
        userSignUpDTO.CV = "";
      } */
    let refCount = 0;
    let isSub = false;
    if (userType === UserType.CAND) {
      refCount = 1;
      isSub = true;
    }
    const { email, userId, ...copyUserSignUpDTO } = userSignUpDTO;
    const emailList = { primary: email };
    const today = new Date();
    const newUserSignUpDTO = {
      PK: this.partitianKey.strtr({
        "{primaryEmail}": email,
      }),
      SK: this.sortKeys.SK_ID.strtr({
        "{uuid}": userId,
      }),
      ...copyUserSignUpDTO,
      emailList: emailList,
      isEmailVerified: false,
      isNumberVerified: false,
      isSubscribed: isSub,
      userType: [userType],
      lastAccessedDash: userType,
      referralCount: refCount,
      expiryDate: today,
    };
    return UserDetailModel.create(newUserSignUpDTO);
  }

  /**
   *
   * @param email
   * @returns
   */
  async update(email: string, SK: string, userDetailDTO: UserDetailDTO) {
    global.logger.info("Update user Detail [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    return UserDetailModel.update({ PK: PK, SK: SK }, userDetailDTO);
  }

  /**
   *
   * @param email
   * @returns
   */
  async updateEmailVerify(SK: String, email: string) {
    global.logger.info("Update user primary email verify status [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    return UserDetailModel.update(
      { PK: PK, SK: SK },
      { isEmailVerified: true }
    );
  }

  /**
   *
   * @param SK
   * @param email
   * @param resume
   * @returns
   */
  async updateCv(SK: String, email: string, resume: string) {
    global.logger.info("Update user resume [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    return UserDetailModel.update({ PK: PK, SK: SK }, { CV: resume });
  }

  /**
   *
   * @param SK
   * @param email
   * @param currRefCount
   * @returns
   */
  async updateReferralCount(SK: string, email: string, currRefCount: number) {
    global.logger.info("Decrease referral count [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    return UserDetailModel.update(
      { PK: PK, SK: SK },
      { referralCount: currRefCount }
    );
  }

  /**
   *
   * @param SK
   * @param email
   * @param status
   * @returns
   */
  async updateIsSubscribedStatus(SK: string, email: string, status: boolean) {
    global.logger.info("update subscription status [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    return UserDetailModel.update({ PK: PK, SK: SK }, { isSubscribed: status });
  }
}

const userDetailDao = new UserDetailDao();

export default userDetailDao;
