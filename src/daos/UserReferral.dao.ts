//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import { UserReferralModel } from "../db/models/UserReferral.model";

//Load the local dtos
import { UserReferralRequestDTO } from "../dtos/User.dto";

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
    logger.info("Get user Referral by email [DAO]");
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
   * Request a user referral by creating a new entry in the database.
   *
   * @param referralRequest - The UserReferralRequestDTO containing referral request details.
   * @param email - The email associated with the referral request.
   */
  async requestReferral(
    referralRequest: UserReferralRequestDTO,
    email: string
  ) {
    console.log("Create referral [DAO]");
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
      status: "pending",
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
    console.log("Get referral Matching score [DAO]");
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
}

// Export a new instance of UserReferralDao
const userReferralDao = new UserReferralDao();

export default userReferralDao;
