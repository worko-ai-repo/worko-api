// Import  QueryResponse
import { QueryResponse } from 'dynamoose/dist/ItemRetriever';
import { ObjectType } from 'dynamoose/dist/General';

// Import Luxon
import { DateTime } from 'luxon';

// Import aws sdk configs
import { awsClientCognitoIdentityProviderLibrary } from "../configs/aws-sdk.config";

// Import Constants
import APP_CONSTANTS from '../configs/constants.config';

// Import DTO
import { CorporateUserInviteLisitngFilterOptions, CorporateUserInviteCreateDto, CorporateUserInviteCommonUpdateDto, CorporateUserInviteSoftDeleteApiDto, CorporateUserInviteUpdateApiDto } from '../dtos/CorporateUserInvite.dto';
import { EmailTemplatePlaceholderCORP_ADMIN_ACCESS_INVITE } from '../dtos/EmailTemplatePlaceholder.dto';
import { PaginatedResultsWithMatchingConditionsInternalResponse, PaginatedResultsWithMatchingConditionsResponse } from '../dtos/Common.dto';

// Import DAO
import { corporateInviteDaoObj } from '../daos/CorporateUserInvite.dao';

// Import Enums
import { CorporateUserInviteAccessTypeEnum, CorpInviteStatusEnum } from '../enums/CorporateUserInvite.enum';
import { EmailTemplateEnum } from '../enums/EmailTemplate.enum';

// Import Helpers
import { attachCompanyDetails } from '../helpers/companyDetailsInjector.helper';
import { dateHelperObj } from "../helpers/date.helper";
import { injectEntityDetailsHelperObj } from "../helpers/injectEntityDetails.helper";

// Import libraries
import { EmailSourceDestinationAddress, emailLibrary } from '../libraries/email.library';

// Import Models
import { DbCompanyDetailDto } from '../db/models/CompanyDetail.model';
import { DbCorporateUserInviteDto } from '../db/models/CorporateUserInvite.model';
import { DbCorporateUserDto } from "../db/models/CorporateUser.model";

// Import Services
import { companyServiceObj } from '../admin/services/Company.service';

// Import utils
import { BaseError } from '../utils/errors.util';
import HttpStatusCode from '../utils/http-codes.util';

/**
 * CorporateInviteService
 * 
 * This is a service class responsible for handling corporate-related operations from the admin side.
 */
class CorporateIserInviteService {
  private async sendCorporateEmailInvite(
    inviteId: string,
    fullName: string, 
    recieverEmail: string, 
    corporateUserType:CorporateUserInviteAccessTypeEnum,
    companyName: string,
  ) {
      // Prepare the necessary parameters
      const toAddress: EmailSourceDestinationAddress = {
        email: recieverEmail,
        fullName: fullName,
      };

      // Prepare the email placeholders
      const emailPlaceholders: EmailTemplatePlaceholderCORP_ADMIN_ACCESS_INVITE =
        {
          role: corporateUserType ===
            CorporateUserInviteAccessTypeEnum.CORPORATE_ADMIN
              ? APP_CONSTANTS.COGNITO_READABLE_GROUPS.CORPORATE_ADMIN
              : APP_CONSTANTS.COGNITO_READABLE_GROUPS.CORPORATE_RECRUITER,
          userName: fullName.toTitleCase(),
          companyName: companyName.toTitleCase(),
          signupUrl: APP_CONSTANTS.FRONTEND_URLS.CORP_SIGNUP.strtr({
            "{token}": inviteId,
          }),
          loginUrl: APP_CONSTANTS.FRONTEND_URLS.CORP_LOGIN,
          ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
        };

      // Send Invite to the user and log if the email is not sent
      let emailDetails = await emailLibrary.sendEmail(
        EmailTemplateEnum.CORP_ADMIN_ACCESS_INVITE,
        toAddress,
        emailPlaceholders
      );
      if (!emailDetails.systemLogId) {
        // Log the error message if the email is not sent
        global.logger.error("Error in sending email invite to the corporate.", {
          methodName: this.createInvite.name,
        });

        return false;
      }

      return true;
  }

