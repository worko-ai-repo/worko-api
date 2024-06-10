//npm import
import { Request, Response, NextFunction } from "express";

// import luxon
import { DateTime } from 'luxon';

// Load the local dtos
import { UserReferralRequestCreateApiDTO ,UserReferralRequestCreateDTO } from "../dtos/User.dto";
import { UserReferralResponseDTO } from "../dtos/UserReferralResponse.dto";
import { UserReferralStatusChangeByCandDTO } from "../dtos/UserReferral.dto";
import { Status } from "../dtos/Company.dto";

// Load the local schema
import {
  UserReferralEmployeeStatusValidation,
  UserReferralRequestDTOValidation,
  UserReferralStatusValidation,
  withdrawnReferralPayloadValidation,
} from "../schemas/UserReferral.schema";
import { validateEmailField } from "../schemas/User.schema";

// Load the shared service
import UserReferralService from "../services/UserReferral.service";
import UserReferralResponseService from "../services/UserReferralResponse.service";
import InvokeLambdaService from "../services/InvokeLambda.service";
import CompanyService from "../services/Company.service";
import UserService from "../services/User.service";
import UserDetailService from "../services/UserDetail.service";
import UserSubscriptionService from "../services/UserSubscription.service";

//Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError, RequestValidationError } from "../utils/errors.util";

// Load the Enums
import { ReferralActions } from "../enums/User.enum";
import { ReferralStatus } from "../enums/UserReferral.enum";

import { EmailSourceDestinationAddress } from "../libraries/email.library";
import { EmailTemplatePlaceholderCAND_REFERRAL_REQ_COMPLETED } from "../dtos/EmailTemplatePlaceholder.dto";



/**
 * UserReferralController
 *
 * Class to perform related/relevent action/activities related to the "user referral" table
 */
