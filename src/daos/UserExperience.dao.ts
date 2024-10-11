//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import { DbUserExperienceDto, UserExperienceModel } from "../db/models/UserExperience.model";

//Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";

// Load dtos and other packages
import { UserExperienceDTO } from "../dtos/UserExperience.dto";
import { QueryResponse, ScanResponse } from "dynamoose/dist/ItemRetriever";
import { RecordListingFilterOptions, RecordListingResponseDTO } from "../dtos/Common.dto";
import { lastKeyToBase64EncodeStr } from "../helpers/dynamoose.helper";

// UserExperienceDao class implementing the BaseDao interface
class UserExperienceDao implements BaseDao {
  modelName = "UserExperience";
  partitianKey = "USR#EML#{primaryEmail}"; // Partition key structure for user emails
  sortKeys = { SK_ID: "EXP#ID#{uuid}" }; // Sort key structure using unique IDs
  GSI1PK = "EXP#";
  GSI1SK = "COMP#ID#{companyId}#ID#{id}";

  /**
   * Fetches user experience based on the provided email.
   * @param email - Email address of the user
   * @returns User details corresponding to the email
   */
  async get(email: string) {
    global.logger.info("Get user experience by id [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    const [skBegins] = this.sortKeys.SK_ID.split("#", 2);
    return UserExperienceModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith(skBegins)
      .exec();
  }

  /**
   * getByUserPrimaryEmailAndId
   *
   * Retrieves user experience data by primary email and ID asynchronously.
   *
   * @param {string} email - The primary email of the user.
   * @param {string} id - The ID of the experience to retrieve.
   * @returns {Promise<QueryResponse<DbUserExperienceDto>>} A promise that resolves with the query response containing the user's experience data.
   */
  async getByUserPrimaryEmailAndId(
    email: string,
    id: string
  ): Promise<QueryResponse<DbUserExperienceDto>> {
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });

    const SK = this.sortKeys.SK_ID.strtr({
      "{uuid}": id,
    });

    return UserExperienceModel.query("PK").eq(PK).where("SK").eq(SK).exec();
  }

  /**
   * @param email
   * @param UserExperienceDto
   * @returns
   */
  async create(email: string, userExperienceDto: UserExperienceDTO) {
    global.logger.info("Create employee Work Experience [DAO]");
    const id = UlidService.getUlidId();
    const userExperienceDTO = {
      PK: this.partitianKey.strtr({
        "{primaryEmail}": email,
      }),
      SK: this.sortKeys.SK_ID.strtr({
        "{uuid}": id,
      }),
      GSI1PK: this.GSI1PK,
      GSI1SK: this.GSI1SK.strtr({
        "{companyId}": userExperienceDto.companyId,
        "{id}": id,
      }),
      id: id,
      isEmailVerified: false,
      ...userExperienceDto,
    };
    return UserExperienceModel.create(userExperienceDTO);
  }

  /**
   *
   * @param email
   * @returns
   */
  async update(
    email: string,
    SK: string,
    userExperienceDTO: UserExperienceDTO
  ) {
    global.logger.info("Update user Experience [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    return UserExperienceModel.update({ PK: PK, SK: SK }, userExperienceDTO);
  }

  /**
   * verifyWorkEmail
   *
   * A description of the entire function.
   *
   * @param {string} primaryEmail - description of parameter
   * @param {string} id - description of parameter
   * @return {Promise<DbUserExperienceDto>} description of return value
   */
  async verifyWorkEmail(
    primaryEmail: string,
    id: string
  ): Promise<DbUserExperienceDto> {
    let inputKey = {
      PK: this.partitianKey.strtr({
        "{primaryEmail}": primaryEmail,
      }),
      SK: this.sortKeys.SK_ID.strtr({
        "{uuid}": id,
      }),
    };
    return UserExperienceModel.update(inputKey, { isEmailVerified: true });
  }

  // /**
  //  * updateUserExperienceGSIsWithExpId
  //  *
  //  *  This function is intended to update the GSI1SK and GSI1PK for a user's experience
  //  * in the database. It should be used exclusively for this purpose and only invoked
  //  * once for updating the specified user's experience. Do not use this function for
  //  * any other operations or purposes.
  //  *
  //  * Updates the user's experiences.
  //  *
  //  * @param {string} userEmail - The email of the user.
  //  * @param {string} id - The ID of the user.
  //  * @return {Promise<DbUserExperienceDto>} A promise that resolves to the updated user's experiences.
  //  */
  // async updateUserExperienceGSIsWithExpId(userEmail: string, id: string, companyId: string): Promise<DbUserExperienceDto> {
  //   // prepare the keys
  //   let PK = this.partitianKey.strtr({
  //     "{primaryEmail}": userEmail,
  //   });
  //   let SK = this.sortKeys.SK_ID.strtr({
  //     "{uuid}": id,
  //   });

  //   // prepare the GSI1SK value to update
  //   let GSI1SK = this.GSI1SK.strtr({
  //     "{companyId}": companyId,
  //     "{id}": id,
  //   })
  //   return UserExperienceModel.update(
  //     { PK: PK, SK: SK },
  //     { GSI1PK: this.GSI1PK, GSI1SK: GSI1SK }
  //   );
  // }

  /**
   * getCompanyCurrentEmployeesByCompanyId
   *
   * Retrieves company's current employees for the provided companyId.
   *
   * @param {string} companyId - The company ID to filter users by.
   * @return {Promise<QueryResponse<DbUserExperienceDto>>} A Promise that resolves to a QueryResponse containing the filtered users.
   */
  async getCompanyCurrentEmployeesByCompanyId(
    companyId: string,
    options: RecordListingFilterOptions
  ): Promise<QueryResponse<DbUserExperienceDto>> {
    global.logger.info("Get company current employees by company ID [DAO]");

    // construct query based on args
    let query = UserExperienceModel.query("GSI1PK")
      .eq(this.GSI1PK)
      .where("GSI1SK")
      .beginsWith(`COMP#ID#${companyId}`)
      .where("isCurrent")
      .eq(true);

    // apply lastKey if provided
    if (options.lastKey) {
      query = query.startAt(options.lastKey);
    }

    // apply pageSize if provided
    if (options.pageSize) {
      query = query.limit(options.pageSize);
    }

    // perpare result
    return query.exec();
  }
}

const userExperienceDao = new UserExperienceDao();

export default userExperienceDao;
