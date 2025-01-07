// Import npm packages
import { Request, Response, NextFunction } from "express";

// Import ulidx
import { uuidToULID } from "ulidx";

// Import luxon for date formatting
import { DateTime } from "luxon";

// Import Constants
import APP_CONSTANTS from "../configs/constants.config";

// Import Dto
import {
    CorporateUserInviteCreateApiDto,
    CorporateUserInviteCreateDto,
    CorporateUserInviteLisitngFilterOptions,
    CorporateUserInviteLisitngFilterOptionsDTO,
    CorporateUserInviteUpdateApiDto,
    CorporateUserInviteUpdateDto,
} from "../dtos/CorporateUserInvite.dto";
import { PaginatedResultsWithMatchingConditionsInternalResponse, RecordListingResponseDTO } from "../dtos/Common.dto";

// Import Enums
import { CorpInviteStatusEnum } from "../enums/CorporateUserInvite.enum";

// Import Helpers
import { RequestHelper } from "../helpers/request.helper";
import { paginationResponseHelperObj } from "../helpers/pagination-response.helper";

// Import models
import { DbCorporateUserInviteDto } from "../db/models/CorporateUserInvite.model";
import { DbCompanyDetailDto } from "../db/models/CompanyDetail.model";

// Import schemas
import {
    CorporateInviteListingFilterOptionValidation,
    CorporateUserInviteCreateApiDtoValidation,
    CorporateUserInviteUpdateApiDtoValidation
} from "../schemas/CorporateUserInvite.schema";

// Import Service
import { corporateUserInviteServiceObj } from "../services/CorporateUserInvite.service";

