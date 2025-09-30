// Import dynamoose library
import { Query, QueryResponse } from "dynamoose/dist/ItemRetriever";

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
import {
  UserDetailCommonUpdateDto,
  UserDetailDTO,
} from "../dtos/UserDetail.dto";
import { UsersListingFilterOptions } from "../admin/dtos/User.dto";
import { PaginatedResultsWithMatchingConditionsResponse } from "../dtos/Common.dto";

// import enums
import { SortOrderTypeEnum } from ".././enums/Common.enum";

// Load helpers
import { getPaginatedResultsWithMatchingConditions } from "../helpers/dynamoose.helper";
import { dateHelperObj } from "../helpers/date.helper";

// import lib dynamodb library
import { awsLibDynamodbLibraryObj } from "../libraries/aws-lib-dynamodb.library";

// UserDetailDao class implementing the BaseDao interface
class UserDetailDao implements BaseDao {
  modelName: string = "UserDetail";
  partitianKey: string = "USR#EML#{primaryEmail}"; // Partition key structure for user emails
  sortKeys = {
    SK_ID: "ID#{userId}", // where userId is cognito provided userId for registered user
  };
  GSI1PK: string = "USR#";
  GSI1SK: string = "ID#{userId}"; // where userId is cognito provided userId for registered user
  GSI2PK: string = "USR#";

  /**
   * GSI2SK
   * const isoString = new Date().toISOString(); //[LOG]: "2025-06-11T16:15:36.0678Z"
   */
  GSI2SK: string = "{createdAt}";

  /**
   * formatGSI2SKWithDate
   *
   * Formats the GSI2SK string with the provided createdAt date string.
   *
   * @param {string} createdAt - The date string to replace the {createdAt} placeholder in the GSI2SK string.
   * @return {string} The formatted GSI2SK string.
   */
  private formatGSI2SKWithDate(createdAt: string): string {
    return this.GSI2SK.strtr({ "{createdAt}": createdAt });
  }

  /**
   * preparePKAndSKForQuery
   *
   * Prepares the partition key and sort key for a query.
   *
   * @param {string} primaryEmail - The primary email of the user.
   * @param {string} id - The id of the user.
   *
   * @returns {{PK: string, SK: string}} - An object containing the partition key and sort key.
   */
  preparePKAndSKForQuery(
    primaryEmail: string,
    id: string
  ): {
    PK: string;
    SK: string;
  } {
    return {
      PK: this.partitianKey.strtr({
        "{primaryEmail}": primaryEmail,
      }),
      SK: this.sortKeys.SK_ID.strtr({
        "{userId}": id,
      }),
    };
  }

