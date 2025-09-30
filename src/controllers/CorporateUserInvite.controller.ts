// Import npm packages
import { Request, Response, NextFunction } from "express";

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
    CorporateUserInviteSoftDeleteApiDto,
    CorporateUserInviteUpdateApiDto,
} from "../dtos/CorporateUserInvite.dto";
import { PaginatedResultsWithMatchingConditionsInternalResponse, RecordListingResponseDTO } from "../dtos/Common.dto";

// Import Enums
import { CorpInviteStatusEnum } from "../enums/CorporateUserInvite.enum";

// Import Helpers
import { RequestHelper } from "../helpers/request.helper";
import { paginationResponseHelperObj } from "../helpers/pagination-response.helper";
import { getActionByUserId } from "../helpers/user.helper";
import { dateHelperObj } from "../helpers/date.helper";

// Import models
import { DbCorporateUserInviteDto } from "../db/models/CorporateUserInvite.model";
import { DbCompanyDetailDto } from "../db/models/CompanyDetail.model";
import { DbCorporateUserDto } from "../db/models/CorporateUser.model";

// Import schemas
import {
    CorporateInviteListingFilterOptionValidation,
    CorporateUserInviteCreateApiDtoValidation,
    corporateUserInviteSoftDeleteApiDtoValidation,
    CorporateUserInviteUpdateApiDtoValidation
} from "../schemas/CorporateUserInvite.schema";

// Import Service
import { corporateUserInviteServiceObj } from "../services/CorporateUserInvite.service";

// Import Utils
import { BaseError, RequestValidationError } from "../utils/errors.util";
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

            const {actionByUserId, actionByCorporateUserId}= getActionByUserId();

            /**
             * Whenever worko-admin creates a invite then few more fields are required in the request body
             */
            if(actionByUserId) {
                const {pricingPlan, cvDuplicacyAccess} = requestBody;
                if(!pricingPlan || cvDuplicacyAccess === undefined) {
                    global.logger.error(`Missing required fields in the request body. [controller]`, {
                        pricingPlan,
                        cvDuplicacyAccess,
                    })
                    throw new BaseError("Missing required fields in the request body", HttpStatusCode.BAD_REQUEST_400);
                }
            } else if(actionByCorporateUserId) {
                /**
                 * Whenever corporate admin creates a invite then few fields are not required in the request body
                 */
                const {pricingPlan, cvDuplicacyAccess} = requestBody;
                if(pricingPlan || cvDuplicacyAccess !== undefined) {
                    global.logger.error(`Invalid fields in the request body. [controller]`, {
                        pricingPlan,
                        cvDuplicacyAccess,
                    })
                    throw new BaseError("Invalid fields in the request body", HttpStatusCode.BAD_REQUEST_400);
                }
            } else {
                global.logger.error(`Invalid user type. [controller]`, {
                    actionByUserId,
                    actionByCorporateUserId,
                })
                throw new BaseError("Invalid user type", HttpStatusCode.BAD_REQUEST_400);
            }

            const corporateUserInviteCreateDto: CorporateUserInviteCreateDto = {
              ...corporateUserInviteCreateApiDto,
              inviteStatus: CorpInviteStatusEnum.AWAITING,
              createdByUserId: actionByUserId,
              createdByCorporateUserId: actionByCorporateUserId,
              expiresAt: dateHelperObj.getFutureDateWithTimezone(
                APP_CONSTANTS.CORPORATE_USER_INVITE_DATE_EXPIRATION,
                APP_CONSTANTS.APP_DEFAULT_TIMEZONE,
              )
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
            const corpUserInvitesList: PaginatedResultsWithMatchingConditionsInternalResponse<
              (DbCorporateUserInviteDto & {
                companyDetails?: DbCompanyDetailDto;
              } & {
                corporateUserDetails?: DbCorporateUserDto;
              })[]
            > =
              await corporateUserInviteServiceObj.getAllInvitesWithCompanyDetails(
                corpInviteFilterOptions
              );

            // Extract the count, timesQueried,lastKey and other details from the response
            const { lastKey, count, timesQueried, queriedCount, data: corporateUserInviteData } = corpUserInvitesList;

            // Generate the pagination response
            const corporateInviteResponse: RecordListingResponseDTO<
              (DbCorporateUserInviteDto & {
                companyDetails?: DbCompanyDetailDto;
              } & {
                corporateUserDetails?: DbCorporateUserDto;
              })[]
            > =
              paginationResponseHelperObj.customizedPaginationRecordListingResponse<
                (DbCorporateUserInviteDto & {
                  companyDetails?: DbCompanyDetailDto;
                } & {
                  corporateUserDetails?: DbCorporateUserDto;
                })[],
                CorporateUserInviteLisitngFilterOptions
              >(
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
     */
    updateInviteById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            global.logger.info("Processing request to update Corporate Invite by ID. [controller]", {
                methodName: this.updateInviteById.name,
            });

            // Get the ID from the request
            const inviteId: string = req.params.id;

            // Get the request body
            const requestBody: CorporateUserInviteUpdateApiDto = req.body;

            // validate the request body and Throw an Error if Invalid
            const { error, value: validatedRequestBody } = CorporateUserInviteUpdateApiDtoValidation.validate(requestBody, { abortEarly: false });
            if (error) {
                throw new RequestValidationError(error);
            }

            const {actionByUserId, actionByCorporateUserId} = getActionByUserId();

            // Call the service to update the corporate invite by its ID
            const updatedInviteDetails: DbCorporateUserInviteDto =
              await corporateUserInviteServiceObj.updateInviteById(
                inviteId,
                validatedRequestBody,
                actionByUserId,
                actionByCorporateUserId,
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
          // Get the request body
          const requestBody: CorporateUserInviteSoftDeleteApiDto = req.body;

          // validate the request body and Throw an Error if Invalid
          const { error } = corporateUserInviteSoftDeleteApiDtoValidation.validate(
            requestBody,
            { abortEarly: false }
          );
          if (error) {
            throw new RequestValidationError(error);
          }

          // Get the ID from the request and throw an error if it is not provided
          const inviteId: string = req.params.id;

          const {actionByUserId, actionByCorporateUserId} = getActionByUserId();

          // Call the service to delete the corporate invite by its ID
          await corporateUserInviteServiceObj.softDeleteInvite(
            inviteId,
            requestBody,
            actionByUserId,
            actionByCorporateUserId,
          );

          /**
           * @todo In this soft delete api we are not directly removing the invite from the DB,
           * we are just updating "isDeleted" field to true and invite status as "DELETED",
           * So this response with status code NO_CONTENT_204 may not be appropriate and we are 
           * not updating the status code because frontend is already integrated this api.
           */
          return res.status(HttpStatusCode.NO_CONTENT_204).send();
        } catch (error) {
            next(error);
        }
    }
}

export default CorporateUserInviteController;
