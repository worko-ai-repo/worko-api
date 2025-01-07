// Import dynamoose library for DynamoDB queries
import { QueryResponse } from "dynamoose/dist/ItemRetriever";


//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import {
  DbUserReferralDto,
  UserReferralModel,
} from "../db/models/UserReferral.model";

//Load the local dtos
import { UserReferralRequestCreateDTO } from "../dtos/User.dto";
import {
  EmpReferralListingFilterOptions,
  ReferralStatusListingFilterOptions,
  UserReferralDTO,
  UserReferralStatusChangeByCandDTO,
} from "../dtos/UserReferral.dto";
import { ReferralListingFilterOptions } from "../admin/dtos/UserReferral.dto";
import { PaginatedResultsWithMatchingConditionsResponse } from "../dtos/Common.dto";

//Load the local enums
import { ReferralStatus } from "../enums/UserReferral.enum";
import { SortOrderTypeEnum } from "../enums/Common.enum";

// Load helpers
import { getPaginatedResultsWithMatchingConditions } from "../helpers/dynamoose.helper";

//Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";

// Class definition for UserReferralDao implementing the BaseDao interface
class UserReferralDao implements BaseDao {
  modelName = "UserReferral"; // The model name used for user referrals
  partitianKey = "USR#EML#{primaryEmail}"; // Partition key format for user referrals
  sortKeys = { SK_REFERRAL: "REF#ID#{reqId}" }; // Sort key format for user referrals
  GSI1PK = "REF#";
  GSI1SK = "ID#{refId}";

  /**
   * getReferrals
   *
   * Retrieves all referral details from the DAO based on the provided filter options.
   *
   * First you will get all the referrals from the DAO using the GSI1PK and GSI1SK.
   * Then you will filter the referrals based on the status if provided.
   * Then sort by default in descending order Or if sortOrder is given then sort by that order using dynamoose's sort() method which sorts the items based on the sort key of the index you're querying.
   *
   * @param {ReferralListingFilterOptions} referralRecordListingFilterRequest - The filter options for the referral record listing.
   */
  async getReferrals(
    referralRecordListingFilterRequest: ReferralListingFilterOptions
  ):Promise<PaginatedResultsWithMatchingConditionsResponse<DbUserReferralDto>> {
    // Log the action of getting referral details in the dao
    global.logger.info("Get referral details [dao]");

    // Get all referral data from the DAO
    let query = UserReferralModel.query("GSI1PK")
      .eq(this.GSI1PK)
      .where("GSI1SK")
      .beginsWith("ID#");

    // Filter by status if provided
    if (referralRecordListingFilterRequest.status) {
      query = query
        .where("status")
        .eq(referralRecordListingFilterRequest.status);
    }

    // When you use the sort() method in Dynamoose, it sorts the items based on the sort key of the index you're querying.
    query = query.sort(
      referralRecordListingFilterRequest.sortOrder as SortOrderTypeEnum
    );

    // Apply date range filter if provided
    if (
      referralRecordListingFilterRequest.fromDate ||
      referralRecordListingFilterRequest.toDate
    ) {
      query = query.and().parenthesis((condition) => {
        if (referralRecordListingFilterRequest.fromDate) {
          condition
            .where("createdAt")
            .ge(referralRecordListingFilterRequest.fromDate);
        }
        if (referralRecordListingFilterRequest.toDate) {
          condition
            .where("createdAt")
            .le(referralRecordListingFilterRequest.toDate);
        }
        return condition;
      });
    }

    // search by searchText if provided
    if (referralRecordListingFilterRequest.searchText) {
      // remove trailing and leading spaces from the search text
      let searchTextValue =
        referralRecordListingFilterRequest.searchText;

      /* 
      The and() method initiates a condition block where all conditions within it must be satisfied.
      The parenthesis() method allows grouping of conditions for complex queries.
      */
      query = query.and().parenthesis((condition) => {
        condition
          .where("status") // "status" can be any one of 'AWAITING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'WITHDRAWN', 'DONE'
          .contains(searchTextValue.toUpperCase())
          .or()
          .where("PK")
          .contains(`USR#EML#${searchTextValue.toLowerCase()}`);

        // Return the built condition
        return condition;
      });
    }

    // Execute the query by applying the paginateQuery helper and return the results
    return getPaginatedResultsWithMatchingConditions<
      DbUserReferralDto,
      ReferralListingFilterOptions
    >(query, referralRecordListingFilterRequest);
  }

