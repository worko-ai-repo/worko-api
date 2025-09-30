// import the npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import { UserReferralRequestCreateApiDTO ,UserReferralRequestCreateDTO } from "../dtos/User.dto";
import { EmpReferralListingFilterOptions, EmpReferralListingFilterRequestDTO, ReferralStatusListingFilterOptions, ReferralStatusListingFilterRequestDTO, UserReferralStatusChangeByCandDTO } from "../dtos/UserReferral.dto";
import { PaginatedResultsWithMatchingConditionsResponse, RecordListingResponseDTO } from "../dtos/Common.dto";

// import daos
import userReferralDao from "../daos/UserReferral.dao";

// Load the Enums
import { ReferralStatus } from "../enums/UserReferral.enum";
import { MatchingScoreEntityEnum } from "../enums/Common.enum";

// Load helpers
import { RequestHelper } from "../helpers/request.helper";
import { paginationResponseHelperObj } from "../helpers/pagination-response.helper";
import { injectEntityDetailsHelperObj } from "../helpers/injectEntityDetails.helper";

// import models
import { DbCompanyDetailDto } from "../db/models/CompanyDetail.model";
import { DbUserReferralDto } from "../db/models/UserReferral.model";
import { DbUserDetailDto } from "../db/models/UserDetail.model";

// Load the local schema
import {
  empReferralFilterDtoValidation,
  UserReferralEmployeeStatusValidation,
  UserReferralRequestDTOValidation,
  userReferralStatusFilterDtoValidation,
  UserReferralStatusValidation,
  withdrawnReferralPayloadValidation,
} from "../schemas/UserReferral.schema";
import { validateEmailField } from "../schemas/User.schema";

// Load the shared service
import UserReferralService from "../services/UserReferral.service";
import InvokeLambdaService from "../services/InvokeLambda.service";
import CompanyService from "../services/Company.service";
import UserSubscriptionService from "../services/UserSubscription.service";
import {userReferralEmpServiceObj} from "../services/UserReferralEmp.service";

//Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

/**
 * UserReferralController
 *
 * Class to perform related/relevent action/activities related to the "user referral" table
 */
class UserReferralController {
  /**
   * getReferralsForCand
   *
   * Retrieves the user based on the provided filter options
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  getReferralsForCand = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action for debugging purposes
      logger.info("Get user Referral by email [controller]");

      // Parse filter options from the request query parameters
      const referralStatusRecordListingFilterRequest: ReferralStatusListingFilterOptions =
        RequestHelper.parseFilterOptions<
          ReferralStatusListingFilterRequestDTO,
          ReferralStatusListingFilterOptions
        >(req.query as unknown as ReferralStatusListingFilterRequestDTO);

      // Validate the filter options and throw an error if any of them is invalid
      let {
        error: referralStatusError,
        value: userReferralStatusFilterOptions,
      } = userReferralStatusFilterDtoValidation.validate(
        referralStatusRecordListingFilterRequest,
        {
          abortEarly: false,
        }
      );
      if (referralStatusError) {
        throw new RequestValidationError(referralStatusError);
      }

      // Validate the email from the request and throw an error if invalid
      const { error, value: candEmail } = validateEmailField(
        req.params.userEmail
      );
      if (error) {
        throw new RequestValidationError(error);
      }

      // Get the candidate referrals for the given "candEmail" and "referralStatus"
      let candidateReferrals: PaginatedResultsWithMatchingConditionsResponse<DbUserReferralDto> = await UserReferralService.getReferralsForCand(
        candEmail,
        userReferralStatusFilterOptions
      );

      // Extract the count, timesQueried, lastKey, and additional fields from the candidateReferrals
      const {
        count,
        timesQueried,
        lastKey,
        queriedCount,
        ...candReferralDetails
      } = candidateReferrals;

      // if no referral found then just return empty response
      if (!count) {
        // Generate the pagination response
        const referralsResponse: RecordListingResponseDTO<DbUserReferralDto[]> =
          paginationResponseHelperObj.customizedPaginationRecordListingResponse<DbUserReferralDto[],ReferralStatusListingFilterOptions>(
            [],
            referralStatusRecordListingFilterRequest,
            count,
            timesQueried,
            lastKey,
            queriedCount
          );
        return res.status(HttpStatusCode.OK_200).json(referralsResponse);
      }

      /**
       * Note: The below code should be implemented in `UserReferral.service.ts`.
       *
       * - **Separation of Concerns**: The `service` layer is responsible for handling all TypeScript logic and business operations.
       * - **Controller Responsibilities**: The `controller` layer should manage only request handling, request payload validation handling, response handling
       * - **DAO Responsibilities**: The `dao` layer should focus exclusively on database interactions.
       *
       * While the existing code can remain unchanged, it's important to follow these guidelines for any new features going forward.
       */