  /**
   * getUsers
   *
   * Retrieves user details based on the provided filter options.
   *
   * @param {UsersListingFilterOptions} usersRecordListingFilterRequest - The filter options for user details.
   * @return {Promise<PaginatedResultsWithMatchingConditionsResponse<DbUserDetailDto>>} A promise that resolves to the user details.
   */
  async getUsers(
    usersRecordListingFilterRequest: UsersListingFilterOptions
  ): Promise<PaginatedResultsWithMatchingConditionsResponse<DbUserDetailDto>> {
    // Log the action of getting user details
    global.logger.info("Get user details [DAO]");

    // Get all the user details including candidates and employees
    let query: Query<DbUserDetailDto>;

    if (usersRecordListingFilterRequest?.searchText?.includes("@")) {
      global.logger.info("Search by email [DAO]", {
        searchText: usersRecordListingFilterRequest.searchText,
      });

      const { PK, SK } = this.preparePKAndSKForQuery(
        usersRecordListingFilterRequest.searchText,
        ""
      );
      query = UserDetailModel.query("PK")
        .eq(PK)
        .where("SK")
        .beginsWith(SK)
        .sort(
          usersRecordListingFilterRequest.sortOrder as SortOrderTypeEnum // by default sets to descending order(refer "request.helper.ts")
        );

      // Execute the query by applying the paginateQuery helper and return the results
      return getPaginatedResultsWithMatchingConditions<
        DbUserDetailDto,
        UsersListingFilterOptions
      >(query, usersRecordListingFilterRequest);
    } else {
      query = UserDetailModel.query("GSI2PK").eq(this.GSI2PK);
    }

    /**
     * query.sort(order) sorts the items you receive back by the rangeKey. By default, if not provided, it will sort in ascending order.
     * The order parameter must be a string either equal to ascending or descending.
     *
     * By default query.sort() method sorts the items in "ascending" order but we are sorting by default in descending order
     * and if sortOrder(ascending or descending) is provided then we are sorting by that
     *
     * When you use the sort() method in Dynamoose,
     * it sorts the items based on the sort key of the index you're querying.
     */
    query = query.sort(
      usersRecordListingFilterRequest.sortOrder as SortOrderTypeEnum // by default sets to descending order(refer "request.helper.ts")
    );

    // if userType is provided then get only users of that type
    if (usersRecordListingFilterRequest.userType) {
      query = query
        .where("userType")
        .contains(usersRecordListingFilterRequest.userType);
    }

    // Apply date range filter if provided
    const { fromDate, toDate } = usersRecordListingFilterRequest;

    // If both fromDate and toDate are provided
    if (fromDate && toDate) {
      const fromDateIsoString: string =
        dateHelperObj.getISODateFromTimestamp(fromDate);
      const toDateIsoString: string =
        dateHelperObj.getISODateFromTimestamp(toDate);
      query = query
        .where("GSI2SK")
        .between(
          this.formatGSI2SKWithDate(fromDateIsoString),
          this.formatGSI2SKWithDate(toDateIsoString)
        );
    }
    // If only fromDate is provided
    else if (fromDate) {
      const fromDateIsoString: string =
        dateHelperObj.getISODateFromTimestamp(fromDate);
      query = query
        .where("GSI2SK")
        .ge(this.formatGSI2SKWithDate(fromDateIsoString));
    }
    // If only toDate is provided
    else if (toDate) {
      const toDateIsoString: string =
        dateHelperObj.getISODateFromTimestamp(toDate);
      query = query
        .where("GSI2SK")
        .le(this.formatGSI2SKWithDate(toDateIsoString));
    }

    // search by searchText if provided
    if (usersRecordListingFilterRequest.searchText) {
      // remove trailing and leading spaces from the search text
      let searchTextValue = usersRecordListingFilterRequest.searchText
        .trim()
        .toLowerCase();

      /* 
      The and() method initiates a condition block where all conditions within it must be satisfied.
      The parenthesis() method allows grouping of conditions for complex queries.
      */
      query = query.and().parenthesis((condition) => {
        condition
          .where("name")
          .contains(searchTextValue)
          .or()
          .where("PK")
          .contains(`USR#EML#${searchTextValue}`);

        // Return the built condition
        return condition;
      });
    }

    // Execute the query by applying the paginateQuery helper and return the results
    return getPaginatedResultsWithMatchingConditions<
      DbUserDetailDto,
      UsersListingFilterOptions
    >(query, usersRecordListingFilterRequest);
  }

