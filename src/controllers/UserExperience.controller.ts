// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import { UserExperienceDTOWithId } from "../dtos/UserExperience.dto";

// Load the local schema
import { validateEmailField } from "../schemas/User.schema";
import { userExperienceDTOArrayValidation } from "../schemas/UserExperience.schema";

// Load the shared service
import UserExperienceService from "../services/UserExperience.service";
import UserProfilePercentageService from "../services/UserProfilePercentage.service";
import CompanyService from "../services/Company.service";

// Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError, RequestValidationError } from "../utils/errors.util";

// Load local helper
import { UserProfilePercentageOperationHelper } from "../helpers/ProfilePercentageOperations.helper";

/**
 * UserExperienceController
 *
 * Class to perform related/relevant action/activities related to the "UserExperience" table
 */
class UserExperienceController {
  /**
   * getByEmail
   *
   * Get the user based on the provided query parameters
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  getByEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Get user experience by id [controller]");

      // Extract email from request parameters
      const email = req.params.id;
      const { error } = validateEmailField(email);
      if (error) {
        throw new RequestValidationError(error);
      }

      // Retrieve the user experience based on the email
      const userExperience = await UserExperienceService.get(email);

      // If not experience found for the user, then return an empty array
      if (!userExperience.count){
        return res.status(HttpStatusCode.OK_200).json([]);
      }

      // Get company IDs
      const companyIDs: string[] = userExperience.map((obj) => obj.companyId);

      // Get unique company IDs using a Set
      const uniqueCompanyIDs: string[] = Array.from(new Set(companyIDs));

      // Fetch company details for each unique company ID
      const companyDetailsResults = await CompanyService.getCompanyDetailsByIds(
        uniqueCompanyIDs
      );

      // Prepare response data
      const finalUserExperience = userExperience.map((item) => {
        const companyDetails = companyDetailsResults.find(
          (companyDetail) => companyDetail.id === item.companyId
        );
        return {
          ...item,
          companyLogoUrl: companyDetails?.logoUrl || null,
          companyLogo: companyDetails?.logo || null
        };
      });

      // Send successful response with user data and company details
      return res.status(HttpStatusCode.OK_200).json(finalUserExperience);
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
   * create
   *
   * Creates/updates the user's experience URLs
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action for debugging purposes
      logger.info("Create/update user Experience by email [controller]");

      // Extract email from request parameters
      const email = req.params.id;

      const { error: emailError, value: emailId } = validateEmailField(email);

      const userExperienceDTO: UserExperienceDTOWithId[] = req.body;
      let { error, value } = userExperienceDTOArrayValidation.validate(
        userExperienceDTO,
        {
          abortEarly: false,
        }
      );

      // Validate the user input and throw a validation error if necessary
      if (emailError) {
        throw new RequestValidationError(emailError);
      } else if (error) {
        throw new RequestValidationError(error);
      }

      let userProfilePercentageDTO = await UserProfilePercentageService.get(
        emailId
      );
      userProfilePercentageDTO = userProfilePercentageDTO.toJSON()[0];

      for (let i = 0; i < userExperienceDTO.length; i++) {
        // checking the fields in profile percentage for UserExperience and updating the current percentage
        userProfilePercentageDTO =
          UserProfilePercentageOperationHelper.updateCurPerc(
            userProfilePercentageDTO,
            value[i]
          );
        // If it has an SK, then it is an update, and if it does not have an SK, it is a create
        if (userExperienceDTO[i].SK) {
          UserExperienceService.update(
            emailId,
            userExperienceDTO[i].SK,
            value[i]
          );
        } else {
          UserExperienceService.create(emailId, value[i]);
        }
      }

      UserProfilePercentageService.update(emailId, userProfilePercentageDTO);

      // Send a successful response with user data
      res.status(HttpStatusCode.OK_200).json();
    } catch (error: any) {
      // If it's another type of error, pass it to the next error handler
      next(error);
    }
  };

  /**
   * sendOtptoVerifyUserWorkEmail
   *
   * Sends a One-Time Password (OTP) to a user's work email address for verification.
   *
   * @param {Request} req - The request object containing user email address and ID.
   * @param {Response} res - The response object to send back to the client.
   * @param {NextFunction} next - The next middleware function in the request-response cycle.
   * @returns {Promise<void>} - A Promise that resolves when the OTP is sent successfully.
   */
  sendOtptoVerifyUserWorkEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Extract primary email address from request parameters
      const primaryEmail = req.params.primaryEmail;

      // Extract user experience ID from request parameters
      const experienceId = req.params.id;

      // Get user's IP address from request
      const userIpAddress: string = req.ip as string;

      // Validate email address, If email validation fails throw a validation error
      const { error } = validateEmailField(primaryEmail);
      if (error) {
        throw new RequestValidationError(error);
      }

      // Checking whether the email and experience id are of the same user or not
      const userExperience = await UserExperienceService.getByUserPrimaryEmailAndId(primaryEmail, experienceId);
      if (!userExperience.length) {
        throw new BaseError("The experience doesn't belong to the logged in user.", HttpStatusCode.BAD_REQUEST_400);
      }
      
      // Send an email to the user to verify their work email address.
      const userOtpDetails = await UserExperienceService.sendOtptoVerifyUserWorkEmail(
        primaryEmail,
        experienceId,
        userIpAddress,
      );

      // Send success response with user OTP object
      res.status(HttpStatusCode.OK_200).json({
        id: userOtpDetails.id
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * verifyWorkEmail
   *
   * Verifies the One-Time Password (OTP) provided by the user.
   *
   * @param {Request} req - The request object containing user ID, email address, and OTP.
   * @param {Response} res - The response object to send back to the client.
   * @param {NextFunction} next - The next middleware function in the request-response cycle.
   * @returns {Promise<void>} - A Promise that resolves when OTP verification is complete.
   */
  verifyWorkEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Extract user primary email address from request parameters
      const primaryEmail = req.params.primaryEmail;

      // Extract user experience ID from request parameters
      const experienceId = req.params.id;

      // Extract OTP from request body
      const otp = req.body.otp;

      // Validate email address, If email validation fails throw a validation error
      const { error } = validateEmailField(primaryEmail);
      if (error) {
        throw new RequestValidationError(error);
      }

      // Checking whether the email and experience id are of the same user or not
      const userExperience = await UserExperienceService.getByUserPrimaryEmailAndId(primaryEmail, experienceId);
      if (!userExperience.length) {
        throw new BaseError("The experience doesn't belong to the logged in user.", HttpStatusCode.BAD_REQUEST_400);
      }

      // Verify the OTP received from user to make sure the work email belogs to the user only.
      const isOtpVerified = await UserExperienceService.verifyOtpforUserWorkEmail(
        primaryEmail,
        experienceId,
        otp,
      );

      // Send OTP verification details in the response
      res
        .status(HttpStatusCode.OK_200)
        .json({
          verificationStatus: isOtpVerified
        });
    } catch (error: any) {
      next(error);
    }
  };
}

export default UserExperienceController;