      // Example Output If `candReferralDetails` type is `object`: [UserReferral {...},UserReferral {...},UserReferral {...}, ......]
      const candReferrals: DbUserReferralDto[] = typeof candReferralDetails === "object"
          ? Object.values(candReferralDetails)
          : candReferralDetails;

      const candReferralsWithEmpDetails: (DbUserReferralDto & {
        userDetails?: DbUserDetailDto;
        employeeDetails?: DbUserDetailDto;
      })[] =
        await injectEntityDetailsHelperObj.injectEntityWithUserDetails<DbUserReferralDto>(
          candReferrals,
          false,
          true
        );

      // Get unique company IDs from the retrieved referrals
      const companyIDs: string[] = candReferralsWithEmpDetails.map(
        (
          referral: DbUserReferralDto & {
            userDetails?: DbUserDetailDto;
            employeeDetails?: DbUserDetailDto;
          }
        ) => referral.companyId
      );
      const uniqueCompanyIDs: string[] = Array.from(new Set(companyIDs));

      // Fetch company details for each unique company ID
      const companyDetailsResults = await CompanyService.getCompanyDetailsByIds(
        uniqueCompanyIDs
      );

      // Loop over the retrieved referrals and include the company name in the response
      /*
      # Example Output for `finalUserReferral`:
      [
          {
            jdExtracted: '"\\"\\\\\\"3+ years of non-internship professional software development experience\\\\\\"\\""',
            userSubscriptionId: '01J8FMCH621R3Y2MR21NQJJXQY',
            matchingScore: 0,
            createdAt: 2024-09-23T14:53:57.309Z,
            companyId: '01J7ZVK6WX6KTPJBH4HDAJ66XM',
            GSI1PK: 'REF#',
            GSI1SK: 'ID#01J8FNZZ5PMSF6P6QCZGVRFN29',
            SK: 'REF#ID#01J8FNZZ5PMSF6P6QCZGVRFN29',
            jobUrl: 'https://g.co/kgs/N9ZT24G',
            PK: 'USR#EML#kaan@gmail.com',
            id: '01J8FNZZ5PMSF6P6QCZGVRFN29',
            status: 'AWAITING',
            updatedAt: 2024-10-21T06:26:00.276Z,
            companyName: 'GOOGLE'
          }, 
          {..},{...},....
      ]
      */
      const finalUserReferral = candReferralsWithEmpDetails.map(
        (
          referral: DbUserReferralDto & {
            userDetails?: DbUserDetailDto;
            employeeDetails?: DbUserDetailDto;
          }
        ) => {
          // Find the company details corresponding to the current referral
          const companyDetails = companyDetailsResults.find(
            (companyDetail: DbCompanyDetailDto) =>
              companyDetail.id === referral.companyId
          );

          // Return the company name along with referral details
          return {
            ...referral,
            companyName: companyDetails?.name ?? null,
          };
        }
      );

      // Generate the pagination response
      const referralsResponse: RecordListingResponseDTO<any[]> =
        paginationResponseHelperObj.customizedPaginationRecordListingResponse<any[],ReferralStatusListingFilterOptions>(
          finalUserReferral,
          userReferralStatusFilterOptions,
          count,
          timesQueried,
          lastKey,
          queriedCount
        );

