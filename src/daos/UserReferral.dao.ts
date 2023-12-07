//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import { UserRequestModel } from "../db/models/UserRequest.model";

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
    try {
      const SK = this.sortKeys.SK_REFERRAL.strtr({
        "{reqId}": UlidService.getUlidId(),
      });
      // Splitting referralRequest.SK into three parts using '#' delimiter
      const [refPrefix, refId, refNum] = SK.split("#");

      // Assigning values to GSI1PK and GSI1SK for Global Secondary Index 1
      const GSI1PK = `${refPrefix}#`;
      const GSI1SK = `${refId}#${refNum}`;

      const newReferralRequest = {
        PK: this.partitianKey.strtr({
          "{primaryEmail}": email,
        }),
        SK: SK,
        GSI1PK: GSI1PK,
        GSI1SK: GSI1SK,
        ...referralRequest,
      };
      // Log the referral request details
      console.log(newReferralRequest);

      // Create a new entry in the UserReqModel (database model) with the referral request data
      return UserRequestModel.create(newReferralRequest);
    } catch (error) {
      // Throw any encountered errors
      throw error;
    }
  }
}

// Export a new instance of UserReferralDao
const userReferralDao = new UserReferralDao();

export default userReferralDao;
