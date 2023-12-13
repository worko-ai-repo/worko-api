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
    // Log the referral request details
    console.log("newReferralRequest: ->", newReferralRequest);

    // Create a new entry in the UserReferralModel (database model) with the referral request data
    UserReferralModel.create(newReferralRequest);
    return { matchingScore: mScore };
  }
}

// Export a new instance of UserReferralDao
const userReferralDao = new UserReferralDao();

export default userReferralDao;