      // Send a successful response with user data
      res.status(HttpStatusCode.OK_200).json(referralsResponse);
    } catch (error: any) {
      // Handle errors
      // Check if the error is due to user not found
      if (error.message === "User not found") {
        // If user not found, send a 404 response with an informative error message
        res
          .status(HttpStatusCode.NOT_FOUND_404)
          .json({ error: "User not found. Please check the email." });
      } else {
        // If it's another type of error, pass it to the next error handler
        next(error);
      }
    }
  };

  /**
   * getReferralsForEmp
   *
   * Retrieves the referrals based on the provided query parameters
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  getReferralsForEmp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      logger.info("Fetching referrals for employee by company ID and status");

      // Parse filter options from the request query parameters
      const empReferralRecordListingFilterRequest: EmpReferralListingFilterOptions =
        RequestHelper.parseFilterOptions<
          EmpReferralListingFilterRequestDTO,
          EmpReferralListingFilterOptions
        >(req.query as unknown as EmpReferralListingFilterRequestDTO);

      // Validate the filter options and throw an error if any of them is invalid
      let { error: empReferralError, value: empReferralListingFilterOptions } =
        empReferralFilterDtoValidation.validate(
          empReferralRecordListingFilterRequest,
          {
            abortEarly: false,
          }
        );
      if (empReferralError) {
        throw new RequestValidationError(empReferralError);
      }

      // Validate the email from the request and throw an error if invalid
      const { error, value: empPrimaryEmail } = validateEmailField(
        req.params.emailId
      );
      if (error) {
        throw new RequestValidationError(error);
      }

      // Fetch employee referrals based on the filter options
      const empReferralDetails =
        await userReferralEmpServiceObj.getEmployeeReferrals(
          empPrimaryEmail,
          empReferralListingFilterOptions
        );
      
      // Destructure the retrieved employee referrals
      const { lastKey, count, timesQueried, queriedCount, data: empReferrals } = empReferralDetails;

      if (empReferrals.length === 0) {
        const emptyResponse = paginationResponseHelperObj.customizedPaginationRecordListingResponse<any[], EmpReferralListingFilterOptions>([], empReferralListingFilterOptions, count, timesQueried, lastKey, queriedCount);

        res.status(HttpStatusCode.OK_200).json(emptyResponse);
      }

      const userReferralWithCandidateDetails: (DbUserReferralDto & {
        userDetails?: DbUserDetailDto;
        employeeDetails?: DbUserDetailDto;
      })[] =
        await injectEntityDetailsHelperObj.injectEntityWithUserDetails<DbUserReferralDto>(
          empReferrals,
          true,
          false,
        );

      // Get unique company IDs from the retrieved referrals
      const uniqueCompanyIDs: string[] = Array.from(
        new Set(
          userReferralWithCandidateDetails.map(
            (
              referral: DbUserReferralDto & {
                userDetails?: DbUserDetailDto;
                employeeDetails?: DbUserDetailDto;
              }
            ) => referral.companyId
          )
        )
      );
        
      // Fetch company details for each unique company ID
      const companyDetailsResults = await CompanyService.getCompanyDetailsByIds(uniqueCompanyIDs);
  
      // Loop over the retrieved referrals and include the company name in the response
      const finalUserReferrals = userReferralWithCandidateDetails.map(
        (
          referral: DbUserReferralDto & {
            userDetails?: DbUserDetailDto;
            employeeDetails?: DbUserDetailDto;
          }
        ) => {
          // Find the company details corresponding to the current referral
          const companyDetails = companyDetailsResults.find(
            (companyDetail) => companyDetail.id === referral.companyId
          );

          // Return the referral along with the company name
          return {
            ...referral,
            companyName: companyDetails?.name ?? null,
          };
        }
      );

      // Generate the pagination response
      const empReferralsResponse: RecordListingResponseDTO<any[]> =
        paginationResponseHelperObj.customizedPaginationRecordListingResponse<any[],ReferralStatusListingFilterOptions>(
          finalUserReferrals,
          empReferralListingFilterOptions,
          count,
          timesQueried,
          lastKey,
          queriedCount
        );

      // Send a successful response with combined user data and referral details
      res.status(HttpStatusCode.OK_200).json(empReferralsResponse);
    } catch (error: any) {
      // Handle errors
      // If it's another type of error, pass it to the next error handler
      next(error);
    }
  };
  

  /**
   *
   * getMatchingScore
   *
   * get the referral request matching score
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  getReferralScoreForCand = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id, referralId } = req.params;
      const matchingScore = await UserReferralService.getReferralScoreForCand(
        id,
        referralId
      );
      res.status(HttpStatusCode.OK_200).json(matchingScore[0]);
    } catch (error) {
      console.log("getMatchingScore-> Error: ", error);
      next(error);
    }
  };

  /**
   * createReferralByCand
   *
   * Creates a new referral request initiated by a candidate user. This function performs the following steps:
   * 1. Validates the user's email from the request parameters.
   * 2. Validates the referral request data from the request body.
   * 3. Checks if the user has an active subscription.
   * 4. (Commented out) Checks if the user is eligible to create a new referral based on their subscription status.
   * 5. Creates the referral request in the database, associating it with the user's active subscription.
   * 6. Triggers an asynchronous lambda function to calculate matching scores for this referral.
   *
   * The function also includes special error handling for cases where the user doesn't exist.
   *
   * @param {Request} req - Express request object:
   * @param {Response} res - Express response object used to send back the API response.
   * @param {NextFunction} next - Express next function for error handling.
   * @throws {RequestValidationError} If the email or referral data fails validation.
   * @throws {BaseError} (Commented out) If the user has reached their referral limit.
   * @throws {Error} Any other errors that occur during the process.
   */
  createReferralByCand = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Create referral [controller]");

      // Extract and validate the user's email from request parameters
      const email = req.params.userEmail;
      const { error: emailError, value: emailId } = validateEmailField(email);

      // Extract and validate the referral request data from request body
      const referralRequestBody: UserReferralRequestCreateApiDTO = req.body;
      const { error } = UserReferralRequestDTOValidation.validate(
        referralRequestBody,
        { abortEarly: false }
      );

      // Handle validation errors
      if (emailError) {
        throw new RequestValidationError(emailError);
      } else if (error) {
        throw new RequestValidationError(error);
      }

      // Fetch the user's active subscription ID
      const activeSubscriptionId =
        await UserSubscriptionService.getActiveSubscriptionForUser(emailId);

      if (!activeSubscriptionId[0]) {
        // If no active subscription found, return a conflict status
        res
          .status(HttpStatusCode.CONFLICT_409)
          .json("User doesn't have any active Subscription!");
      } else {
        // The following block is commented out, possibly for future use or in review
        // It checks if the user is eligible to create a new referral based on their subscription status
        /*
        // Check if the user is eligible to create a new referral
        const SK = await UserService.getSK(email);
        const userDetails = await UserService.getSubscriptionStatus(email, SK);
        if (
          activeSubscriptionId[0].availableReferrals === 0 &&
          !userDetails[0].isSubscribed &&
          userDetails[0].referralCount === 0
        ) {
          throw new BaseError(
            "You cannot request for a referral because you have reached the maximum limit of referrals. Please upgrade your subscription.",
            HttpStatusCode.PAYMENT_REQUIRED_402
          );
        }
        */

        // Enhance the referral request with the active subscription ID
        const userReferralRequest: UserReferralRequestCreateDTO = {
          ...referralRequestBody,
          userSubscriptionId: activeSubscriptionId[0].id,
        };

        // Create the referral request in the database
        const referralRequestId = await UserReferralService.create(
          userReferralRequest,
          emailId
        );

        // Prepare `SK` for calculate matching scores for this job application
        const userReferralSK = userReferralDao.sortKeys.SK_REFERRAL.strtr({
          "{reqId}": referralRequestId.referralRequestId,
        });

        // Invoke a lambda function to calculate matching scores for this referral
        // TODO: Add logic to check if it has been tested on local or not
        await InvokeLambdaService.triggerMatchingScoreCalculation(
          email,
          MatchingScoreEntityEnum.REFERRAL,
          userReferralSK
        );

        // Respond with the created referral request ID
        res.status(HttpStatusCode.OK_200).json(referralRequestId);
      }
    } catch (error) {
      // Handle errors
      console.log("error: ", error);

      // Special handling for a specific error type: User not found
      if (
        error instanceof TypeError &&
        error.message.includes("undefined (reading 'SK')")
      ) {
        // This error suggests that UserService.getSK(email) failed because the user doesn't exist
        res.status(HttpStatusCode.UNAUTHORIZED_401).json({
          status: "failure",
          message: "There is no user with the provided details",
        });
      } else {
        // Pass other errors to the next error handler
        next(error);
      }
    }
  };

  /**
   * updateStatus
   *
   * updates the status of user Referral request
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  updateReferralStatusByCand = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action for debugging purposes
      global.logger.info("update referral status [controller]");

      // Destructure the required parameters from the request params
      const { candEmail, referralId, newStatus } = req.params;

      // Validate the newStatus parameter
      const { error } = UserReferralStatusValidation.validate(newStatus, {
        abortEarly: false,
      });

      // If the newStatus validation fails, throw a RequestValidationError
      if (error) {
        throw new RequestValidationError(error);
      }

      let updatedReferralStatus;

      // If the newStatus is 'WITHDRAWN', handle the withdrawal process
      if (newStatus === ReferralStatus.WITHDRAWN) {
        // Extract the payload from the request body
        let withdrawnReferralPayload: UserReferralStatusChangeByCandDTO =
          req.body;

        // Validate the withdrawnReferralPayload
        const { error } = withdrawnReferralPayloadValidation.validate(
          withdrawnReferralPayload,
          {
            abortEarly: false,
          }
        );

        // If the withdrawnReferralPayload validation fails, throw a RequestValidationError
        if (error) {
          throw new RequestValidationError(error);
        }

        // Call the service method to withdraw the referral
        updatedReferralStatus =
          await UserReferralService.updateStatusForWithdrawnReferral(
            referralId,
            candEmail,
            withdrawnReferralPayload
          );
      } else {
        // Call the service method to update the referral status
        updatedReferralStatus = await UserReferralService.updateStatus(
          referralId,
          candEmail,
          newStatus
        );
      }

      // Send a successful response with the updated referral data
      res.status(HttpStatusCode.OK_200).json(updatedReferralStatus);
    } catch (error) {
      // Handle errors
      // Pass other errors to the next error handler
      next(error);
    }
  };

  /**
   * Updates the status of a user referral request by an employee.
   *
   * @param {Request} req - The request object containing parameters and body.
   * @param {Response} res - The response object to send back to the client.
   * @param {NextFunction} next - The next function to pass control to the next middleware.
   */
  updateReferralStatusByEmp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Log the action for debugging purposes
      global.logger.info("update referral status employee [controller]");

      // Extract referralId from request parameters
      const { referralId } = req.params;

      // Extract and validate the request body
      const referralStatusUpdate = req.body;
      const { error } = UserReferralEmployeeStatusValidation.validate(
        referralStatusUpdate,
        { abortEarly: false }
      );

      // Handle validation errors
      if (error) {
        throw new RequestValidationError(error);
      }

      // Call the service method to update the referral status and preapre the params.
      const userId = referralStatusUpdate.userId;
      const empEmail = referralStatusUpdate.emailId;
      
      // update the referral status 
      const userReferral = await userReferralEmpServiceObj.updateReferralStatusByEmp(
        referralId,
        referralStatusUpdate,
        userId,
        empEmail
      );
  
      // Send a successful response with the updated referral data
      res.status(HttpStatusCode.OK_200).json(userReferral);
    } catch (error) {
      // Pass any errors to the next error handler
      next(error);
    }
  };
}

export default UserReferralController;
