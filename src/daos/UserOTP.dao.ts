// Import the base dao
import BaseDao from "./Base.dao";

// Import the models
import { DbUserOtpDto, UserOtpModel } from "../db/models/UserOTP.model";

// Import the dtos
import { UserOtpCreateDto } from "../dtos/UserOTP.dto";

// Import necessary enums
import { UserOtpStatusEnum } from "../enums/User.enum";

// Import the services
import UlidService from "../services/Ulid.service";
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

/**
 * UserOTPDao
 * 
 * Class for running OTP related queries in database 
 */
class UserOtpDao implements BaseDao {
  modelName: string = "UserOtp";
  partitianKey: string = "USR#EML#{emailId}";
  sortKeys: { SK_INIT: string } = {
    SK_INIT: "OTP#{emailAddressorContactNumber}#ID#{id}",
  };

  /**
   * createOTP
   *
   * Creates a new OTP (One-Time Password) entry in the database.
   *
   * @param {string} primaryEmail - The primary email address of the user.
   * @param {UserOtpCreateApiDto} otpObjDetails - Details of the OTP object to be created.
   * @returns {Promise<DbUserOtpDto>} - A Promise that resolves with the created OTP entry.
   */
  async createOtp(
    primaryEmail: string,
    otpObjDetails: UserOtpCreateDto
  ): Promise<DbUserOtpDto> {
    // Generate a unique ID for the OTP entry
    let id = UlidService.getUlidId();

    // Construct OTP details object
    const otpDetails = {
      ...otpObjDetails,
      PK: this.partitianKey.strtr({
        "{emailId}": primaryEmail
      }),
      SK: this.sortKeys.SK_INIT.strtr({
        "{emailAddressorContactNumber}": otpObjDetails.sentTo,
        "{id}": id,
      }),
      id: id,
      status: UserOtpStatusEnum.ACTIVE,
    };

    // Create OTP entry in the database
    return UserOtpModel.create(otpDetails);
  }
  
  /**
   * updateUserOtpStatusToUsed
   * 
   * Mark the OTP entry as used.
   *
   * @param {string} primaryEmail
   * @param {string} sentTo
   * @param {string} otpEntryId
   * @return {Promise<DbUserOtpDto>}
   */
  async updateUserOtpStatusToUsed(
    primaryEmail: string,
    sentTo: string,
    otpEntryId: string
  ): Promise<DbUserOtpDto> {
    // Prepare the "inputKey" for which the satus has to be updated.
    let inputKey = {
      PK: this.partitianKey.strtr({
        "{emailId}": primaryEmail,
      }),
      SK: this.sortKeys.SK_INIT.strtr({
        "{emailAddressorContactNumber}": sentTo,
        "{id}": otpEntryId,
      }),
    };

    // Update the status of the OTP entry
    return UserOtpModel.update(inputKey, { status: UserOtpStatusEnum.USED });
  }

  /**
   * getByUserPrimaryEmailAndSentTo
   * 
   * Retrieves a user OTP record by their primary email and sent to email, with an optional status filter.
   *
   * @param {string} primaryEmail - description of parameter
   * @param {string} sentTo - description of parameter
   * @param {UserOtpStatusEnum} status - description of parameter
   * @return {Promise<QueryResponse<DbUserOtpDto>>} description of return value
   */
  async getByUserPrimaryEmailAndSentTo(
    primaryEmail: string,
    sentTo: string,
    status?: UserOtpStatusEnum
  ): Promise<QueryResponse<DbUserOtpDto>> {
    // Prepare the PK & SK_PREFIX based on provided details and expectation
    const PK = this.partitianKey.strtr({
      "{emailId}": primaryEmail,
    });
    const SK_PREFIX = this.sortKeys.SK_INIT
      .strtr({
        "{emailAddressorContactNumber}": sentTo,
      })
      .split("#ID#")
      .shift();

    // Get the details based on prepare PK & SK_PREFIX
    let query = UserOtpModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith(SK_PREFIX);

    // If status is provided, add it to the query
    if (status) {
      query = query.where("status").eq(status);
    }

    // Execute the quey with provided details to get the OTPs
    return query.exec()
  }
}

// Create and export UserOTPDao instance
const userOtpDao = new UserOtpDao();
export default userOtpDao;