import { UserReqModel } from "../db/models/UserRequest.model";
import UlidService from "../services/Ulid.service";
import { UserReferralRequestDTO } from "../dtos/User.dto";
import BaseDao from "./Base.dao";

class UserReferralDao extends BaseDao {
  /**
   *
   * @param referralRequest
   * @param email
   */
  async requestReferral(
    referralRequest: UserReferralRequestDTO,
    email: string
  ) {
    try {
      referralRequest.PK = this.USER_CONSTANTS.PK.replace(
        "{primaryEmail}",
        email
      );
      referralRequest.SK = this.USER_CONSTANTS.SK_REFERRAL.replace(
        "{reqId}",
        UlidService.getUlidId()
      );
      // Splitting referralRequest.SK into two parts based on '#' delimiter
      const [refPrefix, refId, refNum] = referralRequest.SK.split("#");
      // Assigning values to GSI1PK and GSI1SK
      referralRequest.GSI1PK = `${refPrefix}#`;
      referralRequest.GSI1SK = `${refId}#${refNum}`;
      console.log(referralRequest);
      UserReqModel.create(referralRequest);
    } catch (error) {
      throw error;
    }
  }
}

export default new UserReferralDao();
