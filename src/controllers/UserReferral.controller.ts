//npm import
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import { UserReferralRequestDTO } from "../dtos/User.dto";
import { UserReferralResponseDTO } from "../dtos/UserReferralResponse.dto";
import { UserReferralStatusChangeByCandDTO } from "../dtos/UserReferral.dto";

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

//Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

// Load the Enums
import { ReferralActions } from "../enums/User.enum";
import { ReferralStatus } from "../enums/UserReferral.enum";
import UserService from "../services/User.service";

import { EmailSourceDestinationAddress } from "../libraries/email.library";
import { EmailTemplatePlaceholderCAND_REFERRAL_REQ_COMPLETED } from "../dtos/EmailTemplatePlaceholder.dto";
import UserDetailService from "../services/UserDetail.service";


/**
 * UserReferralController
 *
 * Class to perform related/relevent action/activities related to the "user referral" table
 */
class UserReferralController {
  /**
   * getByEmail
   *
   * Retrieves the user based on the provided query parameters
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action for debugging purposes
      logger.info("Get user Referral by email [controller]");

      // Extract email from request parameters
      const email = req.params.id;

      // Validate the email field
      const { error, value } = validateEmailField(email);
      if (error) {
        throw new RequestValidationError(error);
      }

      // Check if a specific status is requested
      const status = req.query.status;
      let result;

      // Fetch referrals based on the status query
      if (status && typeof status === "string") {
        result = await UserReferralService.getByStatus(value, status);
      } else {
        result = await UserReferralService.get(value);
      }

      // Get company IDs from the fetched referrals
      const companyIDs: string[] = result.map((obj) => obj.companyId);

      // Get unique company IDs using a Set
      const uniqueCompanyIDs: string[] = Array.from(new Set(companyIDs));

      // Fetch company details for each unique company ID
      const companyDetailsResults = await CompanyService.getCompanyDetailsByIds(
        uniqueCompanyIDs
      );

      // Map over the referrals and include company name
      const finalUserReferral = result.map((item) => {
        // Find the company details corresponding to the current referral item
        const companyDetails = companyDetailsResults.find(
          (companyDetail) => companyDetail.id === item.companyId
        );

        // Extract the company name if company details are found, otherwise set it to null
        const companyName = companyDetails ? companyDetails.name : null;

        return { ...item, companyName: companyName };
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
   * getByGSI1PKAndStatus
   *
   * Retrieves the referrals based on the provided query parameters
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  getByGSI1PKAndStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Log the action for debugging purposes
      logger.info("Get Referral by GSI1PK and status [controller]");

      // Extract email from request parameters
      const companyId = req.params.companyId;
      const status = req.query.status;
      let result;
      if (status && typeof status === "string") {
        result = await UserReferralService.getByGSI1PKAndStatus(
          companyId,
          status
        );
      } else {
        result = await UserReferralService.getByGSI1PK(companyId);
      }

      /* status && typeof status === "string"
        ? result = await UserReferralService.getByStatus(email, status)
        : result = await UserReferralService.get(email); */

