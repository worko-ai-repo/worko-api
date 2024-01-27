//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import { UserReferralModel } from "../db/models/UserReferral.model";

//Load the local dtos
import { UserReferralRequestDTO } from "../dtos/User.dto";

//Load the local enums
import { ReferralStatus } from "../enums/UserReferral.enum";

//Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";

// Class definition for UserReferralDao implementing the BaseDao interface
class UserReferralDao implements BaseDao {
  modelName = "user"; // The model name used for user referrals
  partitianKey = "USR#EML#{primaryEmail}"; // Partition key format for user referrals
  sortKeys = { SK_REFERRAL: "REF#ID#{reqId}" }; // Sort key format for user referrals

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
   * Fetches user Referral based on the provided email and status.
   * @param email - Email address of the user
   * @param status - referral status
   * @returns {Promise<any>} - A Promise that resolves to the Referral of the user
   */
  async getByStatus(email: string, status: string) {
    global.logger.info("Get user Referral by status [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    return UserReferralModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith("REF#ID#")
      .filter("status")
      .eq(status)
      .exec();
  }

  /**
   * Request a user referral by creating a new entry in the database.
   *
   * @param referralRequest - The UserReferralRequestDTO containing referral request details.
   * @param email - The email associated with the referral request.
   */
  async requestReferral(
    referralRequest: UserReferralRequestDTO,
    email: string
  ) {
    global.logger.info("Create referral [DAO]");
    const SK = this.sortKeys.SK_REFERRAL.strtr({
      "{reqId}": UlidService.getUlidId(),
    });
    // Splitting referralRequest.SK into three parts using '#' delimiter
    const [refPrefix, refId, refNum] = SK.split("#");

    // Assigning values to GSI1PK and GSI1SK for Global Secondary Index 1
    // @todo add these along with other propertise of class like "primaryKey" and "sortKeys"; And refer them from there.
    const GSI1PK = `${refPrefix}#`;
    const GSI1SK = `${refId}#${refNum}`;
    const mScore = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
    const newReferralRequest = {
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
   *
   * @param referralId
   * @param email
   */
  async getScore(referralId: string, email: string) {
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
   *
   * @param email
   * @returns
   */
  async updateStatus(referralId: string, email: string, status: string) {
    global.logger.info("Update user referral status status [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    const SK = this.sortKeys.SK_REFERRAL.strtr({
      "{reqId}": referralId,
    });
    return UserReferralModel.update({ PK: PK, SK: SK }, { status: status });
  }

  /**
   * Fetches Referral based on GSI1PK, companySK.
   * @param companySK - Company sort key
   * @returns {Promise<any>} - A Promise that resolves to the Referral of the user
   */
  async getByGSI1PK(companySK: string) {
    global.logger.info("Get Referral by GSI1PK and companySK [DAO]");
    const GSI1PK = "REF#";
    const cSK = "ID#" + companySK;
    return UserReferralModel.query("GSI1PK")
      .eq(GSI1PK)
      .where("companySK")
      .eq(cSK)
      .exec();
  }

  /**
   * Fetches Referral based on GSI1PK, companySK, and status.
   * @param companySK - Company sort key
   * @param status - Referral status
   * @returns {Promise<any>} - A Promise that resolves to the Referral of the user
   */
  async getByGSI1PKAndStatus(companySK: string, status: string) {
    global.logger.info("Get Referral by GSI1PK and status [DAO]");
    const GSI1PK = "REF#";
    const cSK = "ID#" + companySK;
    return UserReferralModel.query("GSI1PK")
      .eq(GSI1PK)
      .where("companySK")
      .eq(cSK)
      .where("status")
      .eq(status)
      .exec();
  }

  /**
   * Fetches Referral based on GSI1PK, GSI1SK.
   * @param ReferralSK
   * @returns {Promise<any>} - A Promise that resolves to the Referral of the user
   */
  async getByGSI1PKAndGSI1SK(ReferralSK: string) {
    global.logger.info("Get Referral by GSI1PK and GSI1SK [DAO]");
    let indexOfID = ReferralSK.indexOf("ID#");
    const secondVariable = ReferralSK.slice(indexOfID);
    const GSI1PK = "REF#";
    return UserReferralModel.query("GSI1PK")
      .eq(GSI1PK)
      .where("GSI1SK")
      .eq(secondVariable)
      .exec();
  }

  /**
   * Fetches Referral based on GSI1PK, GSI1SK.
   * @param ReferralSK
   * @param attribute
   * @returns {Promise<any>} - A Promise that resolves to the Referral of the user
   */
  async getOnlyAttribute(GSI1SK: string, attribute: [string]) {
    global.logger.info("Get Referral by GSI1PK and GSI1SK [DAO]");
    const GSI1PK = "REF#";
    const finalGSI1SK = "ID#" + GSI1SK;
    return UserReferralModel.query("GSI1PK")
      .eq(GSI1PK)
      .where("GSI1SK")
      .eq(finalGSI1SK)
      .attributes(attribute)
      .exec();
  }

  /**
   *
   * @param
   * @returns
   */
  async updatePassedByUserIdsByGSI1SK(GSI1SK: string, value: string[]) {
    global.logger.info("Update user referral status by GSI1SK [DAO]");
    const finalGSI1SK = "ID#" + GSI1SK;
    return UserReferralModel.update(
      { GSI1PK: "REF#", GSI1SK: finalGSI1SK },
      { passedByUserIds: value }
    );
  }

  /**
   *
   * @param
   * @returns
   */
  async updateRejectedByUserIdsByGSI1SK(GSI1SK: string, value: []) {
    global.logger.info("Update user referral status by GSI1SK [DAO]");
    const finalGSI1SK = "ID#" + GSI1SK;
    return UserReferralModel.update(
      { GSI1PK: "REF#", GSI1SK: finalGSI1SK },
      { rejectedByUserIds: value }
    );
  }

  /**
   *
   * @param
   * @returns
   */
  async updateAcceptedByUserIdByGSI1SK(GSI1SK: string, value: string) {
    global.logger.info("Update user referral status by GSI1SK [DAO]");
    const finalGSI1SK = "ID#" + GSI1SK;
    return UserReferralModel.update(
      { GSI1PK: "REF#", GSI1SK: finalGSI1SK },
      { acceptedByUserId: value }
    );
  }

  /**
   *
   * @param
   * @returns
   */
  async updateDoneByEmployeeByGSI1SK(GSI1SK: string, value: Date) {
    global.logger.info("Update user referral status by GSI1SK [DAO]");
    const finalGSI1SK = "ID#" + GSI1SK;
    return UserReferralModel.update(
      { GSI1PK: "REF#", GSI1SK: finalGSI1SK },
      { doneByEmployee: value }
    );
  }

  /**
   *
   * @param
   * @returns
   */
  async updateDoneByCandidateByGSI1SK(GSI1SK: string, value: Date) {
    global.logger.info("Update user referral status by GSI1SK [DAO]");
    const finalGSI1SK = "ID#" + GSI1SK;
    return UserReferralModel.update(
      { GSI1PK: "REF#", GSI1SK: finalGSI1SK },
      { doneByCandidate: value }
    );
  }
}

// Export a new instance of UserReferralDao
const userReferralDao = new UserReferralDao();

export default userReferralDao;