// Import Utils
import { RequestValidationError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 * CorporateInviteController
 * 
 * This is the controller class responsible for managing the corporate invite requests.
 */
class CorporateUserInviteController {
    /**
     * createInvite
     * 
     * This method is used to create a new Invite request for the user in the database.
     * 
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     * @param {NextFunction} next - The next function.
     * 
     * @see {CorporateUserInviteCreateApiDto}  - The DTO used to validate the request body.
     * @see {CorporateUserInviteCreateDto}  - The DTO used to create a new access request for the company.
     * @see {CorpInviteStatusEnum}  - The status of the corporate invite.
     * @see {CorporateUserInviteCreateApiDtoValidation}  - This is a JOI schema used to validate the request body.
     */
    createInvite = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Log the info details
            global.logger.info("Processing request for Corporate invite generations. [controller]", {
                filePath: __filename,
                methodName: this.createInvite.name,
                requestBody: req.body
            });

            // Get the request body
            const requestBody: CorporateUserInviteCreateApiDto = req.body;

            // Validate the Request Body and Throw an Error if Invalid
            const { error, value: corporateUserInviteCreateApiDto } = CorporateUserInviteCreateApiDtoValidation.validate(requestBody, { abortEarly: false });
            if (error) {
                throw new RequestValidationError(error);
            }

            // Extract the cognito User Id and cognito User Groups
            const cognitoUserId: string = global.requestLocalContext.userId;
            const cognitoUserGroups: string[] = global.requestLocalContext.cognitoUserGroups;

            // Initialize the variables
            let createdByUserId: string | undefined;
            let createdByCorporateUserId: string | undefined;

            // If the user is a corporate user then set the `createdByCorporateUserId` else set the `createdByUserId`
            if (
                cognitoUserGroups.includes(
                    APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.CORPORATE_ADMIN
                ) || 
                cognitoUserGroups.includes(
                    APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.CORPORATE_RECRUITER
                )
            ) {
                createdByCorporateUserId = uuidToULID(cognitoUserId);
                global.logger.info(`User is a 'corporate recruiter/admin' with ID: ${createdByCorporateUserId}. [controller]`)
            } else {
                createdByUserId = cognitoUserId;
                global.logger.info(`User is a 'worko admin' with ID: ${createdByUserId}. [controller]`)
            }

            // Preapre the response object
            const corporateUserInviteCreateDto: CorporateUserInviteCreateDto = {
              ...corporateUserInviteCreateApiDto,
              inviteStatus: CorpInviteStatusEnum.AWAITING,
              createdByUserId: createdByUserId,
              createdByCorporateUserId: createdByCorporateUserId,
              expiresAt: DateTime.now()
                .plus({
                  days: APP_CONSTANTS.CORPORATE_USER_INVITE_DATE_EXPIRATION,
                })
                .setZone(APP_CONSTANTS.APP_DEFAULT_TIMEZONE)
                .toMillis(),
            };

            // Pass the validated request body to the service
            const inviteDetails: { 
                finalInvite: DbCorporateUserInviteDto; 
                companyName: string
            } = await corporateUserInviteServiceObj.createInvite(corporateUserInviteCreateDto)

            // Send the response
            return res.status(HttpStatusCode.OK_200).json({
                ...inviteDetails.finalInvite,
                companyName: inviteDetails.companyName
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * getAllInvite
     * 
     * This method is used to get all the corporate invite requests from the database.
     * 
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     * @param {NextFunction} next - The next function.
     * 
     * @see {CorporateUserInviteLisitngFilterOptions}  - The DTO used to filter the corporate invite requests.
     * @see {CorporateUserInviteLisitngFilterOptionsDTO}  - The DTO used to validate the request query params.
     * @see {CorporateUserInviteFilterOptionsValidation}  - This is a JOI schema used to validate the query params.
     * @see {RecordListingResponseDTO}  - The DTO used to return the response with pagination details.
     * @see {RequestHelper}  - The helper class used to parse the query params.
     */
    getAllInvite = async (req: Request, res: Response, next: NextFunction) => {
        try {
            global.logger.info("Processing request to get all Corporate invite requests. [controller]", {
                filePath: __filename,
                methodName: this.getAllInvite.name,
            });

            // Parse the query params using the RequestHelper
            const corpInviteListingFilterRequest: CorporateUserInviteLisitngFilterOptions = RequestHelper.parseFilterOptions<
                CorporateUserInviteLisitngFilterOptionsDTO,
                CorporateUserInviteLisitngFilterOptions>(req.query as unknown as CorporateUserInviteLisitngFilterOptionsDTO);

            // Validate the request body and Throw an Error if Invalid
            let { error, value: corpInviteFilterOptions } = CorporateInviteListingFilterOptionValidation()
                .validate(
                    corpInviteListingFilterRequest,
                    { abortEarly: false }
                );
            if (error) {
                throw new RequestValidationError(error);
            }

            // Call the service to fetch all jobs [Service Call]
            const corpUserInvitesList: PaginatedResultsWithMatchingConditionsInternalResponse<(DbCorporateUserInviteDto & {
                companyDetails: DbCompanyDetailDto | undefined;
            })[]> = await corporateUserInviteServiceObj.getAllInvitesWithCompanyDetails(corpInviteFilterOptions);

            // Extract the count, timesQueried,lastKey and other details from the response
            const { lastKey, count, timesQueried, queriedCount, data: corporateUserInviteData } = corpUserInvitesList;

            // Generate the pagination response
            const corporateInviteResponse: RecordListingResponseDTO<
            (DbCorporateUserInviteDto & { companyDetails: DbCompanyDetailDto | undefined })[]> =
            paginationResponseHelperObj.customizedPaginationRecordListingResponse<(DbCorporateUserInviteDto & { companyDetails: DbCompanyDetailDto | undefined })[],CorporateUserInviteLisitngFilterOptions>(
                corporateUserInviteData,
                corpInviteListingFilterRequest,
                count,
                timesQueried,
                lastKey,
                queriedCount
            );  

            // Send the response
            return res.status(HttpStatusCode.OK_200).json(corporateInviteResponse);
        }
        catch (error) {
            next(error);
        }
    }

    /**
     * getInviteById
     * 
     * This method is used to get the corporate invite request by its ID.
     * 
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     * @param {NextFunction} next - The next function.
     */
    getInviteById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            global.logger.info("Processing request to get Corporate Invite by ID. [controller]", {
                filePath: __filename,
                methodName: this.getInviteById.name,
            });

            // Get the ID from the request
            const inviteId: string = req.params.id;

            // Call the service to get the corporate invite by its ID
            const accessRequestDetails: Partial<DbCorporateUserInviteDto> & {
              companyName: string;
            } =
              await corporateUserInviteServiceObj.getInviteByIdWithCompanyName(
                inviteId
              );

            // Send the response
            return res.status(HttpStatusCode.OK_200).json(accessRequestDetails);
        } catch (error) {
            next(error);
        }
    }

    /**
     * updateInviteById
     * 
     * This method is used to update the corporate invite request by its ID.
     * 
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     * @param {NextFunction} next - The next function.
     * 
     * @see {CorporateUserInviteUpdateApiDto}  - The DTO used to validate the request body.
     */
    updateInviteById = async (req: Request, res: Response, next: NextFunction) => {
        global.logger.info("Processing request to update Corporate Invite by ID. [controller]", {
            filePath: __filename,
            methodName: this.updateInviteById.name,
        });

        try {
            // Get the user ID from the request
            const cognitoUserId: string = global.requestLocalContext.userId;

            // Get the user groups from the request
            const cognitoUserGroups: string[] = global.requestLocalContext.cognitoUserGroups;

            // Get the ID from the request
            const inviteId: string = req.params.id;

            // Get the request body
            const requestBody: CorporateUserInviteUpdateApiDto = req.body;

            // validate the request body and Throw an Error if Invalid
            const { error, value: corporateUserInviteValidatedApiDto } = CorporateUserInviteUpdateApiDtoValidation.validate(requestBody, { abortEarly: false });
            if (error) {
                throw new RequestValidationError(error);
            }

            // Initialize the variables
            let updatedByUserId: string | undefined;
            let updatedByCorporateUserId: string | undefined;

            // If the user is a corporate user then set the `updatedByCorporateUserId` else set the `updatedByUserId`
            if (
                cognitoUserGroups.includes(
                    APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.CORPORATE_ADMIN
                ) || 
                cognitoUserGroups.includes(
                    APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.CORPORATE_RECRUITER
                )
            ) {
                updatedByCorporateUserId = uuidToULID(cognitoUserId);
                global.logger.info(`User is a 'corporate recruiter/admin' with ID: ${updatedByCorporateUserId}. [controller]`)
            } else {
                updatedByUserId = cognitoUserId;
                global.logger.info(`User is a 'worko admin' with ID: ${updatedByUserId}. [controller]`)
            }

            // Prepare the corporate invite update dto
            const corporateUserInviteValidatedDto: Partial<CorporateUserInviteUpdateDto> = {
                ...requestBody,
                updatedByUserId: updatedByUserId,
                updatedByCorporateUserId: updatedByCorporateUserId,
            };

            // Call the service to update the corporate invite by its ID
            const updatedInviteDetails: DbCorporateUserInviteDto =
              await corporateUserInviteServiceObj.updateInviteById(
                inviteId,
                corporateUserInviteValidatedDto
              );

            // Send the response with updated Invite Details
            return res.status(HttpStatusCode.OK_200).json(updatedInviteDetails);
        } catch (error) {
            next(error);
        }
    }

    /**
     * softDeleteInvite
     * 
     * This method is used to delete the corporate invite request by its ID.
     * 
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     * @param {NextFunction} next - The next function.
     */
    softDeleteInvite = async (req: Request, res: Response, next: NextFunction) => {
        global.logger.info("Processing request to delete Corporate Invite by ID. [controller]", {
            filePath: __filename,
            methodName: this.softDeleteInvite.name,
        });

        try {
          // Get the user ID from the request
          const cognitoUserId = global.requestLocalContext.userId;

          // Get the user groups from the request
          const cognitoUserGroups = global.requestLocalContext.cognitoUserGroups;

          // Get the ID from the request and throw an error if it is not provided
          const inviteId: string = req.params.id;

          // Initialize the variables
          let deletedByUserId: string | undefined;
          let deletedByCorporateUserId: string | undefined;

          // If the user is a corporate user then set the `updatedByCorporateUserId` else set the `updatedByUserId`
          if (
            cognitoUserGroups.includes(
              APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.CORPORATE_ADMIN
            ) ||
            cognitoUserGroups.includes(
              APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.CORPORATE_RECRUITER
            )
          ) {
            deletedByCorporateUserId = uuidToULID(cognitoUserId);
            global.logger.info(
              `User is a 'corporate recruiter/admin' with ID: ${deletedByCorporateUserId}. [controller]`
            );
          } else {
            deletedByUserId = cognitoUserId;
            global.logger.info(
              `User is a 'worko admin' with ID: ${deletedByUserId}. [controller]`
            );
          }

          // Call the service to delete the corporate invite by its ID
          await corporateUserInviteServiceObj.softDeleteInvite(
            inviteId,
            deletedByUserId,
            deletedByCorporateUserId
          );

          // Send the response
          return res.status(HttpStatusCode.NO_CONTENT_204).send();
        } catch (error) {
            next(error);
        }
    }
}

export default CorporateUserInviteController;