  /**
   * getReferralsForCand
   *
   * Fetches user Referral based on the provided email and status.
   *
   * @param email - Email address of the user
   * @param status - referral status
   */
  async getReferralsForCand(
    email: string,
    userReferralStatusFilterOptions: ReferralStatusListingFilterOptions
  ):Promise<PaginatedResultsWithMatchingConditionsResponse<DbUserReferralDto>> {
    global.logger.info("Get user Referral by status [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    let query = UserReferralModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith("REF#ID#");
    if (userReferralStatusFilterOptions.status) {
      query = query.where("status").eq(userReferralStatusFilterOptions.status);
    }

    // When you use the sort() method in Dynamoose, it sorts the items based on the sort key of the index you're querying.
    query = query.sort(
      userReferralStatusFilterOptions.sortOrder as SortOrderTypeEnum
    );

    // Execute the query by applying the paginateQuery helper and return the results
    return getPaginatedResultsWithMatchingConditions<
      DbUserReferralDto,
      ReferralStatusListingFilterOptions
    >(query, userReferralStatusFilterOptions);
  }

  /**
   *
   * @param email
   * @returns
   */
  async update(PK: string, SK: string, userReferralDTO: UserReferralDTO) {
    global.logger.info("Update user Referral [DAO]");
    console.log("PK: -", PK, "SK: -", SK);
    return UserReferralModel.update({ PK: PK, SK: SK }, userReferralDTO);
  }

  /**
   * create
   *
   * Request a user referral by creating a new entry in the database.
   *
   * @param referralRequest - The UserReferralRequestCreateDTO containing referral request details.
   * @param email - The email associated with the referral request.
   */
  async create(referralRequest: UserReferralRequestCreateDTO, email: string) {
    global.logger.info("Create referral [DAO]");

    // Prepare id
    const id = UlidService.getUlidId();

    // Prepare the SK
    const SK = this.sortKeys.SK_REFERRAL.strtr({
      "{reqId}": id,
    });

    // create a referral request
    const newReferralRequest = {
      ...referralRequest,
      id: id,
      PK: this.partitianKey.strtr({
        "{primaryEmail}": email,
      }),
      SK: SK,
      GSI1PK: this.GSI1PK,
      GSI1SK: this.GSI1SK.strtr({
        "{refId}": id,
      }),
      status: ReferralStatus.AWAITING,
      matchingScore: 0, // todo : review this once .
    };

    // Create a new entry in the UserReferralModel (database model) with the referral request data
    await UserReferralModel.create(newReferralRequest);

    // return only referralId
    return { referralRequestId: id };
  }

  /**
   * getReferralScoreForCand
   *
   * Get referral Score (matchingScore) for Cand based on request
   *
   * @param referralId
   * @param email
   */
  async getReferralScoreForCand(email: string, referralId: string) {
    global.logger.info("Get referral Matching score [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    const SK = this.sortKeys.SK_REFERRAL.strtr({
      "{reqId}": referralId,
    });
    return UserReferralModel.query("PK")
      .eq(PK)
      .where("SK")
      .eq(SK)
      .attributes([
        "matchingScore",
        "jdMatchErrorCode",
        "jdMatchErrorDesc",
        "rejectionFeedbackBySystem",
      ])
      .exec();
  }