  /**
   * get
   *
   * Retrieves user details based on the provided email.
   *
   * @param {string} email - Email of the user
   * @returns {Promise<QueryResponse<DbUserDetailDto>>} A promise that resolves with the query response containing the user's details.
   */
  async get(email: string): Promise<QueryResponse<DbUserDetailDto>> {
    global.logger.info("Get user detail by email [DAO]", {
      email,
    });
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });

    return UserDetailModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith(this.sortKeys.SK_ID.strtr({ "{userId}": "" }))
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
   * getUserBasicDetailsByUserId
   *
   * Retrieves user details by user id, only the basic details will be returned.
   *
   * @param {string} userId - ID of the user
   * @returns {Promise<QueryResponse<DbUserDetailDto>>} - Details of the user
   */
  async getUserBasicDetailsByUserId(
    userId: string
  ): Promise<QueryResponse<DbUserDetailDto>> {
    global.logger.info("Get user basic details by userId [DAO]", {
      filePath: __filename,
      methodName: this.getUserBasicDetailsByUserId.name,
      userId,
    });

    // Prepare the GSI1PK and GSI1SK values
    const GSI1PK = this.GSI1PK;
    const GSI1SK = this.GSI1SK.strtr({
      "{userId}": userId,
    });

    // return user details
    return UserDetailModel.query("GSI1PK")
      .eq(GSI1PK)
      .where("GSI1SK")
      .eq(GSI1SK)
      .attributes([
        "PK",
        "multipleCandidateExperience",
        "isCandidateFresher",
        "department",
        "country",
        "YOE",
        "noticePeriod",
        "ECTC",
        "CTC",
        "location",
        "userType",
        "cvExtract",
        "cvExtractParsed",
        "isNoticePeriodNegotiable",
      ])
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
      GSI2PK: this.GSI2PK,
      GSI2SK: new Date().toISOString(), // Sample value: "2025-06-11T16:15:36.0678Z"
    };
    return UserDetailModel.create(newUserSignUpDTO);
  }

  /**
   *
   * @param email
   * @returns
   */
  async update(
    email: string,
    SK: string,
    userDetailDTO: Partial<UserDetailDTO>
  ) {
    global.logger.info("Update user Detail [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });

    return UserDetailModel.update({ PK: PK, SK: SK }, userDetailDTO);
  }

  async updateUserDetail(
    email: string,
    id: string,
    updateData: Partial<UserDetailCommonUpdateDto>
  ): Promise<DbUserDetailDto> {
    global.logger.info("Update user Detail [DAO]", { email, id, updateData });
    const { PK, SK } = this.preparePKAndSKForQuery(email, id);
    return UserDetailModel.update({ PK: PK, SK: SK }, updateData);
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
  async updateCv(
    SK: String,
    email: string,
    resume: string,
    userCvFileName?: string,
    isCvExtracted?: boolean
  ) {
    global.logger.info("Update user resume [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    return UserDetailModel.update(
      { PK: PK, SK: SK },
      { CV: resume, userCvFileName, isCvExtracted }
    );
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

  async scriptUpdateUsersToLowerCase(): Promise<boolean> {
    global.logger.info("update user details to lower case [DAO]");

    // Query the table to get all user details
    const allUsers: QueryResponse<DbUserDetailDto> =
      await UserDetailModel.query("GSI1PK")
        .eq(this.GSI1PK)
        .where("GSI1SK")
        .beginsWith("ID#")
        .exec();

    // Array to store the update operations (promise)
    const updateOperations = [];

    // Loop through all the users and update their name to lowercase
    for (const user of allUsers) {
      const originalName = user.name;
      const lowercasedName = originalName.toLowerCase();

      // Save the updated user back to the database
      updateOperations.push(
        UserDetailModel.update(
          { PK: user.PK, SK: user.SK },
          {
            name: lowercasedName,
          }
        )
      );
    }

    // Execute the update operations in parallel
    await Promise.all(updateOperations);

    return true;
  }

  /**
   * scriptUpdatePkEmailToLowerCase
   *
   * Updates the specific email present in `PK` attribute to lower case in the DynamoDB table.
   *
   * @param {string} oldEmail - The old email address.
   * @param {string} newEmail - The new email address.
   * @returns {Promise<boolean>} A promise that resolves to a boolean value indicating whether the script was successful or not.
   */
  async scriptUpdatePkEmailToLowerCase(
    oldEmail: string,
    newEmail: string
  ): Promise<boolean> {
    global.logger.info("update Pk email to lower case [DAO]", {
      filePath: __filename,
      methodName: this.scriptUpdatePkEmailToLowerCase.name,
    });

    // Generate the old partition key using the old email
    const oldPk: string = this.partitianKey.strtr({
      "{primaryEmail}": oldEmail,
    });
    console.log("oldPk: ", oldPk);

    // Query to fetch all items with the old partition key using the reusable query method
    const queryResult = await awsLibDynamodbLibraryObj.queryItems(
      process.env.APP_AWS_DYNAMODB_TABLE_NAME!,
      "#PK = :oldPk",
      { "#PK": "PK" },
      { ":oldPk": oldPk }
    );

    const getByEmail: Record<string, any>[] | undefined = queryResult.Items;
    console.log("getByEmail: ", getByEmail);

    if (!getByEmail || !getByEmail.length) {
      console.log("No items found for the given old email.");
      return false;
    }

    // Iterate over the fetched items
    for (const item of getByEmail) {
      // Generate the new partition key using the new email
      const newPK: string = this.partitianKey.strtr({
        "{primaryEmail}": newEmail,
      });
      console.log("newPK: ", newPK);

      // Clone the item and update the PK
      const newItem = {
        ...item,
        PK: newPK,
      };
      console.log("newItem: ", newItem);

      // Save the new item using the reusable putItem method
      const savedNewItem = await awsLibDynamodbLibraryObj.putItem(
        process.env.APP_AWS_DYNAMODB_TABLE_NAME!,
        newItem
      );
      console.log("savedNewItem: ", savedNewItem);

      // Delete the old item using the reusable deleteItem method
      const deletedOldItem = await awsLibDynamodbLibraryObj.deleteItem(
        process.env.APP_AWS_DYNAMODB_TABLE_NAME!,
        { PK: oldPk, SK: item.SK }
      );
      console.log("deletedOldItem: ", deletedOldItem);

      global.logger.info(
        `Recreated item with PK: ${newPK} and deleted old item with PK: ${oldPk}`,
        {
          filePath: __filename,
          methodName: this.scriptUpdatePkEmailToLowerCase.name,
        }
      );
    }

    return true;
  }
}

// Create an instance of the UserDetailDao
const userDetailDao = new UserDetailDao();

// Export the instance for use in other modules
export default userDetailDao;
