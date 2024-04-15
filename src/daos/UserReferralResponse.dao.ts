//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import { DbUserReferralResponseDto, UserReferralResponseModel } from "../db/models/UserReferralResponse.model";

//Load the local dtos
import { UserReferralResponseDTO } from "../dtos/UserReferralResponse.dto";
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// UserReferralResponseDao class implementing the BaseDao interface
class UserReferralResponseDao implements BaseDao {
  modelName = "UserReferralResponse";
  partitianKey = "USR#EML#{primaryEmail}"; // Partition key structure for user emails
  sortKeys = { SK_ID: "REF#RESP#" };

  /**
   * Fetches user ProvidedService based on the provided email.
   * @param email - Email address of the user
   * @returns User details corresponding to the email
   */
  async get(email: string): Promise<QueryResponse<DbUserReferralResponseDto>> {
    logger.info("Get user ReferralResponse by id [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    const SK = this.sortKeys.SK_ID;
    return UserReferralResponseModel.query("PK")
      .eq(PK)
      .where("SK")
      .eq(SK)
      .exec();
  }
  async getByEmailWithSpecifiedAttributes(
    email: string,
    attributes: string[]
  ): Promise<QueryResponse<DbUserReferralResponseDto>> {
    logger.info("Get user ReferralResponse by id [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    const SK = this.sortKeys.SK_ID;
    return UserReferralResponseModel.query("PK")
      .eq(PK)
      .where("SK")
      .eq(SK)
      .attributes(attributes)
      .exec();
  }

  /**
   * @param email
   * @param department
   * @param designation
   * @returns
   */
  async create(
    email: string,
    UserReferralResponseDTO: UserReferralResponseDTO
  ) {
    logger.info("Create employee Work ReferralResponse [DAO]");
    const SK = this.sortKeys.SK_ID;
    const UserReferralResponse = {
      PK: this.partitianKey.strtr({
        "{primaryEmail}": email,
      }),
      SK: SK,
      ...UserReferralResponseDTO,
    };
    return UserReferralResponseModel.create(UserReferralResponse);
  }

  /**
   *
   * @param email
   * @returns
   */
  async update(
    email: string,
    UserReferralResponseDTO: UserReferralResponseDTO
  ) {
    logger.info("Update user ReferralResponse [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    const SK = this.sortKeys.SK_ID;
    return UserReferralResponseModel.update(
      { PK: PK, SK: SK },
      UserReferralResponseDTO
    );
  }
}

const userReferralResponseDao = new UserReferralResponseDao();

export default userReferralResponseDao;