  /**
   * updateStatus
   *
   * @todo rename this function to be specific for candidate activity
   *
   * @param referralId - The ID of the referral
   * @param email - The email address of the user
   * @param status - The new status of the referral
   * @returns {Promise<DbUserReferralDto>}
   */
  async updateStatus(
    referralId: string,
    email: string,
    status: string
  ): Promise<DbUserReferralDto> {
    global.logger.info("Update user referral status [DAO]");

    // Construct PK and SK based on referralId and email
    const PK = this.partitianKey.replace("{primaryEmail}", email);
    const SK = this.sortKeys.SK_REFERRAL.replace("{reqId}", referralId);

    // Create the update object with PK, SK, and status
    let updateObject: Partial<DbUserReferralDto> = { status: status };

    // If the status is set to DONE, add the doneByCandidate field with the current date
    if (status === ReferralStatus.DONE) {
      updateObject.doneByCandidate = new Date();
    }
    return UserReferralModel.update({ PK: PK, SK: SK }, updateObject);
  }

  /**
   * @param referralId - The ID of the referral
   * @param candEmail - The email address of the candidate
   * @param withdrawnReferralPayload - The payload containing information about the withdrawn referral
   * @returns Promise<DbUserReferralDto>
   */
  async updateStatusForWithdrawnReferral(
    referralId: string,
    candEmail: string,
    withdrawnReferralPayload: UserReferralStatusChangeByCandDTO
  ): Promise<DbUserReferralDto> {
    global.logger.info("Update user referral withdrawal status [DAO]");

    const PK = this.partitianKey.strtr({ "{primaryEmail}": candEmail });
    const SK = this.sortKeys.SK_REFERRAL.strtr({ "{reqId}": referralId });

    // Set the actionDate for the withdrawal payload
    withdrawnReferralPayload.actionDate = new Date();

    // Prepare the update object with the withdrawal properties
    const updateReferralStatusForWithdrawn = {
      status: ReferralStatus.WITHDRAWN,
      withdrawnByUser: withdrawnReferralPayload,
    };

    // Perform the update operation
    return UserReferralModel.update(
      { PK: PK, SK: SK },
      updateReferralStatusForWithdrawn
    );
  }

  /**
   *
   * @param email
   * @returns
   */
  async updateStatusByPKSK(PK: string, SK: string, status: string) {
    global.logger.info("Update user referral status by PK and SK [DAO]");
    return UserReferralModel.update({ PK: PK, SK: SK }, { status: status });
  }

  /**
   * Fetches Referral based on userEmail, referralId.
   * @param userEmail -
   * @param referralId -
   * @returns {Promise<any>} - A Promise that resolves to the Referral of the user
   */
  async getUserReferralByReferralId(
    userEmail: string,
    referralId: string
  ): Promise<DbUserReferralDto> {
    global.logger.info(
      `Get Referral for UserEmail ${userEmail} and with Referral Id ${referralId}. [DAO]`
    );
    const PK = this.partitianKey.replace("{primaryEmail}", userEmail);
    const SK = this.sortKeys.SK_REFERRAL.replace("{reqId}", referralId);
    return UserReferralModel.get({ PK: PK, SK: SK });
  }

