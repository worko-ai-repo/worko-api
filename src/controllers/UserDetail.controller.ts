// Load aws s3 client library
import { awsS3ClientLibrary } from "../configs/aws-sdk.config";

// Load local constants
import APP_CONSTANTS from "../configs/constants.config";

// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import { UserDetailDTO, UserDetailUpdateApiDto } from "../dtos/UserDetail.dto";

// Load the local schema
import { userDetailDTOValidation, userDetailUpdateApiDtoValidation } from "../schemas/UserDetail.schema";
import { validateEmailField } from "../schemas/User.schema";

// Load the shared service
import UserDetailService from "../services/UserDetail.service";
// import UserProfilePercentageService from "../services/UserProfilePercentage.service";

// Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

// Load local helper
// import { UserProfilePercentageOperationHelper } from "../helpers/ProfilePercentageOperations.helper";
import UserExperienceService from "../services/UserExperience.service";

// Load models
import { DbUserOtpDto } from "../db/models/UserOTP.model";
import { DbUserDetailDto } from "../db/models/UserDetail.model";

/**
 * UserDetailController
 *
 * Class to perform related/relevent action/activities related to the "UserDetail" table
 */
class UserDetailController {
  /**
   * getUserById
   *
   * Get the user based on the provided quesry parameters
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  getByEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      global.logger.info("Get user detail by id [controller]");

      // Extract email from request parameters
      const email = req.params.id;

      const { error, value } = validateEmailField(email);
      if (error) {
        throw new RequestValidationError(error);
      }

      const userDetails = await UserDetailService.get(value);
      if (!userDetails.count) {
        throw new Error("User not found");
      }

      // Prepare the user id
      let userId: string = userDetails[0].SK?.split("#").pop() ?? "";
      console.log("userId60: ", userId);
      let cvAwsS3SignedUrl = null;
      let profileImageAwsS3SignedUrl = null;

      // Check if CV is present
      if (userDetails[0].CV) {
        // Construct the file path in the cloud storage
        const filePath = APP_CONSTANTS.AWS_S3_DIR_PATHS.USER_RESUME.strtr({
          "{userId}": userId,
        });

        // Assume that you have a method to generate the object URL
        cvAwsS3SignedUrl = await awsS3ClientLibrary.generateObjectUrl(
          process.env.APP_AWS_S3_BUCKET_WORKO_APP as string,
          filePath + "/" + userDetails[0].CV
        );
      }

      // Gnereta e signed url to view the Profile
      if (userDetails[0].profileImage) {
        // Construct the file path in the cloud storage
        const filePath = APP_CONSTANTS.AWS_S3_DIR_PATHS.USER_PROFILE_PIC.strtr({
          "{userId}": userId,
        });

        // Assume that you have a method to generate the object URL
        profileImageAwsS3SignedUrl = await awsS3ClientLibrary.generateObjectUrl(
          process.env.APP_AWS_S3_BUCKET_WORKO_APP as string,
          filePath + "/" + userDetails[0].profileImage
        );
      }

      // Send successful response with user data
      res.status(HttpStatusCode.OK_200).json([
        {
          ...userDetails[0],
          cvAwsS3SignedUrl,
          profileImageAwsS3SignedUrl,
        },
      ]);
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
  * getByUserId
  *
  * Get the user based on the provided userId query parameters
  *
  * @param {Request} req
  * @param {Response} res
  * @param {NextFunction} next
  */
  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      global.logger.info("Get user detail by user id [controller]");

      // Extract userId from request parameters
      const userId = req.params.userId;

      const userDetails = await UserDetailService.getUserById(userId);
      if (!userDetails.count) {
        throw new Error("User not found");
      }
      let userEmail = userDetails[0].emailList.primary;
      const userExperience = await UserExperienceService.get(userEmail);
      const currentExperience = userExperience.find(exp => exp.isCurrent);
      // Prepare the user id
      let cvAwsS3SignedUrl = null;
      let profileImageAwsS3SignedUrl = null;

