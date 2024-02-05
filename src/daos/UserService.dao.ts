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
import { ServiceStatus } from "../enums/UserService.enum";

// Class definition for UserServiceDao implementing BaseDao
class UserServiceDao implements BaseDao {
  modelName = "user";
  partitianKey = "USR#EML#{primaryEmail}";
  sortKeys = { SK_SRVC: "SRVC#ID#{serviceId}" };

  /**
   * Fetches user Service based on the provided email.
   * @param email - Email address of the user
   * @returns User details corresponding to the email
   */
  async get(email: string) {
    logger.info("Get user Service by email [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    return UserServiceModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith("SRVC#ID#")
      .exec();
  }

  /**
   * Fetches user Service based on the provided email and status.
   * @param email - Email address of the user
   * @param status - Service status
   * @returns {Promise<any>} - A Promise that resolves to the Service of the user
   */
  async getByStatus(email: string, status: string) {
    global.logger.info("Get user Service by status [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    return UserServiceModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith("SRVC#ID#")
      .filter("status")
      .eq(status)
      .exec();
  }

  async createRequest(
    email: string,
    userServiceRequestDTO:
      | UserServiceInterviewGuidanceRequestDTO
      | UserServiceRequestDTO
  ) {
    global.logger.info("Create service request [DAO]");
    const SK = this.sortKeys.SK_SRVC.strtr({
      "{serviceId}": UlidService.getUlidId(),
    });
    // Splitting ServiceRequest.SK into three parts using '#' delimiter
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
      status: ServiceStatus.AWAITING,
      ...userServiceRequestDTO,
    };
    global.logger.info("newServiceRequest: ", newServiceRequest);
    // Create a new entry in the UserServiceModel (database model) with the Service request data
    await UserServiceModel.create(newServiceRequest);
    const SKId = SK.split("#")[2];
    return { serviceRequestId: SKId };
  }

  /**
   *
   * @param ServiceId
   * @param email
   */
  async getStatus(ServiceId: string, email: string) {
    global.logger.info("Get candidate service status [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    const SK = this.sortKeys.SK_SRVC.strtr({
      "{serviceId}": ServiceId,
    });
    return UserServiceModel.query("PK")
      .eq(PK)
      .where("SK")
      .eq(SK)
      .attributes(["status", "selectedSlot"])
      .exec();
  }

  /**
   *
   * @param serviceId - Service ID
   * @param email - Email of the user
   * @param status - status
   * @returns {Promise<any>} - A Promise that resolves to the Service of the user
   */
  async updateStatus(serviceId: string, email: string, status: string) {
    global.logger.info("Update user Service status status [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    const SK = this.sortKeys.SK_SRVC.strtr({
      "{serviceId}": serviceId,
    });
    return UserServiceModel.update({ PK: PK, SK: SK }, { status: status });
  }
}

// Export an instance of UserServiceDao
const userServiceDao = new UserServiceDao();

export default userServiceDao;
