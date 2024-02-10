//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import { UserAvailabilityModel } from "../db/models/UserAvailability.model";

//Load the local dtos
import { UserAvailabilityDTO } from "../dtos/UserAvailability.dto";

// UserAvailabilityDao class implementing the BaseDao interface
class UserAvailabilityDao implements BaseDao {
  modelName = "UserAvailability";
  partitianKey = "USR#EML#{primaryEmail}"; // Partition key structure for user emails
  sortKeys = { SK_ID: "AVAIL#" };

  /**
   * Fetches user ProvidedService based on the provided email.
   * @param email - Email address of the user
   * @returns User details corresponding to the email
   */
  async get(email: string) {
    logger.info("Get user availability by id [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    const SK = this.sortKeys.SK_ID;
    return UserAvailabilityModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith(SK)
      .exec();
  }

  /**
   * @param email
   * @param department
   * @param designation
   * @returns
   */
  async create(email: string, UserAvailabilityDTO: UserAvailabilityDTO) {
    logger.info("Create employee Work availability [DAO]");
    const SK = this.sortKeys.SK_ID;
    const UserAvailability = {
      PK: this.partitianKey.strtr({
        "{primaryEmail}": email,
      }),
      SK: SK,
      ...UserAvailabilityDTO,
    };
    return UserAvailabilityModel.create(UserAvailability);
  }

  /**
   *
   * @param email
   * @returns
   */
  async update(email: string, UserAvailabilityDTO: UserAvailabilityDTO) {
    logger.info("Update user availability [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    const SK = this.sortKeys.SK_ID;
    return UserAvailabilityModel.update(
      { PK: PK, SK: SK },
      UserAvailabilityDTO
    );
  }
}

const userAvailabilityDao = new UserAvailabilityDao();

export default userAvailabilityDao;
