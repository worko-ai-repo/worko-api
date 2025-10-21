// Load the local daos
import { QueryResponse } from "dynamoose/dist/ItemRetriever";
import userReferralResponseDao from "../daos/UserReferralResponse.dao";

// Import dtos
import { UserReferralResponseDTO } from "../dtos/UserReferralResponse.dto";

// Import enums
import { CountUserDbEntityTypeEnum } from "../enums/CountUser.enum";

// Import services
import { countUserServiceObj } from "./CountUser.service";

// Import models
import { DbUserReferralResponseDto } from "../db/models/UserReferralResponse.model";
import { DbCountUserDto } from "../db/models/CountUser.model";

/**
 * UserReferralResponseService class is responsible for managing user ReferralResponse-related operations.
 */
class UserReferralResponseService {
  async performCountUserActivitiesAfterUserReferralResponseUpdate(
    empEmail: string,
    updatedUserReferralResponse: DbUserReferralResponseDto
  ) {
    const countUserReferralQueryResponse: QueryResponse<DbCountUserDto> = await countUserServiceObj.getCountUserByRegisteredEmailAndEntityType(empEmail, CountUserDbEntityTypeEnum.REFERRAL);
    const countUserReferralData: DbCountUserDto = countUserReferralQueryResponse[0];

    const {
      acceptedRefIds: updatedAcceptedRefIds,
      doneRefIds: updatedDoneRefIds,
      rejectedRefIds: updatedRejectedRefIds,
      passedRefIds: updatedPassedRefIds
    } = updatedUserReferralResponse;

    countUserServiceObj.createOrUpdateCountUserForReferralEntityType(
      empEmail,
      {
        employeeReferralCounts: {
          ...countUserReferralData?.employeeReferralCounts,

          /**
           * @todo Implementing `awaiting` count is tricky
           * As of now we are putting this on hold
           */

          accepted: updatedAcceptedRefIds.length,
          done: updatedDoneRefIds.length,
          rejected: updatedRejectedRefIds.length,

          /**
           * @todo As of now `total` is not being implemented because `awaiting` count is tricky
           */
        }
      },
      !!countUserReferralQueryResponse.count // If count user already exists in ddb then `true` else `false`
    );    
  }

  /**
   * Retrieves user ReferralResponse by email.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - A Promise that resolves to the ReferralResponse of the user
   */
  async get(email: string): Promise<QueryResponse<DbUserReferralResponseDto>> {
    // Logging the action of getting user ReferralResponse by email in the service layer
    global.logger.info(
      "Fetching user ReferralResponse by email [UserReferralResponseService]"
    );
    return userReferralResponseDao.get(email);
  }

  /**
   * getByEmailWithSpecifiedAttributes
   * 
   * Retrieves user ReferralResponse by email.
   *
   * @param email - Email of the user
   * @returns {Promise<any>} - A Promise that resolves to the ReferralResponse of the user
   */
  async getByEmailWithSpecifiedAttributes(email: string, attributes: string[]): Promise<any> {
    // Logging the action of getting user ReferralResponse by email in the service layer
    global.logger.info(
      "Fetching user ReferralResponse by email [UserReferralResponseService]"
    );
    return userReferralResponseDao.getByEmailWithSpecifiedAttributes(email, attributes);
  }


  /**
   * Creates a new user ReferralResponse.
   *
   * @param email - Email of the user
   * @param userReferralResponseDTO - Data Transfer Object containing user ReferralResponse details
   * @returns {Promise<any>} - A Promise that resolves when the ReferralResponse is successfully created
   */
  async create(
    email: string,
    userReferralResponseDTO: UserReferralResponseDTO
  ): Promise<any> {
    // Logging the action of creating user ReferralResponse in the service layer
    global.logger.info(
      "Creating user ReferralResponse [UserReferralResponseService]"
    );
    return userReferralResponseDao.create(email, userReferralResponseDTO);
  }

  /**
   * Updates existing user ReferralResponse.
   *
   * @param email - Email of the user
   * @param userReferralResponseDTO - Data Transfer Object containing updated user ReferralResponse details
   * @returns {Promise<any>} - A Promise that resolves when the ReferralResponse is successfully updated
   */
  async update(
    email: string,
    userReferralResponseDTO: UserReferralResponseDTO
  ): Promise<any> {
    // Logging the action of updating user ReferralResponse in the service layer
    logger.info("Updating user ReferralResponse [UserReferralResponseService]");

    return userReferralResponseDao.update(email, userReferralResponseDTO);
  }
}

// Exporting an instance of the UserReferralResponseService class
export default new UserReferralResponseService();