      // Check if CV is present
      if (userDetails[0].CV) {
        // Construct the file path in the cloud storage
        const filePath = APP_CONSTANTS.AWS_S3_DIR_PATHS.USER_RESUME.strtr({
          "{userId}": userId,
        });

        // Assume that you have a method to generate the object URL
        cvAwsS3SignedUrl = await awsS3ClientLibrary.generateObjectUrl(
          process.env.APP_AWS_S3_BUCKET_WORKO_APP as string,
          filePath + "/" + userDetails[0].CV
        );
      }

      // Generate signed URL for profile image
      if (userDetails[0].profileImage) {
        // Construct the file path in the cloud storage
        const filePath = APP_CONSTANTS.AWS_S3_DIR_PATHS.USER_PROFILE_PIC.strtr({
          "{userId}": userId,
        });

        // Assume that you have a method to generate the object URL
        profileImageAwsS3SignedUrl = await awsS3ClientLibrary.generateObjectUrl(
          process.env.APP_AWS_S3_BUCKET_WORKO_APP as string,
          filePath + "/" + userDetails[0].profileImage
        );
      }
      const userExperienceDetails = {
        comapnyName: currentExperience?.companyName,
        department: currentExperience?.department,
        designation: currentExperience?.designation,
        designationTag: currentExperience?.designationTag,
      }
      // Send successful response with user userExperienceDetails
      res.status(HttpStatusCode.OK_200).json([
        {
          ...userDetails[0],
          userExperienceDetails,
          cvAwsS3SignedUrl,
          profileImageAwsS3SignedUrl,
        },
      ]);
    } catch (error: any) {
      // Handle errors

      // Check if the error is due to user not found
      if (error.message === "User not found") {
        // If user not found, send a 404 response with an informative error message
        res
          .status(HttpStatusCode.NOT_FOUND_404)
          .json({ error: "User not found. Please check the user ID." });
      } else {
        // If it's another type of error, pass it to the next error handler
        next(error);
      }
    }
  };



  /**
   * create
   *
   * Creates/updates the user's details URLs
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action for debugging purposes
      global.logger.info("Create/update user Detail by email [controller]");

      // Extract email from request parameters
      const email = req.params.id;

      const { error: emailError, value: emailId } = validateEmailField(email);

      const userDetailDTO: UserDetailDTO = req.body;
      logger.debug("userDetailDTO: ", userDetailDTO);
      let { error, value } = userDetailDTOValidation.validate(userDetailDTO, {
        abortEarly: false,
      });

      // Validate the user input and throw a validation error if necessary
      if (emailError) {
        throw new RequestValidationError(emailError);
      } else if (error) {
        throw new RequestValidationError(error);
      }

      /*
      let userProfilePercentageDTO = await UserProfilePercentageService.get(
        emailId
      );
      userProfilePercentageDTO = userProfilePercentageDTO.toJSON()[0];
      */

      const result = await UserDetailService.update(
        emailId,
        req.body.SK,
        value
      );

      const candidateExperienceObj = !value.isCandidateFresher && value.candidateExperience !== undefined 
        ? value.candidateExperience
        : {};
      const updateUserDetailObj = {
        ...value,
        ...candidateExperienceObj
      }
      global.logger.debug("updateUserDetailObj",{
        methodName: this.update.name,
        updateUserDetailObj
      });

      /*
      userProfilePercentageDTO =
        UserProfilePercentageOperationHelper.updateCurPerc(
          userProfilePercentageDTO,
          updateUserDetailObj
        );  

      UserProfilePercentageService.update(emailId, userProfilePercentageDTO);
      */

      // If it has an SK, then it is an update, and if it does not have an SK, it is a create
      /* if (req.body.SK) {
        UserDetailService.update(email, req.body.SK, value);
      } else {
        UserDetailService.create(email, value);
      } */
      // Get the Email-Value from user Detail Service to generate signed URL 
      let userDetails = await UserDetailService.get(emailId);
      // Generate signed URLs for CV and profile image
      let cvAwsS3SignedUrl = null;
      let profileImageAwsS3SignedUrl = null;
      // Prepare the user id
      let userId: string = userDetails[0].SK?.split("#").pop() ?? "";
      // Check if CV is present
      if (userDetails[0].CV) {
        // Construct the file path in the cloud storage
        const filePath = APP_CONSTANTS.AWS_S3_DIR_PATHS.USER_RESUME.strtr({
          "{userId}": userId,
        });

        // Generate signed URL
        cvAwsS3SignedUrl = await awsS3ClientLibrary.generateObjectUrl(
          process.env.APP_AWS_S3_BUCKET_WORKO_APP as string,
          filePath + "/" + userDetails[0].CV
        );
      }

      // Generate signed URL for profile image
      if (userDetails[0].profileImage) {
        // Construct the file path in the cloud storage
        const filePath = APP_CONSTANTS.AWS_S3_DIR_PATHS.USER_PROFILE_PIC.strtr({
          "{userId}": userId,
        });

        // Generate signed URL
        profileImageAwsS3SignedUrl = await awsS3ClientLibrary.generateObjectUrl(
          process.env.APP_AWS_S3_BUCKET_WORKO_APP as string,
          filePath + "/" + userDetails[0].profileImage
        );
      }

      // Send a successful response with user data
      res.status(HttpStatusCode.OK_200).json({
        ...result,
        cvAwsS3SignedUrl,
        profileImageAwsS3SignedUrl,
      });
    } catch (error: any) {
      // If it's another type of error, pass it to the next error handler
      next(error);
    }
  };

  updateUserDetailByEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info("updateUserDetailByEmail [controller]");

      const email: string = req.params.email;

      const reqBody: UserDetailUpdateApiDto = req.body;

      const { error, value: validatedReqBody } = userDetailUpdateApiDtoValidation.validate(
        reqBody,
        {
          abortEarly: false,
        }
      )
      if (error) {
        throw new RequestValidationError(error);
      }

      const updatedUserDetail: DbUserDetailDto = await UserDetailService.updateUserDetailByEmail(
        email,
        validatedReqBody
      );

      res.status(HttpStatusCode.OK_200).json(
        updatedUserDetail
      )
    } catch (error) {
      global.logger.error("Error in updateUserDetailByEmail [controller]", {
        methodName: this.updateUserDetailByEmail.name,
        error
      })
      next(error);
    }
  };

  sendSmsOtptoVerifyUserPhoneNumber = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info("sendSmsOtptoVerifyUserPhoneNumber [controller]");

      const email: string = req.params.email;

      // Get user's IP address from request
      const userIpAddress: string = req.ip as string;

      const { error } = validateEmailField(email);
      if (error) {
        throw new RequestValidationError(error);
      }

      const result: DbUserOtpDto = await UserDetailService.sendSmsOtptoVerifyUserPhoneNumber(
        email,
        userIpAddress,
      );
      res.status(HttpStatusCode.OK_200).json({
        id: result.id
      });
    } catch (error) {
      global.logger.error("Error in sendSmsOtptoVerifyUserPhoneNumber [controller]", {
        methodName: this.sendSmsOtptoVerifyUserPhoneNumber.name,
        error
      })
      next(error);
    }
  };

  verifyUserPhoneNumber = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info("verifyUserPhoneNumber [controller]");

      const email: string = req.params.email;

      const { error } = validateEmailField(email);
      if (error) {
        throw new RequestValidationError(error);
      }

      const otp: string = req.body.otp;

      const result: boolean = await UserDetailService.verifyUserPhoneNumber(
        email,
        otp
      );
      
      res.status(HttpStatusCode.OK_200).json({
        verificationStatus: result,
      });
    } catch (error) {
      global.logger.error("Error in verifyUserPhoneNumber [controller]", {
        methodName: this.verifyUserPhoneNumber.name,
        error
      })
      next(error);
    }
  };
}

export default UserDetailController;