      // Send a successful response with user data
      res.status(HttpStatusCode.OK_200).json(result);
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
  getMatchingScore = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id, referralId } = req.params;
      const matchingScore = await UserReferralService.matchingScore(
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
   * createReferral
   *
   * Create a new referral based on the provided input data. Validates the input data
   * and, if successful, proceeds with the new referral creation logic.
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  createReferral = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Create referral [controller]");
      const email = req.params.id;

      const { error: emailError, value: emailId } = validateEmailField(email);

      const referralRequest: UserReferralRequestDTO = req.body;
      const { error } = UserReferralRequestDTOValidation.validate(
        referralRequest,
        { abortEarly: false }
      );

      if (emailError) {
        throw new RequestValidationError(emailError);
      } else if (error) {
        throw new RequestValidationError(error);
      }

      /* const SK = await UserService.getSK(email);
      const subStatus = await UserService.getSubscriptionStatus(email, SK);
      if (!subStatus[0].isSubscribed) {
        res.status(HttpStatusCode.PAYMENT_REQUIRED_402).json({
          status: "failure",
          message: "Payment Required",
          description:
            "User does not have an active subscription. Please subscribe to access this service.",
        });
      } */

      const referralRequestId = await UserReferralService.referralRequest(
        referralRequest,
        emailId
      );
      // invoke score matching lambda function
      // @todo : add logic code to check if  it has been tested on local or not
      await InvokeLambdaService.triggerMatchingScoreCalculation(
        email,
        referralRequestId.referralRequestId
      );

      res.status(HttpStatusCode.OK_200).json(referralRequestId);
    } catch (error) {
      // Handle errors
      // Pass the error to the next error handler
      console.log("error: ", error);
      // Check if the error is a specific type (TypeError in this case)
      if (
        error instanceof TypeError &&
        error.message.includes("undefined (reading 'SK')")
      ) {
        // Respond with "User not found" message and set a different status code (e.g., 400)
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
  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
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
        // To inscrease the referral count every time the candidate request for referral is withdrawn
        UserService.increaseReferralCount(candEmail);

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
  updateStatusByEmployee = async (
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
      const candEmail: string = candPK.split('#').pop() ?? ""; // for valid PK, there will be valid email id
      const candDetails = await UserDetailService.get(candEmail);
      const candName = candDetails[0].name;
 
      let referralResponse;
      let updateReferralResponse = false;

      // Check if action is PASS or REJECT to determine if referral response needs to be updated
      if (
        referralstatusUpdate.action === ReferralActions.PASS ||
        referralstatusUpdate.action === ReferralActions.REJECT
      ) {
        // Retrieve the existing referral response for the specified email ID.
        referralResponse = await UserReferralResponseService.get(
          referralstatusUpdate.emailId
        );
        // Determine whether an existing referral response is found based on the count.
        // If count is non-zero, set updateReferralResponse to true; otherwise, set it to false.
        updateReferralResponse = referralResponse.count !== 0;
      }

      // Initialize DTO for user referral response
      let userReferralResponseDTO: UserReferralResponseDTO = {
        passedRefIds: [],
        rejectedRefIds: [],
      };

      // Get current date
      const currentDate = new Date();

      // Update referral based on action provided
      switch (referralstatusUpdate.action) {
        // Handle when action is PASS
        case ReferralActions.PASS:
          if (!referral || referral.count === 0) {
            throw new Error("Wrong referralId");
          }

          // Update passedByUserIds array with current userId and actionDate
          if (
            !referral[0].passedByUserIds ||
            referral[0].passedByUserIds.length === 0
          ) {
            referral[0].passedByUserIds = [
              { userId, actionDate: currentDate.toISOString() },
            ];
          } else {
            referral[0].passedByUserIds.push({
              userId,
              actionDate: currentDate,
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

          // Update rejectedByUserIds array with userId, actionDate, reason, and userComment
          if (
            !referral[0].rejectedByUserIds ||
            referral[0].rejectedByUserIds.length === 0
          ) {
            referral[0].rejectedByUserIds = [
              {
                userId: userId,
                actionDate: currentDate.toISOString(),
                reason: referralstatusUpdate.reason,
                userComment: referralstatusUpdate.userComment,
              },
            ];
          } else {
            referral[0].rejectedByUserIds.push({
              userId: userId,
              actionDate: currentDate.toISOString(),
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

        // Handle when action is ACCEPT
        case ReferralActions.ACCEPT:
          if (!referral || referral.count === 0) {
            throw new Error("Wrong referralId");
          } else if (referral[0].acceptedByUserId) {
            throw new Error("Referral already accepted by other employee");
          }

          referral[0].acceptedByUserId = userId;
          referral[0].status = ReferralStatus.ACCEPTED;
          referral[0].acceptedAtByUser = currentDate;

          break;

        // Handle when action is DONE
        case ReferralActions.DONE:
          if (!referral || referral.count === 0) {
            throw new Error("Wrong referralId");
          } else if (referral[0].doneByEmployee) {
            throw new Error("Referral already done by you");
          }

          referral[0].doneByEmployee = currentDate;
          referral[0].doneByUserId = userId;
          referral[0].status = ReferralStatus.DONE;

          break;

        default:
          throw new Error("Invalid action provided");
      }

      // Extract unnecessary properties before updating referral
      const { PK, SK, updatedAt, ...userReferralDTO } = referral[0];
      
      // Update referral in the database
      const result = await UserReferralService.update(PK, SK, userReferralDTO, referralstatusUpdate.action);

      // Update or create user referral response based on whether response exists
      // If the details are updated and action is "DONE", then email should be sent to the candidate saying that his referral request has been completed
      if(result && referralstatusUpdate.action === ReferralActions.DONE)
      {
        // Prepare the necessary parameters required for the sendEmailToCandWhenReferralRequestCompleted function
        const toAddress: EmailSourceDestinationAddress = {
          email: candEmail,
          fullName: candName
        };
        const emailPlaceholders: EmailTemplatePlaceholderCAND_REFERRAL_REQ_COMPLETED = {
          candName: candName
        }

        // Function responsible for sending the email to the candidate saying that his referral request has been completed
        const sendEmailResponse = await UserReferralService.sendEmailToCandWhenReferralRequestCompleted(emailPlaceholders,toAddress);
      }


      if (updateReferralResponse) {
        const { passedRefIds, rejectedRefIds } = referralResponse[0];
        UserReferralResponseService.update(referralstatusUpdate.emailId, {
          passedRefIds,
          rejectedRefIds,
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
