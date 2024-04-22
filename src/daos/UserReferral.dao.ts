//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import {
  DbUserReferralDto,
  UserReferralModel,
} from "../db/models/UserReferral.model";

//Load the local dtos
import { UserReferralRequestDTO } from "../dtos/User.dto";
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
   * Fetches user Referral based on the provided email.
   * @param email - Email address of the user
   * @returns User details corresponding to the email
   */
  async get(email: string) {
    global.logger.info("Get user Referral by email [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    return UserReferralModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith("REF#ID#")
      .exec();
  }

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
   * @param referralRequest - The UserReferralRequestDTO containing referral request details.
   * @param email - The email associated with the referral request.
   */
  async create(referralRequest: UserReferralRequestDTO, email: string) {
    global.logger.info("Create referral [DAO]");

    // Prepare id
    const id = UlidService.getUlidId();

    // Prepare the SK
    const SK = this.sortKeys.SK_REFERRAL.strtr({
      "{reqId}": id,
    });
    // Splitting referralRequest.SK into three parts using '#' delimiter
    const [refPrefix, refId, refNum] = SK.split("#");

    // Assigning values to GSI1PK and GSI1SK for Global Secondary Index 1
    // @todo add these along with other propertise of class like "primaryKey" and "sortKeys"; And refer them from there.
    const GSI1PK = `${refPrefix}#`;
    const GSI1SK = `${refId}#${refNum}`;
    // const mScore = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
    const mScore = 0;
    const newReferralRequest = {
      id: id,
      PK: this.partitianKey.strtr({
        "{primaryEmail}": email,
      }),
      SK: SK,
      GSI1PK: GSI1PK,
      GSI1SK: GSI1SK,
      status: ReferralStatus.AWAITING,
      matchingScore: mScore,
      ...referralRequest,
    };
    // Create a new entry in the UserReferralModel (database model) with the referral request data
    UserReferralModel.create(newReferralRequest);
    const SKId = SK.split("#")[2];
    return { referralRequestId: SKId };
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
      .attributes(["matchingScore"])
      .exec();
  }

  /**
   * updateStatus
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
    const PK = this.partitianKey.strtr({ "{primaryEmail}": email });
    const SK = this.sortKeys.SK_REFERRAL.strtr({ "{reqId}": referralId });

    // Update the referral status in the database
    return UserReferralModel.update({ PK: PK, SK: SK }, { status: status });
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
   * Fetches Referral based on GSI1PK, companySK.
   * @param companyId - Company sort key
   * @returns {Promise<any>} - A Promise that resolves to the Referral of the user
   */
  async getEmpReferralsByCompanyId(companyId: string) {
    global.logger.info("Get Referral EmpReferralsByCompanyId [DAO]");
    return UserReferralModel.query("GSI1PK")
      .eq(this.GSI1PK)
      .where("companyId")
      .eq(companyId)
      .exec();
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
  async getByGSI1(GSI1SK: string) {
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
  async getReferralsByIdsUsingGsis(referralIds: string[]): Promise<QueryResponse<DbUserReferralDto>[]>{
    global.logger.info("Get Referrals by GSI1PK and Referral IDs [DAO]");
    // Construct an array of keys based on referralIds
    const promises = referralIds.map((referralId) => {
      const GSI1SK = this.GSI1SK.strtr({ "{refId}": referralId });
      return UserReferralModel.query("GSI1PK")
        .eq(this.GSI1PK)
        .where("GSI1SK")
        .eq(GSI1SK)
        .exec();
    });
    return Promise.all(promises);
  }
}

// Export a new instance of UserReferralDao
const userReferralDao = new UserReferralDao();

export default userReferralDao;