  /**
   * getReferralDetailsByReferralId
   *
   * Fetches Referral based on referralId.
   *
   * @param referralId - Referral id
   * @returns {Promise<QueryResponse<DbUserReferralDto>>} - A Promise that resolves to the query response containing the referral details.
   */
  async getReferralDetailsByReferralId(
    referralId: string
  ): Promise<QueryResponse<DbUserReferralDto>> {
    global.logger.info(
      `Get Referral Details for Referral Id ${referralId}. [DAO]`,
      {
        filePath: __filename,
        methodName: this.getReferralDetailsByReferralId.name,
      }
    );

    const GSI1SK = this.GSI1SK.strtr({ "{refId}": referralId });

    // return Referral details
    return UserReferralModel.query("GSI1PK")
      .eq(this.GSI1PK)
      .where("GSI1SK")
      .eq(GSI1SK)
      .exec();
  }

  
  /**
   * getCompanyReferralsByEmpEmailForAwaiting
   * 
   * Retrieves company referrals for an employee based on the provided filter options, excluding specific referral IDs.
   *
   * @param {EmpReferralListingFilterOptions} empReferralListingFilterOptions - The filter options for the referral listing, including sort order, company ID, and status.
   * @param {string[]} referralIdsToBeExcluded - An array of referral IDs to be excluded from the results.
   */
  async getCompanyReferralsByEmpEmailForAwaiting(
    empReferralListingFilterOptions: EmpReferralListingFilterOptions,
    referralIdsToBeExcluded: string[]
  ):Promise<PaginatedResultsWithMatchingConditionsResponse<DbUserReferralDto>>  {
    global.logger.info("Get Company Referrals for Employee by Awaiting referral status [DAO]");

    // Construct the query based on the provided filter options
    let query = UserReferralModel.query("GSI1PK")
      .eq(this.GSI1PK)
      .where("GSI1SK")
      .beginsWith("ID#")
      .sort(empReferralListingFilterOptions.sortOrder as SortOrderTypeEnum)
      .where("companyId")
      .eq(empReferralListingFilterOptions.companyId)
      .where("status")
      .eq(empReferralListingFilterOptions.status);

    /**
     * Exclude specific referral IDs from the results
     * 
     * This method we are using is not the best way to do this, but it works for now.
     * But we should find a better way to do this. I have tried using the "not()" operator followed by "in()", but it does not work.
     * 
     * @see https://dynamoosejs.com/guide/Condition#conditionnot
     */
    referralIdsToBeExcluded.forEach((excludedId) => {
      query = query.where("id").not().eq(excludedId);
    });

    // Execute the query by applying the paginateQuery helper and return the results
    return getPaginatedResultsWithMatchingConditions<
      DbUserReferralDto,
      EmpReferralListingFilterOptions
    >(query, empReferralListingFilterOptions);
  }

  /**
   * Fetches Referral based on GSI1PK, companySK, and status.
   * @param companyId - Company sort key
   * @param status - Referral status
   * @returns {Promise<any>} - A Promise that resolves to the Referral of the user
   */
  async getByGSI1PKAndStatus(
    companyId: string,
    status: string
  ): Promise<QueryResponse<DbUserReferralDto>> {
    global.logger.info("Get Referral by GSI1PK and status [DAO]");
    return UserReferralModel.query("GSI1PK")
      .eq(this.GSI1PK)
      .where("GSI1SK")
      .beginsWith("ID#")
      .sort("descending")
      .where("companyId")
      .eq(companyId)
      .where("status")
      .eq(status)
      .exec();
  }

  /**
   * Fetches Referral based on GSI1PK, GSI1SK.
   * @param ReferralSK
   * @returns {Promise<any>} - A Promise that resolves to the Referral of the user
   */
  async getByGSI1(GSI1SK: string): Promise<QueryResponse<DbUserReferralDto>> {
    global.logger.info("Get Referral by GSI1PK and GSI1SK [DAO]");
    const GSI1PK = "REF#";
    const finalGSI1SK = "ID#" + GSI1SK;
    console.log("GSI1PK & SK", GSI1PK, finalGSI1SK);
    return UserReferralModel.query("GSI1PK")
      .eq(GSI1PK)
      .where("GSI1SK")
      .eq(finalGSI1SK)
      .exec();
  }

  /**
   * Fetches Referral based on GSI1PK, GSI1SK.
   * @param ReferralSK
   * @param attribute
   * @returns {Promise<any>} - A Promise that resolves to the Referral of the user
   */
  async getOnlyAttribute(GSI1SK: string, attribute: string[]) {
    global.logger.info("Get Referral by GSI1PK and GSI1SK [DAO]");
    const finalGSI1SK = "ID#" + GSI1SK;
    return UserReferralModel.query("GSI1PK")
      .eq(this.GSI1PK)
      .where("GSI1SK")
      .eq(finalGSI1SK)
      .attributes(attribute)
      .exec();
  }