  /**
   * createInvite
   *
   * This method is used to Do the following tasks:
   * 1. Create a new Invite Request for the user in the database.
   * 2. Send an email to the user with the invite link.
   *
   * @param {CorporateUserInviteCreateDto} corporateInviteUserCreateDto - Final Inteface used by the service to create a new Invite Request.
   * @returns { Promise<{ finalInvite: DbCorporateUserInviteDto; companyName: string }> }
   */
  async createInvite(
    corporateInviteUserCreateDto: CorporateUserInviteCreateDto
  ): Promise<{
    finalInvite: DbCorporateUserInviteDto;
    companyName: string;
  }> {
    global.logger.info(`Generating new request for the Corporate. [service]`, {
      filePath: __filename,
      methodName: this.createInvite.name,
      corporateUserType: corporateInviteUserCreateDto.corporateUserType,
    });

    const existingInvite: QueryResponse<DbCorporateUserInviteDto> =
      await corporateInviteDaoObj.getInviteByUserEmailAndCompanyId(
        corporateInviteUserCreateDto.companyId,
        corporateInviteUserCreateDto.email
      );
    if (existingInvite.count) {
      // Throw an error if the user already has an Invite Request
      throw new BaseError(
        "An invite request already exists for the user, if you want to send invite again, please use resend invite.",
        HttpStatusCode.CONFLICT_409
      );
    }

    // check if the company exists and throw an error if not found
    let companyDetails: QueryResponse<DbCompanyDetailDto> =
      await companyServiceObj.getCompanyDetailById(
        corporateInviteUserCreateDto.companyId
      );
    if (!companyDetails.count) {
      // Throw an error if the CompanyId is not found
      throw new BaseError(
        `Requested Company not found`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    if(corporateInviteUserCreateDto.corporateUserType===CorporateUserInviteAccessTypeEnum.CORPORATE_ADMIN) {
      // Check whether the invite with same `companyId` and `corporate-admin` accesstype is already exists
      const existingInviteWithCompanyId: QueryResponse<DbCorporateUserInviteDto> = await corporateInviteDaoObj.getInvitesByCompanyIdAndAccessType(
        corporateInviteUserCreateDto.companyId,
        CorporateUserInviteAccessTypeEnum.CORPORATE_ADMIN
      )
      if(existingInviteWithCompanyId.count) {
        throw new BaseError(
          "An invite request already exists for the given access type and company.",
          HttpStatusCode.CONFLICT_409
        );
      }   
    }
    
    // Final response object to be returned and saved in the database
    let inviteDetails: DbCorporateUserInviteDto =
      await corporateInviteDaoObj.createInvite(corporateInviteUserCreateDto);

    // Send email to the user if the invite is created
    if (inviteDetails?.id) {
      const userPoolId: string | undefined =
        process.env.APP_AWS_COGNITO_USER_POOL_ID;
      if (!userPoolId) {
        throw new BaseError(
          "User pool id not found in the environment for interacting with cognito.",
          HttpStatusCode.INTERNAL_SERVER_ERROR_500
        );
      }

      const isInEvaluatorGroup: {
        cognitoUserId: string | undefined;
        userEmail: string | undefined;
        isInSpecifiedGroup: boolean;
      } = await awsClientCognitoIdentityProviderLibrary.checkUserInCognitoGroup(
        userPoolId,
        inviteDetails.email,
        APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.EVALUATOR
      );

      if (isInEvaluatorGroup.isInSpecifiedGroup) {
        global.logger.info("User is already in the evaluator group.", {
          methodName: this.createInvite.name,
          companyId: inviteDetails.companyId,
          email: inviteDetails.email,
          inviteId: inviteDetails.id,
          isInEvaluatorGroup,
        });

        const updateData: Partial<CorporateUserInviteCommonUpdateDto> = {
          evaluatorCognitoUserId: isInEvaluatorGroup.cognitoUserId,
          updatedByUserId: inviteDetails.createdByUserId,
          updatedByCorporateUserId: inviteDetails.createdByCorporateUserId,
        };

        const updatedInviteDetails: DbCorporateUserInviteDto =
          await this.updateCommonInvite(
            inviteDetails.companyId,
            inviteDetails.email,
            inviteDetails.id,
            updateData
          );
        if (!updatedInviteDetails?.evaluatorCognitoUserId) {
          global.logger.error(
            "Error in updating the evaluator cognito user id.",
            {
              methodName: this.createInvite.name,
              companyId: inviteDetails.companyId,
              email: inviteDetails.email,
              inviteId: inviteDetails.id,
              isInEvaluatorGroup,
            }
          );
          throw new BaseError(
            "Error in updating the evaluator cognito user id.",
            HttpStatusCode.INTERNAL_SERVER_ERROR_500
          );
        }

        inviteDetails = updatedInviteDetails;
      }

      const isCorporateEmailInviteSent: boolean =
        await this.sendCorporateEmailInvite(
          inviteDetails.id,
          `${inviteDetails.firstName} ${inviteDetails.lastName}`,
          inviteDetails.email,
          inviteDetails.corporateUserType,
          companyDetails[0].name
        );
      if (!isCorporateEmailInviteSent) {
        throw new BaseError(
          "Error in sending email invite to the corporate.",
          HttpStatusCode.INTERNAL_SERVER_ERROR_500
        );
      }
    }

    // return the final invite with the company name
    return {
      finalInvite: inviteDetails,
      companyName: companyDetails[0].name,
    };
  }

  /**
   * getAllInvites
   *
   * This method is used to get all the access requests for the company.
   * @returns {Promise<PaginatedResultsWithMatchingConditionsResponse<DbCorporateUserInviteDto>>}
   */
  async getAllInvites(
    filterOptions: CorporateUserInviteLisitngFilterOptions
  ): Promise<
    PaginatedResultsWithMatchingConditionsResponse<DbCorporateUserInviteDto>
  > {
    global.logger.info("Fetching all corporate invites. [service]", {
      filePath: __filename,
      methodName: this.getAllInvites.name,
    });

    // Get the list of corporate invites from the database
    return corporateInviteDaoObj.getAllInvites(filterOptions);
  }

  async getAllInvitesWithCompanyDetails(
    filterOptions: CorporateUserInviteLisitngFilterOptions
  ): Promise<PaginatedResultsWithMatchingConditionsInternalResponse<(DbCorporateUserInviteDto & {
    companyDetails?: DbCompanyDetailDto;
  } & {
    corporateUserDetails?: DbCorporateUserDto;
  })[]>> {
    global.logger.info("Fetching all corporate invites. [service]", {
      filePath: __filename,
      methodName: this.getAllInvitesWithCompanyDetails.name,
    });

    // Get the list of corporate invites from the database
    const allInviteData: PaginatedResultsWithMatchingConditionsResponse<DbCorporateUserInviteDto> =
      await this.getAllInvites(filterOptions);

    // Extract the count, timesQueried,lastKey and other details from the response
    const { lastKey, count, timesQueried, queriedCount, ...userInviteData } =
      allInviteData;

    // Extract the array of user details from corporateDetails.
    const userInviteArray: DbCorporateUserInviteDto[] =
      Object.values(userInviteData);

    /**
     * @todo: 
     * As of now "accessRequestExpiryCheck", "attachCompanyDetails" and "injectEntityDetailsHelperObj.injectCorporateUserDetailsByCompanyIdAndEmail" are implemented some kind of sequential manner. 
     * This should be changed to parallel manner using single loop to make it more efficient.
     */

    // Check if the request is past the Expiry Date or not if yes then update the status to Expired
    let updatedInvite: (DbCorporateUserInviteDto & {
      companyDetails?: DbCompanyDetailDto;
    } & {
      corporateUserDetails?: DbCorporateUserDto;
    })[] = await this.accessRequestExpiryCheck(userInviteArray);

    if(filterOptions.includeCompanyDetails) {
      // Enrich the data with company details
      updatedInvite = await attachCompanyDetails<DbCorporateUserInviteDto>(updatedInvite);
    }

    if(filterOptions.includeRegisteredCorporateDetails) {
      updatedInvite =
        await injectEntityDetailsHelperObj.injectCorporateUserDetailsByCompanyIdAndEmail(
          updatedInvite
        );
    }

    // Return all the invites 
    const finalInviteData: PaginatedResultsWithMatchingConditionsInternalResponse<
      (DbCorporateUserInviteDto & {
        companyDetails?: DbCompanyDetailDto;
      } & {
        corporateUserDetails?: DbCorporateUserDto;
      })[]
    > = {
      data: updatedInvite,
      lastKey: lastKey,
      count: count,
      timesQueried: timesQueried,
      queriedCount: queriedCount,
    };

    return finalInviteData;
  }

  /**
   * getInviteById
   *
   * This method is used to fetch the Invite Request Invitations by ID
   *
   * @param {string} inviteId - The ID of the Invite Request to be fetched.
   *
   * @returns {Promise<QueryResponse<DbCorporateUserInviteDto>>} - The Invite Request with the specified ID.
   */
  async getInviteById(
    inviteId: string
  ): Promise<QueryResponse<DbCorporateUserInviteDto>> {
    global.logger.info("Fetching Corporate Invite By Id [service]", {
      filePath: __filename,
      methodName: this.getInviteById.name,
    });

    // Get the list of corporate invites from the database
    return corporateInviteDaoObj.getInviteById(inviteId);
  }

  /**
   * getInviteByIdWithCompanyName
   *
   * This method fetches the corporate invite details by the given invite ID and
   * enriches it with the associated company name. It checks whether the invite
   * request is past its expiry date and updates the status to expired if necessary.
   * If the invite or company details are not found, it throws an appropriate error.
   *
   * @param {string} inviteId - The ID of the invite to be fetched with company details.
   * @throws {BaseError} - Throws an error if the invite request or company details are not found.
   * @returns {Promise<Partial<DbCorporateUserInviteDto> & { companyName: string }>}
   *          - The invite details along with the company name.
   */
  async getInviteByIdWithCompanyName(inviteId: string): Promise<
    Partial<DbCorporateUserInviteDto> & {
      companyName: string;
    }
  > {
    global.logger.info("Fetching Corporate Invite By Id with Company Details", {
      filePath: __filename,
      methodName: this.getInviteByIdWithCompanyName.name,
    });

    // Get the invite details by ID and throw an error if not found
    let InviteDetailsById: QueryResponse<DbCorporateUserInviteDto> =
      await this.getInviteById(inviteId);
    if (!InviteDetailsById.count) {
      // Throw an error if the Invite Request is not found
      throw new BaseError(
        `Invite Request not found`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    const existingInviteData: DbCorporateUserInviteDto = InviteDetailsById[0];

    // Check if the request is past the Expiry Date or not if yes then update the status to Expired
    let updatedInvite: DbCorporateUserInviteDto =
      (await this.accessRequestExpiryCheck([existingInviteData]))[0];

    // Get the company details and throw an error if not found
    let companyDetails: QueryResponse<DbCompanyDetailDto> =
      await companyServiceObj.getCompanyDetailById(updatedInvite.companyId);
    if (!companyDetails.count) {
      throw new BaseError(
        "Company details not found",
        HttpStatusCode.NOT_FOUND_404
      );
    }

    // Attach the company name
    const finalInviteDetails: Partial<DbCorporateUserInviteDto> & {
      companyName: string;
    } = {
      ...updatedInvite,
      companyName: companyDetails[0].name, // Attach the company name
    };

    // Return the updated InviteDetails
    return finalInviteDetails;
  }

  async updateCommonInvite(
    companyId: string,
    email: string,
    id: string,
    corporateUserInviteDto: Partial<CorporateUserInviteCommonUpdateDto>
  ): Promise<DbCorporateUserInviteDto> {
    global.logger.info("Updating Corporate Invite Request. [service]", {
      companyId,
      email,
      id,
      methodName: this.updateCommonInvite.name,
    });

    return corporateInviteDaoObj.updateCommonInvite(
      companyId,
      email,
      id,
      corporateUserInviteDto,
    );
  }

  async updateInviteById(
    inviteId: string,
    corporateUserInviteDto: CorporateUserInviteUpdateApiDto,
    actionByUserId?: string,
    actionByCorporateUserId?: string,
  ): Promise<DbCorporateUserInviteDto> {
    global.logger.info("Updating Corporate Invite Request. [service]", {
      filePath: __filename,
      methodName: this.updateInviteById.name,
    });

    // Get the invite details by ID and throw an error if not found
    let existingInvite: QueryResponse<DbCorporateUserInviteDto> =
      await this.getInviteById(inviteId);
    if (!existingInvite.count) {
      // Throw an error if the Invite Request is not found
      throw new BaseError(
        `Invite Request Details Not Found`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    const existingInviteData: DbCorporateUserInviteDto = existingInvite[0];

    // check if the company exists and throw an error if not found
    let companyDetails: QueryResponse<DbCompanyDetailDto> =
      await companyServiceObj.getCompanyDetailById(
        existingInviteData.companyId
      );
    if (!companyDetails.count) {
      // Throw an error if the CompanyId is not found
      throw new BaseError(
        `Requested Company not found`,
        HttpStatusCode.NOT_FOUND_404
      );
    }
    const companyData: DbCompanyDetailDto = companyDetails[0];

    const { inviteStatus: requestedInviteStatus } = corporateUserInviteDto;
    const { inviteStatus: existingInviteStatus } = existingInviteData;

    let updateData: Partial<CorporateUserInviteCommonUpdateDto> = {
      ...corporateUserInviteDto,
      updatedByUserId: actionByUserId,
      updatedByCorporateUserId: actionByCorporateUserId,
    };

    if (requestedInviteStatus === CorpInviteStatusEnum.AWAITING) {
      switch (existingInviteStatus) {
        case CorpInviteStatusEnum.ACCEPTED:
          /**
           * @todo: If the business team don't want to throw error
           * and then send only the login email.
           */
          throw new BaseError(
            `User is already accepted the invite and registered with us.`,
            HttpStatusCode.BAD_REQUEST_400
          );

        case CorpInviteStatusEnum.EXPIRED:
          updateData = {
            expiresAt: dateHelperObj.getFutureDateWithTimezone(
              APP_CONSTANTS.CORPORATE_USER_INVITE_DATE_EXPIRATION,
              APP_CONSTANTS.APP_DEFAULT_TIMEZONE
            ),
          };
          break;

        case CorpInviteStatusEnum.DELETED:
          updateData = {
            isDeleted: false,
            expiresAt: dateHelperObj.getFutureDateWithTimezone(
              APP_CONSTANTS.CORPORATE_USER_INVITE_DATE_EXPIRATION,
              APP_CONSTANTS.APP_DEFAULT_TIMEZONE
            ),
          };
          break;

        default:
          break;
      }
    }

    // Update the Invite Request in the database
    const updatedInvite: DbCorporateUserInviteDto =
      await this.updateCommonInvite(
        existingInviteData.companyId,
        existingInviteData.email,
        existingInviteData.id,
        updateData
      );

    // if
    if (
      updatedInvite.inviteStatus === CorpInviteStatusEnum.AWAITING &&
      updatedInvite.isDeleted === false
    ) {
      const isCorporateEmailInviteSent: boolean =
        await this.sendCorporateEmailInvite(
          updatedInvite.id,
          `${updatedInvite.firstName} ${updatedInvite.lastName}`,
          updatedInvite.email,
          updatedInvite.corporateUserType,
          companyData.name
        );
      if (!isCorporateEmailInviteSent) {
        throw new BaseError(
          "Error in sending email invite to the corporate.",
          HttpStatusCode.INTERNAL_SERVER_ERROR_500
        );
      }
    }

    return updatedInvite;
  }

  async softDeleteInvite(
    inviteId: string,
    requestBody: CorporateUserInviteSoftDeleteApiDto,
    deletedByUserId?: string,
    deletedByCorporateUserId?: string,
  ): Promise<DbCorporateUserInviteDto> {
    global.logger.info("Deleting Corporate Invite Request. [service]", {
      filePath: __filename,
      methodName: this.softDeleteInvite.name,
    });

    // Find if the Invite Request exists
    let existingInvite: QueryResponse<DbCorporateUserInviteDto> =
      await this.getInviteById(inviteId);
    if (!existingInvite.count) {
      // Throw an error if the Invite Request is not found
      throw new BaseError(
        `Invite Request Not Found`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    const existingInviteData: DbCorporateUserInviteDto = existingInvite[0];

    if(existingInviteData.inviteStatus === CorpInviteStatusEnum.ACCEPTED){
      // You cannot delete an accepted invite request because the corporate user is already registered
      throw new BaseError(
        `You cannot delete an accepted invite request because the corporate is already registered.`,
        HttpStatusCode.FORBIDDEN_403,
      );
    }

    // Delete the Invite Request from the database
    return this.updateCommonInvite(
      existingInviteData.companyId,
      existingInviteData.email,
      existingInviteData.id,
      {
        isDeleted: true,
        deletedByUserId: deletedByUserId,
        deletedByCorporateUserId: deletedByCorporateUserId,
        reasonForRevoke: requestBody.reasonForRevokingInvite,
        inviteStatus: CorpInviteStatusEnum.DELETED,
      }
    );
  }

  /**
   * accessRequestExpiryCheck
   *
   * This method is used to check if the Invite Requests are expired or not and update the status to Expired if they are.
   *
   * @param {DbCorporateUserInviteDto[]} invitesDetails - The array of Invite Requests to be checked.
   * @returns {Promise<DbCorporateUserInviteDto[]>} - The updated array of Invite Requests.
   */
  async accessRequestExpiryCheck(
    invitesDetails: DbCorporateUserInviteDto[]
  ): Promise<DbCorporateUserInviteDto[]> {
    const updatePromises: Promise<DbCorporateUserInviteDto>[] =
      invitesDetails.map(async (invite: DbCorporateUserInviteDto) => {
        // If the invite status is already deleted or expired or it has already been accepted, do not validate it for expiry and update it
        if (
          invite.isDeleted ||
          invite.inviteStatus === CorpInviteStatusEnum.EXPIRED ||
          invite.inviteStatus === CorpInviteStatusEnum.DELETED ||
          invite.inviteStatus === CorpInviteStatusEnum.ACCEPTED
        ) {
          return invite;
        }

        // Convert expiresAt to a Luxon DateTime object
        const expirationDate: DateTime<true> | DateTime<false> =
          DateTime.fromJSDate(invite.expiresAt);

        // If the current date is greater than the expiration date, then that means the invite has expired, so update the invite status to `EXPIRED`
        if (
          DateTime.now().setZone(APP_CONSTANTS.APP_DEFAULT_TIMEZONE) >
          expirationDate
        ) {
          global.logger.debug(`Updating expired Invite Request`, {
            filePath: __filename,
            methodName: this.accessRequestExpiryCheck.name,
            companyId: invite.companyId,
            inviteId: invite.id,
            email: invite.email,
          });

          // Update the Invite Request in the database
          return await corporateInviteDaoObj.updateCommonInvite(
            invite.companyId,
            invite.email,
            invite.id,
            {
              inviteStatus: CorpInviteStatusEnum.EXPIRED,
            },
          );
        } else {
          return invite;
        }
      });

    // Wait for all update operations to complete
    const updatedInvites: DbCorporateUserInviteDto[] = await Promise.all(
      updatePromises
    );

    // Filter out any undefined values (in case some requests were not updated)
    return updatedInvites.filter((invite) => invite !== undefined);
  }

  /**
   * getAllCorporateUserInvitesWithoutPagination
   *
   * This method fetches all the corporate user Invites without pagination. This method is used internally by the service.
   *
   * @returns {Promise<DbCorporateUserInviteDto[]>} - A Promise that resolves to an array of all the corporate user Invites in the database.
   */
  async getAllCorporateUserInvitesWithoutPagination(): Promise<DbCorporateUserInviteDto[]> {
    global.logger.info(
      `Processing request to get all Corporate User Invites Without Pagination. [SERVICE]`,
      {
        filePath: __filename,
        methodName: this.getAllCorporateUserInvitesWithoutPagination.name,
      }
    );

    let lastKeyInternal: ObjectType | undefined = undefined;
    let pageSizeInternal = 50;
    let allCorporateUserInvitesWithoutPagination: DbCorporateUserInviteDto[] = [];

    // Continue fetching the data until all the data is fetched
    do {
      const filterOptions: CorporateUserInviteLisitngFilterOptions = {
        lastKey: lastKeyInternal,
        pageSize: pageSizeInternal,
      };

      // Get a batch of corporate user invites by filter options
      const corporateUserInvitesResponse: PaginatedResultsWithMatchingConditionsResponse<DbCorporateUserInviteDto> =
        await corporateInviteDaoObj.getAllInvites(filterOptions);

      const {
        lastKey,
        count,
        timesQueried,
        queriedCount,
        ...corporateUserInvitesData
      } = corporateUserInvitesResponse;

      // Convert the data to an array
      const corporateUserInvitesArray: DbCorporateUserInviteDto[] =
        Object.values(corporateUserInvitesData);

      // Add all the corporate users to the array
      allCorporateUserInvitesWithoutPagination =
        allCorporateUserInvitesWithoutPagination.concat(
          corporateUserInvitesArray
        );

      lastKeyInternal = lastKey ?? undefined;
    } while (lastKeyInternal);

    return allCorporateUserInvitesWithoutPagination;
  }
}

// Create a single instance of this class
const corporateUserInviteServiceObj = new CorporateIserInviteService();

// Export the instance and the class
export { CorporateIserInviteService, corporateUserInviteServiceObj };