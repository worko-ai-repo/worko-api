//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import { UserProvidedServiceModel } from "../db/models/UserProvidedService.model";

//Load the local dtos
// import { UserProvidedServiceDTO } from "../dtos/UserProvidedService.dto";

//Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";
import { UserProvidedServiceDTO } from "../dtos/UserProvidedService.dto";

// UserProvidedServiceDao class implementing the BaseDao interface
class UserProvidedServiceDao implements BaseDao {
  modelName = "userProvidedService";
  partitianKey = "USR#EML#{primaryEmail}"; // Partition key structure for user emails
  sortKeys = { SK_ID: "PVD#SRVC#ID#{srvcId}" }; // Sort key structure using unique IDs

  /**
   * Fetches user ProvidedService based on the provided email.
   * @param email - Email address of the user
   * @returns User details corresponding to the email
   */
  async get(email: string) {
    logger.info("Get user ProvidedService by id [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    // const SK = this.sortKeys.SK_ID;
    return UserProvidedServiceModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith("PVD#SRVC#ID#")
      .exec();
  }

  /**
   * @param email
   * @param department
   * @param designation
   * @returns
   */
  async create(email: string, userProvidedServiceDTO: UserProvidedServiceDTO) {
    logger.info("Create employee Work ProvidedService [DAO]");
    const SK = this.sortKeys.SK_ID.strtr({
      "{srvcId}": UlidService.getUlidId(),
    });
    console.log("SK: ", SK);
    const userProvidedService = {
      PK: this.partitianKey.strtr({
        "{primaryEmail}": email,
      }),
      SK: SK,
      ...userProvidedServiceDTO,
    };
    return UserProvidedServiceModel.create(userProvidedService);
  }

  /**
   *
   * @param email
   * @returns
   */
  async update(
    email: string,
    SK: string,
    userProvidedServiceDTO: UserProvidedServiceDTO
  ) {
    logger.info("Update user ProvidedService [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });

    console.log(
      "userProvidedServiceDTO.durationAndPrices[0].createdAt: -",
      userProvidedServiceDTO.durationAndPrices[0].createdAt,
      "userProvidedServiceDTO.durationAndPrices[0].updatedAt: -",
      userProvidedServiceDTO.durationAndPrices[0].updatedAt
    );
    return UserProvidedServiceModel.update(
      { PK: PK, SK: SK },
      userProvidedServiceDTO
    );
  }
}

const userProvidedServiceDao = new UserProvidedServiceDao();

export default userProvidedServiceDao;