  /**
   * Fetches Referral based on GSI1PK and employe userId for accepted referrals.
   * @param userId
   * @returns {Promise<any>} - A Promise that resolves
   */
  async getByAcceptedUserId(userId: string) {
    global.logger.info("Get Referral by GSI1PK and AcceptedUserId  [DAO]");
    return UserReferralModel.query("GSI1PK")
      .eq(this.GSI1PK)
      .where("status")
      .eq(ReferralStatus.ACCEPTED)
      .where("acceptedByUserId")
      .eq(userId)
      .exec();
  }

  /**
   * Fetches Referral based on GSI1PK and employe userId for DONE referrals.
   * @param userId
   * @returns {Promise<any>} - A Promise that resolves
   */
  async getByDoneByUserId(userId: string) {
    global.logger.info("Get Referral by GSI1PK and DoneByUserId  [DAO]");
    return UserReferralModel.query("GSI1PK")
      .eq(this.GSI1PK)
      .where("status")
      .eq(ReferralStatus.DONE)
      .where("doneByUserId")
      .eq(userId)
      .exec();
  }

  /**
   * getEmployeeReferralsByFilterOptions
   * 
   * Fetches referrals for an employee based on the provided filter options and an array of referral IDs.
   *
   * @param {string[]} refIds - An array of referral IDs to be fetched.
   * @param {EmpReferralListingFilterOptions} empReferralListingFilterOptions - Filter options for the referral listing.
   */
  async getEmployeeReferralsByFilterOptions(
    refIds:string[], 
    empReferralListingFilterOptions: EmpReferralListingFilterOptions
  ) {
    let query = UserReferralModel.query("GSI1PK")
      .eq(this.GSI1PK)
      .where("GSI1SK")
      .beginsWith("ID#")
      .sort(empReferralListingFilterOptions.sortOrder as SortOrderTypeEnum)
      .where("id")
      .in(refIds);

    // Execute the query by applying the paginateQuery helper and return the results
    return getPaginatedResultsWithMatchingConditions<
      DbUserReferralDto,
      EmpReferralListingFilterOptions
    >(query, empReferralListingFilterOptions);
  }

  /**
   * Fetches referrals based on GSI1PK and array of referral IDs.
   * @param referralIds - Array of referral IDs
   * @returns { Promise<QueryResponse<DbUserReferralDto>[]>} - A Promise that resolves to the Referrals
   */
  async getReferralsByIdsUsingGsis(
    referralIds: string[]
  ): Promise<(DbUserReferralDto | null)[]> {
    global.logger.info("Get Referrals by GSI1PK and Referral IDs [DAO]");
    // Construct an array of keys based on referralIds
    const promises = referralIds.map((referralId) => {
      const GSI1SK = this.GSI1SK.strtr({ "{refId}": referralId });
      return UserReferralModel.query("GSI1PK")
        .eq(this.GSI1PK)
        .where("GSI1SK")
        .eq(GSI1SK)
        .exec()
        .then((referral) => (referral.count ? referral[0] : null));
    });
    return Promise.all(promises);
  }

  /**
   * getUserReferralsByJobUrl
   *
   * Retrieves a user referral by job URL.
   *
   * @param {string} userEmail - The email of the user.
   * @param {string} jobUrl - The job URL.
   * @return {Promise<QueryResponse<DbUserReferralDto>>} A promise that resolves to the user referral data.
   */
  async getUserReferralsByJobUrl(
    userEmail: string,
    jobUrl: string
  ): Promise<QueryResponse<DbUserReferralDto>> {
    let PK = this.partitianKey.strtr({ "{primaryEmail}": userEmail });
    return UserReferralModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith("REF#ID")
      .where("jobUrl")
      .eq(jobUrl)
      .exec();
  }