class UserReferralController {
  /**
   * getReferralsForCand
   *
   * Retrieves the user based on the provided query parameters
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  getReferralsForCand = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action for debugging purposes
      logger.info("Get user Referral by email [controller]");

      // Get the status from the request query parameter
      const referralStatus = req.query.status as string;

      // Validate the email from the request
      const { error, value: candEmail } = validateEmailField(req.params.userEmail);
      if (error) {
        throw new RequestValidationError(error);
      }

      // Get the candidate referrals for the given "candEmail" and "referralStatus", if no referral found then just return empty response
      let candReferrals = await UserReferralService.getReferralsForCand(candEmail, referralStatus);
      if (!candReferrals.count){
        return res.status(HttpStatusCode.OK_200).json([]);
      }

      // Get unique company IDs from the retrieved referrals
      const companyIDs: string[] = candReferrals.map((referral) => referral.companyId);
      const uniqueCompanyIDs: string[] = Array.from(new Set(companyIDs));

      // Fetch company details for each unique company ID
      const companyDetailsResults = await CompanyService.getCompanyDetailsByIds(
        uniqueCompanyIDs
      );

      // Loop over the retrieved referrals and include the company name in the response
      const finalUserReferral = candReferrals.map((referral) => {
        // Find the company details corresponding to the current referral
        const companyDetails = companyDetailsResults.find((companyDetail) => companyDetail.id === referral.companyId);

        // Return the company name along with referral details
        return {
          ...referral,
          companyName: companyDetails?.name ?? null
        };
      });

      // Send a successful response with user data
      res.status(HttpStatusCode.OK_200).json(finalUserReferral);
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

      // @todo: The "companyId" should be optional when status is other than awaiting. 
      // And status must be mandatory and the emplyee should not be able to get/call the API to get the WITHDRAWN referrals.
      // Extract company ID and status from request query parameters
      const companyId: string = req.query.companyId as string;
      const referralStatus: string = req.query.status as string;

      // get the employee email
      const empPrimaryEmail = req.params.emailId;

       // Validate the newStatus parameter
       const { error } = UserReferralStatusValidation.validate(referralStatus, {
        abortEarly: false,
      });

      // If the newStatus validation fails, throw a RequestValidationError
      if (error) {
        throw new RequestValidationError(error);
      }
      
      // Get referrals for emp based on provided status
      let empReferrals = await UserReferralService.getEmployeeReferrals(
        empPrimaryEmail,
        companyId,
        referralStatus
      );
  
      // Check if any company referrals exist
      if (!empReferrals.length) {
        // Send employee referrals as response if no company referrals found
        return res.status(HttpStatusCode.OK_200).json([]);
        
      }
  
      // Get unique company IDs from the retrieved referrals
      const uniqueCompanyIDs: string[] = Array.from(new Set(empReferrals.map(referral => referral.companyId)));
  
      // Fetch company details for each unique company ID
      const companyDetailsResults = await CompanyService.getCompanyDetailsByIds(uniqueCompanyIDs);
  
      // Loop over the retrieved referrals and include the company name in the response
      const finalUserReferrals = empReferrals.map(referral => {
  
        // Find the company details corresponding to the current referral
        const companyDetails = companyDetailsResults.find(companyDetail => companyDetail.id === referral.companyId);
        
        // Return the referral along with the company name
        return {
          ...referral,
          companyName: companyDetails?.name ?? null,
        };
      });
      
      // Send a successful response with combined user data and referral details
      res.status(HttpStatusCode.OK_200).json(finalUserReferrals);
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

        // Invoke a lambda function to calculate matching scores for this referral
        // TODO: Add logic to check if it has been tested on local or not
        await InvokeLambdaService.triggerMatchingScoreCalculation(
          email,
          referralRequestId.referralRequestId
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
      const referralstatusUpdate = req.body;
      const { error } = UserReferralEmployeeStatusValidation.validate(
        referralstatusUpdate,
        { abortEarly: false }
      );

      // Handle validation errors
      if (error) {
        throw new RequestValidationError(error);
      }

      // Extract userId from request body
      const userId = referralstatusUpdate.userId;
      let referral = await UserReferralService.getByGSI1(referralId); //Fetching the referral details

      // From the referral, get the candidate's name and email for sending email
      const candPK: string = referral[0].PK;
      const candEmail: string = candPK.split("#").pop() ?? ""; // for valid PK, there will be valid email id
      const candDetails = await UserDetailService.get(candEmail);
      const candName = candDetails[0].name;
  
      // Retrieve the existing referral response for the specified email ID.
      let referralResponse = await UserReferralResponseService.get(
        referralstatusUpdate.emailId
      );

      let updateReferralResponse = false;

      // Check if action is PASS or REJECT to determine if referral response needs to be updated
      if (
        referralstatusUpdate.action === ReferralActions.PASS ||
        referralstatusUpdate.action === ReferralActions.REJECT ||
        referralstatusUpdate.action === ReferralActions.ACCEPT ||
        referralstatusUpdate.action === ReferralActions.DONE
      ) {
       
        // Determine whether an existing referral response is found based on the count.
        // If count is non-zero, set updateReferralResponse to true; otherwise, set it to false.
        updateReferralResponse = referralResponse.count !== 0;
      }

      // Initialize DTO for user referral response
      let userReferralResponseDTO: UserReferralResponseDTO = {
        passedRefIds: [],
        rejectedRefIds: [],
        acceptedRefIds: [],
        doneRefIds: [],
      };

      // Get current date
      const currentDate = DateTime.now();

      // Update referral based on action provided
      switch (referralstatusUpdate.action) {
        // Handle when action is PASS
        case ReferralActions.PASS:
          if (!referral || referral.count === 0) {
            throw new Error("Wrong referralId");
          }
          // Check if the referral has already been passed by the current user
          const alreadyPassedByCurrentUser = referral[0].passedByUserIds && referral[0].passedByUserIds.some(
            (passedUser: { userId: string }) => passedUser.userId === userId
          );

          // if user has already passed the referral then throw error message 
          if (alreadyPassedByCurrentUser) {
            throw new Error("The referral has already been passed by you.")
          }
          // Update passedByUserIds array with current userId and actionDate
          if (
            !referral[0].passedByUserIds ||
            referral[0].passedByUserIds.length === 0
          ) {
            referral[0].passedByUserIds = [
              { userId, actionDate:  currentDate.toISO() },
            ];
          } else {
            referral[0].passedByUserIds.push({
              userId,
              actionDate:  currentDate.toISO(),
            });
          }

          // Update referral response or DTO based on whether response exists
          if (updateReferralResponse) {
            referralResponse[0].passedRefIds.push(referralId);
            // If updateReferralResponse is false, implying no existing referral response,
            // add the referralId to the passedRefIds array of the userReferralResponseDTO.
          } else {
            userReferralResponseDTO.passedRefIds.push(referralId);
          }

          break;

        // Handle when action is REJECT
        case ReferralActions.REJECT:
          if (!referral || referral.count === 0) {
            throw new Error("Wrong referralId");
          }
          // Check if the referral has already been rejected by the current user
          const alreadyRejectedByCurrentUser = referral[0].rejectedByUserIds &&
            referral[0].rejectedByUserIds.some(
              (rejectedUserId: { userId: string }) => rejectedUserId.userId === userId
            );

          // if user has already rejected the referral then throw error message 
          if (alreadyRejectedByCurrentUser) {
            throw new Error("The referral has already been rejected by you.")
          }
          // Update rejectedByUserIds array with userId, actionDate, reason, and userComment
          if (
            !referral[0].rejectedByUserIds ||
            referral[0].rejectedByUserIds.length === 0
          ) {
            referral[0].rejectedByUserIds = [
              {
                userId: userId,
                actionDate:  currentDate.toISODate(),
                reason: referralstatusUpdate.reason,
                userComment: referralstatusUpdate.userComment,
              },
            ];
          } else {
            referral[0].rejectedByUserIds.push({
              userId: userId,
              actionDate:  currentDate.toISODate(),
              reason: referralstatusUpdate.reason,
              userComment: referralstatusUpdate.userComment,
            });
          }

          // Update referral response or DTO based on whether response exists
          if (updateReferralResponse) {
            referralResponse[0].rejectedRefIds.push(referralId);
          } else {
            userReferralResponseDTO.rejectedRefIds.push(referralId);
          }

          break;

        case ReferralActions.ACCEPT:
          if (!referral || referral.count === 0) {
            throw new Error("Wrong referralId");
          } else if (referral[0].acceptedByUserId) {
            throw new Error("Referral already accepted by other employee");
          }

          referral[0].acceptedByUserId = userId;
          referral[0].status = ReferralStatus.ACCEPTED;
          referral[0].acceptedAtByUser = currentDate.toJSDate();

          // Update acceptedRefIds array in DTO
          if (updateReferralResponse) {
            referralResponse[0].acceptedRefIds.push(referralId);
          } else {
            userReferralResponseDTO.acceptedRefIds.push(referralId);
          }

          break;
        // Handle when action is DONE
        case ReferralActions.DONE:
          if (!referral || referral.length === 0) {
            throw new Error("Wrong referralId");
          } else if (referral[0].doneByEmployee) {
            throw new Error("Referral already done by you");
          }

          // If the referral was previously accepted, remove it from acceptedRefIds
          if (referral[0].status === ReferralStatus.ACCEPTED) {
            const index =
              referralResponse[0].acceptedRefIds.indexOf(referralId);
            if (index !== -1) {
              referralResponse[0].acceptedRefIds.splice(index, 1);
            }
          }

          referral[0].doneByEmployee = currentDate.toJSDate();
          referral[0].doneByUserId = userId;
          referral[0].status = ReferralStatus.DONE;

          // Update doneRefIds array in DTO or referral response based on whether response exists
          if (updateReferralResponse) {
            if (referralResponse[0].doneRefIds) {
              referralResponse[0].doneRefIds.push(referralId);
            } else {
              referralResponse[0].doneRefIds = [referralId];
            }
          } else {
            userReferralResponseDTO.doneRefIds.push(referralId);
          }

          break;

        default:
          throw new Error("Invalid action provided");
      }

      // Extract unnecessary properties before updating referral
      const { PK, SK, updatedAt, ...userReferralDTO } = referral[0];
      
      // Update referral in the database
      const result = await UserReferralService.update(PK, SK, userReferralDTO, referralstatusUpdate.action);

      if (updateReferralResponse) {
        const { passedRefIds, rejectedRefIds , acceptedRefIds ,doneRefIds} = referralResponse[0];
        UserReferralResponseService.update(referralstatusUpdate.emailId, {
          passedRefIds,
          rejectedRefIds,
          acceptedRefIds,
          doneRefIds,
        });
      } else {
        UserReferralResponseService.create(
          referralstatusUpdate.emailId,
          userReferralResponseDTO
        );
      }

      // Send a successful response with the updated referral data
      res.status(HttpStatusCode.OK_200).json(result);
    } catch (error) {
      // Pass any errors to the next error handler
      next(error);
    }
  };
}

export default UserReferralController;
