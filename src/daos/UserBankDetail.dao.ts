//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import { UserBankDetailModel } from "../db/models/UserBankDetail.model";

//Load the local dtos
import { UserBankDetailDTO } from "../dtos/UserBankDetail.dto";

//Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";

// UserBankDetailDao class implementing the BaseDao interface
class UserBankDetailDao implements BaseDao {
  modelName = "userBankDetail";
  partitianKey = "USR#EML#{primaryEmail}"; // Partition key structure for user emails
  sortKeys = { SK_ID: "BANK#" }; // Sort key structure using unique IDs

  /**
   * Fetches user BankDetail based on the provided email.
   * @param email - Email address of the user
   * @returns User BankDetail corresponding to the email
   */
  async get(email: string) {
    logger.info("Fetching user BankDetail by email [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    const SK = this.sortKeys.SK_ID;
    return UserBankDetailModel.query("PK").eq(PK).where("SK").eq(SK).exec();
  }

  /**
   * Creates user BankDetail.
   * @param email - Email address of the user
   * @param userBankDetailDTO - User BankDetail data
   * @returns Created user BankDetails
   */
  async create(email: string, userBankDetailDTO: UserBankDetailDTO) {
    logger.info("Creating user BankDetail [DAO]");
    const userBankDetail = {
      PK: this.partitianKey.strtr({
        "{primaryEmail}": email,
      }),
      SK: this.sortKeys.SK_ID,
      ...userBankDetailDTO,
    };
    return UserBankDetailModel.create(userBankDetail);
  }

  /**
   * Updates user BankDetail uri.
   * @param email - Email address of the user
   * @param userBankDetailDTO - User BankDetail data to update
   * @returns Updated user BankDetails
   */
  async update(email: string, userBankDetailDTO: UserBankDetailDTO) {
    logger.info("Updating user BankDetails [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    const SK = this.sortKeys.SK_ID;
    return UserBankDetailModel.update({ PK: PK, SK: SK }, userBankDetailDTO);
  }
}

const userBankDetailDao = new UserBankDetailDao();

export default userBankDetailDao;
