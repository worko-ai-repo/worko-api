// Import dynamoose library
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import {
  DbUserDetailDto,
  UserDetailModel,
} from "../db/models/UserDetail.model";

//Load the local dtos
import {
  NewUserCandSignUpDTO,
  NewUserEmpSignUpDTO,
  UserSubscriptionDetailsUpdateDto,
} from "../dtos/User.dto";
import { UserDetailDTO } from "../dtos/UserDetail.dto";
import { UsersListingFilterOptions } from "../admin/dtos/User.dto";

// import types
import { SortOrderTypeEnum } from ".././enums/Common.enum";

// UserDetailDao class implementing the BaseDao interface
class UserDetailDao implements BaseDao {
  modelName = "UserDetail";
  partitianKey = "USR#EML#{primaryEmail}"; // Partition key structure for user emails
  sortKeys = {
    SK_ID: "ID#{userId}", // where userId is cognito provided userId for registered user
  };
  GSI1PK: string = "USR#";
  GSI1SK = "ID#{userId}"; // where userId is cognito provided userId for registered user

  /**
   * getUsers
   * 
   * Retrieves user details based on the provided filter options.
   *
   * @param {UsersListingFilterOptions} usersRecordListingFilterRequest - The filter options for user details.
   * @return {Promise<QueryResponse<DbUserDetailDto>>} A promise that resolves to the user details.
   */
  async getUsers(
    usersRecordListingFilterRequest: UsersListingFilterOptions
  ): Promise<QueryResponse<DbUserDetailDto>> {
    // Log the action of getting user details
    global.logger.info("Get user details [DAO]");

    // Fetch user details from the DAO
    let query = UserDetailModel.query("GSI1PK")
      .eq(this.GSI1PK)
      .where("GSI1SK")
      .beginsWith("ID#")
      
    // When you use the sort() method in Dynamoose, it sorts the items based on the sort key of the index you're querying.
    query.sort(usersRecordListingFilterRequest.sortOrder ?? SortOrderTypeEnum.DESCENDING);

    // if lastKey is provided, add it to the query where lastKey is equal to the provided value
    if (usersRecordListingFilterRequest.lastKey) {
      // Start the query from the lastKey to retrieve subsequent pages
      query.startAt(usersRecordListingFilterRequest.lastKey);
    }

    // if pageSize is provided, add it to the query
    if (usersRecordListingFilterRequest.pageSize) {
      // Set the page size for the query
      query.limit(usersRecordListingFilterRequest.pageSize);
    }

    // Execute the query and return the result
    return query.exec();
  }

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
   * getUserById
   *
   * Fetches user details based on the provided email.
   * @param userId - userId  of the user
   * @returns User details corresponding to the email
   */
  async getUserById(userId: string) {
    global.logger.info("Get user getByUserId id [DAO]");
    const GSI1PK = this.GSI1PK;
    const GSI1SK = this.GSI1SK.strtr({
      "{userId}": userId,
    });
    // return UserDetailModel.get({ GSI1PK: GSI1PK, GSI1SK: GSI1SK })
    return UserDetailModel.query("GSI1PK")
      .eq(GSI1PK)
      .where("GSI1SK")
      .eq(GSI1SK)
      .exec();
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
   * updateLastAccessedDash
   *
   * Updates the last accessed dashboard for a user
   *
   * @param email - Email address of the user
   * @param SK - Sort Key of the user
   * @param userlastAccessedDash - User's Last Accessed Dashboard
   */
  async updateLastAccessedDash(
    email: string,
    SK: string,
    userlastAccessedDash: string
  ) {
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    return UserDetailModel.update(
      { PK: PK, SK: SK },
      { lastAccessedDash: userlastAccessedDash }
    );
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
   * add
   *
   * Adds a new user by creating a user sign-up DTO and saving it.
   *
   * @param userSignUpDTO - User sign-up data transfer object
   */
  async add(
    userSignUpDTO: NewUserCandSignUpDTO | NewUserEmpSignUpDTO
  ): Promise<DbUserDetailDto> {
    global.logger.info("Create candidate/employee [DAO]");
    /* if (!userSignUpDTO.CV) {
        userSignUpDTO.CV = "";
      } */

    const newUserSignUpDTO = {
      ...userSignUpDTO,
      PK: this.partitianKey.strtr({
        "{primaryEmail}": userSignUpDTO.email,
      }),
      SK: this.sortKeys.SK_ID.strtr({
        "{userId}": userSignUpDTO.id,
      }),
      GSI1PK: this.GSI1PK,
      GSI1SK: this.GSI1SK.strtr({
        "{userId}": userSignUpDTO.id,
      }),
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
    global.logger.info("Update user primary email status to true [DAO]");
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
   * updateReferralCount
   *
   * Updates the referral count for a user.
   *
   * @param id - The user's unique identifier.
   * @param email - The user's email address.
   * @param updateBodyObject - Object containing the updated user subscription details.
   * @returns A promise that resolves to the updated user details.
   */
  async updateReferralCount(
    id: string,
    email: string,
    updateBodyObject: UserSubscriptionDetailsUpdateDto
  ): Promise<DbUserDetailDto> {
    global.logger.info("Calculate referral count [DAO]");

    // Generate the partition key using the user's email
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });

    // Generate the sort key using the user's ID
    const SK = this.sortKeys.SK_ID.strtr({
      "{userId}": id,
    });

    // Update the user's details in the database
    return UserDetailModel.update({ PK: PK, SK: SK }, updateBodyObject);
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