  /**
   *========INTERNAL SCRIPT USE ONLY==========*
   *
   * updateUserReferralsJdMatchErrorCode
   *
   * @description This function updates a specific user referral in the database with the provided `jdMatchErrorCode`.
   * It is intended exclusively for internal script operations, particularly when modifying or correcting referral data
   * in bulk based on specific conditions. This function directly interacts with the data access layer to perform the update.
   *
   * **IMPORTANT:**
   * - This function is **not** intended for use in production code or any external operations.
   * - It has **no relation** to other functions, services, or API endpoints.
   * - **Do not use this function** for any kind of user-facing operations or as part of any service logic.
   * - Misuse of this function can lead to unintended consequences, and any such misuse will not be supported.
   *
   * @param {string} candEmail - The email of the user.
   * @param {string} referralId - The ID of the referral.
   * @param {number} jdMatchErrorCode - The data to update the user referral with.
   */
  async updateUserReferralsJdMatchErrorCode(
    userEmail: string,
    referralId: string,
    jdMatchErrorCode: number
  ) {
    global.logger.info(
      `
      UserEmail is ${userEmail},
      ReferralId is ${referralId},
      jdMatchErrorCode is ${jdMatchErrorCode}`,
      "Updating User Referral jdMatcherrroCode [DAO]"
    );
    // retrun the updated User Referral with JdMatchErrorCode
    return UserReferralModel.update(
      {
        PK: this.partitianKey.strtr({ "{primaryEmail}": userEmail }),
        SK: this.sortKeys.SK_REFERRAL.replace("{reqId}", referralId),
      },
      {
        // update only jdMatchErrorCode feild
        jdMatchErrorCode: jdMatchErrorCode,
      }
    );
  }

  /**
   * scriptUpdatejdExtractedToStringDataType
   *
   * NOTE: This script we are not using it currently. because earlier we have anticipated the
   * issues in the `jdExtracted` data type was not string, but we realise that is not the case.
   * And we may use this script in the future by reviewing with team lead.
   *
   * Updates all `jdExtracted` data type to `string` data type.
   *
   * NOTE: To convert `jdExtracted` data type to `string` data type, we decided to use the `JSON.stringify()` method. because
   * the `JSON.stringify()` method will convert the data type to `string` data type efficiently, please refer to the following example:
   * const obj = {
   *   "a":9,
   *   "b":"b"
   * }
   * console.log(JSON.stringify(obj),typeof JSON.stringify(obj)) // [LOG]: "{"a":9,"b":"b"}",  "string"
   * console.log(obj.toString(), typeof obj.toString()) // [LOG]: "[object Object]",  "string"
   *
   * const str = 10
   * console.log(JSON.stringify(str),typeof JSON.stringify(str)) // [LOG]: "10",  "string"
   * console.log(str.toString(),typeof str.toString()) // [LOG]: "10",  "string"
   *
   * @returns {Promise<boolean>} A promise that resolves to a boolean value indicating whether the script was successful or not.
   */
  async scriptUpdatejdExtractedToStringDataType(): Promise<boolean> {
    global.logger.info("update `jdExtracted` to string data type [DAO]");

    const userReferrals: QueryResponse<DbUserReferralDto> =
      await UserReferralModel.query("GSI1PK")
        .eq(this.GSI1PK)
        .where("GSI1SK")
        .beginsWith("ID#")
        .exec();

    const updateOperations: any[] = [];

    userReferrals.forEach((eachReferral: DbUserReferralDto) => {
      const originalJdExtracted = eachReferral.jdExtracted;
      console.log({
        originalJdExtracted,
        type: typeof originalJdExtracted,
      });

      updateOperations.push(
        UserReferralModel.update(
          { PK: eachReferral.PK, SK: eachReferral.SK },
          {
            jdExtracted: eachReferral.jdExtracted
              ? JSON.stringify(eachReferral.jdExtracted)
              : undefined,
          }
        )
      );
    });

    // Execute the update operations in parallel
    await Promise.all(updateOperations);

    return true;
  }
}

// Export a new instance of UserReferralDao
const userReferralDao = new UserReferralDao();

export default userReferralDao;
