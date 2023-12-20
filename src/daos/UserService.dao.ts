//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import { UserServiceModel } from "../db/models/UserService.model";

//Load the local dtos
import {
  UserServiceInterviewGuidanceRequestDTO,
  UserServiceRequestDTO,
} from "../dtos/UserService.dto";

//Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";

// Class definition for UserServiceDao implementing BaseDao
class UserServiceDao implements BaseDao {
  modelName = "user";
  partitianKey = "USR#EML#{primaryEmail}";
  sortKeys = { SK_SRVC: "SRVC#ID#{serviceId}" };

  async createRequest(
    email: string,
    userServiceRequestDTO:
      | UserServiceInterviewGuidanceRequestDTO
      | UserServiceRequestDTO
  ) {
    console.log("Create service request [DAO]");
    const SK = this.sortKeys.SK_SRVC.strtr({
      "{serviceId}": UlidService.getUlidId(),
    });
    // Splitting referralRequest.SK into three parts using '#' delimiter
    const [refPrefix, refId, refNum] = SK.split("#");

    // Assigning values to GSI1PK and GSI1SK for Global Secondary Index 1
    // @todo add these along with other propertise of class like "primaryKey" and "sortKeys"; And refer them from there.
    const GSI1PK = `${refPrefix}#`;
    const GSI1SK = `${refId}#${refNum}`;
    const newServiceRequest = {
      PK: this.partitianKey.strtr({
        "{primaryEmail}": email,
      }),
      SK: SK,
      GSI1PK: GSI1PK,
      GSI1SK: GSI1SK,
      status: "pending",
      ...userServiceRequestDTO,
    };
    console.log("newServiceRequest: ", newServiceRequest);
    // Create a new entry in the UserReferralModel (database model) with the referral request data
    await UserServiceModel.create(newServiceRequest);
    const SKId = SK.split("#")[2];
    return { serviceRequestId: SKId };
  }

  /**
   *
   * @param referralId
   * @param email
   */
  async getStatus(referralId: string, email: string) {
    console.log("Get candidate service status [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    const SK = this.sortKeys.SK_SRVC.strtr({
      "{serviceId}": referralId,
    });
    return UserServiceModel.query("PK")
      .eq(PK)
      .where("SK")
      .eq(SK)
      .attributes(["status", "selectedSlot"])
      .exec();
  }
}

// Export an instance of UserServiceDao
const userServiceDao = new UserServiceDao();

export default userServiceDao;
