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
  UserReferralDTO,
  UserReferralStatusChangeByCandDTO,
} from "../dtos/UserReferral.dto";

//Load the local enums
import { ReferralStatus } from "../enums/UserReferral.enum";

//Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";

// Import dynamoose library for DynamoDB queries
import { Query, QueryResponse } from "dynamoose/dist/ItemRetriever";

// Class definition for UserReferralDao implementing the BaseDao interface
class UserReferralDao implements BaseDao {
  modelName = "user"; // The model name used for user referrals
  partitianKey = "USR#EML#{primaryEmail}"; // Partition key format for user referrals
  sortKeys = { SK_REFERRAL: "REF#ID#{reqId}" }; // Sort key format for user referrals
  GSI1PK = "REF#";
  GSI1SK = "ID#{refId}";

  /**
   * getReferralsForCand
   * 
   * Fetches user Referral based on the provided email and status.
   * 
   * @param email - Email address of the user
   * @param status - referral status
   * @returns {Promise<QueryResponse<DbUserReferralDto>>} - A Promise that resolves to the Referral of the user
   */
  async getReferralsForCand(email: string, status?: string):Promise<QueryResponse<DbUserReferralDto>> {
    global.logger.info("Get user Referral by status [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    let query = UserReferralModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith("REF#ID#");
    if (status) {
      query = query.where("status").eq(status);
    }
    return query.exec();
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
  async getReferralScoreForCand(referralId: string, email: string) {
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
      .attributes(["matchingScore", "jdMatchErrorCode", "jdMatchErrorDesc"])
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
    let updateObject: Partial<DbUserReferralDto> = {  status: status };

    // If the status is set to DONE, add the doneByCandidate field with the current date
    if (status === ReferralStatus.DONE) {
      updateObject.doneByCandidate = new Date();
    }
    return UserReferralModel.update( {PK : PK, SK : SK} , updateObject);
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
    global.logger.info(`Get Referral for UserEmail ${userEmail} and with Referral Id ${referralId}. [DAO]`);
    const PK = this.partitianKey.replace("{primaryEmail}", userEmail);
    const SK = this.sortKeys.SK_REFERRAL.replace("{reqId}", referralId);
    return UserReferralModel.get({ PK: PK, SK: SK });
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
   * Fetches referrals based on GSI1PK and array of referral IDs.
   * @param referralIds - Array of referral IDs
   * @returns { Promise<QueryResponse<DbUserReferralDto>[]>} - A Promise that resolves to the Referrals
   */
  async getReferralsByIdsUsingGsis(referralIds: string[]): Promise<(DbUserReferralDto | null)[]> {
    global.logger.info("Get Referrals by GSI1PK and Referral IDs [DAO]");
    // Construct an array of keys based on referralIds
    const promises = referralIds.map((referralId) => {
      const GSI1SK = this.GSI1SK.strtr({ "{refId}": referralId });
      return UserReferralModel.query("GSI1PK")
        .eq(this.GSI1PK)
        .where("GSI1SK")
        .eq(GSI1SK)
        .exec()
        .then((referral) => referral.count ? referral[0] : null);
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
  async getUserReferralsByJobUrl(userEmail: string, jobUrl: string): Promise<QueryResponse<DbUserReferralDto>> {
    let PK = this.partitianKey.strtr({ "{primaryEmail}": userEmail });
    return UserReferralModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith("REF#ID")
      .where("jobUrl")
      .eq(jobUrl)
      .exec();
  }
}

// Export a new instance of UserReferralDao
const userReferralDao = new UserReferralDao();

export default userReferralDao;
