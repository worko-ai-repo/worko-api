// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import {
  UserEmployeeSignUpDTO,
  UserProfileResponse,
  UserSignUpDTO,
} from "../dtos/User.dto";
import { UserType } from "../dtos/Company.dto";
import { UserExperienceDTO } from "../dtos/UserExperience.dto";
import { UserSocialProfileDTO } from "../dtos/UserSocialProfile.dto";
import { UserProfilePercentageDTO } from "../dtos/UserProfilePercentage.dto";

// Load the local schema
import {
  UserSignUpDTOValidation,
  userEmployeeSignUpDTOValidation,
  validateEmailField,
} from "../schemas/User.schema";

// Load the shared service
import UserService from "../services/User.service";
import UserEmailService from "../services/UserEmail.service";
import UserExperienceService from "../services/UserExperience.service";
import UserDetailService from "../services/UserDetail.service";
import UserSocialProfileService from "../services/UserSocialProfile.service";
import UserProfilePercentageService from "../services/UserProfilePercentage.service";

// Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

// Load local helper
import { GroupingHelper } from "../helpers/grouping.helper";
import { UserProfilePercentageOperationHelper } from "../helpers/ProfilePercentageOperations.helper";
import { profilePercentageField } from "../configs/constants/UserProfilePercentage.constant";

/**
 * UserController
 *
 * Class to perform related/relevent action/activities related to the "user" table
 */
class UserController {
  /**
   * getUserById
   *
   * Get the user based on the provided quesry parameters
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      global.logger.info("Get user detail by id [controller]");

      // Extract email from request parameters
      const email = req.params.id;
      const queryParams = req.query;
      console.log(" queryParams:", queryParams);

      // Create an array of service functions based on query parameters
      const serviceFunctions: {
        [key: string]: (email: string) => Promise<any>;
      } = {
        UserDetail: UserDetailService.get,
        UserEmail: UserEmailService.get,
        UserExperience: UserExperienceService.get,
      };

      // Use Object.entries to iterate over queryParams and create promises array
      const promises = Object.entries(queryParams)
        .filter(([key, value]) => value === "true" && serviceFunctions[key])
        .map(([key]) => serviceFunctions[key](email));

      // Use Promise.all to wait for all promises to resolve
      const results = await Promise.all(promises);

      // Create an object with the results
      const responseFormat: { [key: string]: any } = Object.fromEntries(
        Object.entries(queryParams).map(([key, value], index) => [
          key,
          value === "true" ? results[index] : undefined,
        ])
      );

      console.log("responseFormat: ", responseFormat);

      // Send successful response with user data
      res.status(HttpStatusCode.OK_200).json(responseFormat);
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
   * getUserProfileDetailById
   *
   * Get the user based on the provided quesry parameters
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  getUserProfileDetailById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info("Get user profile detail by id [controller]");
      // Extract email from request parameters
      const email = req.params.id;

      const { error, value } = validateEmailField(email);

      if (error) {
        throw new RequestValidationError(error);
      }
      const SK = await UserService.getSK(value);

      // Check if SK is null or indicates an error
      if (SK === null || SK === undefined) {
        return res.status(404).json({ error: "User not found" });
      }

      // Call the UserService to get user by email
      const result = await UserService.getUserDetailByEmail(value, SK);

      // Transform the result to the desired format
      const userProfileResponse: UserProfileResponse = {
        name: result[0].name,
        lastAccessedDash: result[0].lastAccessedDash,
        profileImage:
          result[0].profileImage ||
          "https://cdn.pixabay.com/photo/2017/02/23/13/05/avatar-2092113_1280.png", // If profileImage is not present, set it to an dummy image
      };

      // Send successful response with transformed user data
      res.status(HttpStatusCode.OK_200).json({
        status: "success",
        data: userProfileResponse,
      });
    } catch (error: any) {
      // If it's another type of error, pass it to the next error handler
      next(error);
    }
  };

  /**
   * createUser
   *
   * Create a new user based on the provided input data. Validates the input data
   * and, if successful, proceeds with the user creation logic.
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  createCandidate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      global.logger.info("Create candidate [controller]");
      const userSignUpDto: UserSignUpDTO = req.body;
      const { error, value } = UserSignUpDTOValidation.validate(userSignUpDto, {
        abortEarly: false,
      });

      if (error) {
        throw new RequestValidationError(error);
      }

      //
      const count = await UserService.getCount(userSignUpDto.email);
      if (count.count > 0) {
        res
          .status(HttpStatusCode.CONFLICT_409)
          .json({ error: "User Already Exits!." });
      }

      const linkedinUrl = req.body.linkedinUrl;
      const userSocialProfileDTO: UserSocialProfileDTO = {
        linkedin: [linkedinUrl],
      };
      const userType = UserType.CAND;
      const newUser = await UserService.addUser(value, userType);
      UserSocialProfileService.create(
        userSignUpDto.email,
        userSocialProfileDTO
      );

      // Create the variable using the helper class
      let userProfilePercentageDTO: UserProfilePercentageDTO =
        UserProfilePercentageOperationHelper.createUserProfilePercentageDTO();

      // Update curPerc based on the update object
      userProfilePercentageDTO =
        UserProfilePercentageOperationHelper.updateCurPerc(
          userProfilePercentageDTO,
          value
        );

      userProfilePercentageDTO =
        UserProfilePercentageOperationHelper.updateFieldCurPercByKeys(
          userProfilePercentageDTO,
          [profilePercentageField.socialProfile]
        );

      //creating profile percentage SK for user
      UserProfilePercentageService.create(
        userSignUpDto.email,
        userProfilePercentageDTO
      );

      res.status(HttpStatusCode.CREATED_201).json(newUser);
    } catch (error) {
      // Handle errors

      // Pass the error to the next error handler
      next(error);
    }
  };

  /**
   * createUser
   *
   * Create a new user based on the provided input data. Validates the input data
   * and, if successful, proceeds with the user creation logic.
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  createEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
      global.logger.info("Create employee [controller]");
      const userSignUpDto: UserEmployeeSignUpDTO = req.body;

      const { error } = userEmployeeSignUpDTOValidation.validate(
        userSignUpDto,
        {
          abortEarly: false,
        }
      );

      if (error) {
        throw new RequestValidationError(error);
      }
      //
      const count = await UserService.getCount(userSignUpDto.email);
      if (count.count > 0) {
        res
          .status(HttpStatusCode.CONFLICT_409)
          .json({ error: "User Already Exists!." });
      }
      //
      const email = userSignUpDto.email;
      const {
        companyName,
        companySK,
        companyEmailId,
        department,
        linkedinUrl,
        ...copyUserSignUpDTO
      } = userSignUpDto;

      const userExperienceDto: UserExperienceDTO = {
        department,
        companyName,
        companySK,
        emailId: companyEmailId,
      };
      const userSocialProfileDTO: UserSocialProfileDTO = {
        linkedin: [linkedinUrl],
      };
      const userType = UserType.EMP;
      const newUser = await UserService.addUser(copyUserSignUpDTO, userType);
      UserSocialProfileService.create(email, userSocialProfileDTO);
      //The User Email table is removed and added the work related email to User Experience table
      /* UserEmailService.createEmailt(email, companyName, companyEmailId); */
      UserExperienceService.create(email, userExperienceDto);

      // Create the variable using the helper class
      let userProfilePercentageDTO: UserProfilePercentageDTO =
        UserProfilePercentageOperationHelper.createUserProfilePercentageDTO();

      // Update curPerc based on the update object
      userProfilePercentageDTO =
        UserProfilePercentageOperationHelper.updateCurPerc(
          userProfilePercentageDTO,
          copyUserSignUpDTO
        );

      userProfilePercentageDTO =
        UserProfilePercentageOperationHelper.updateCurPerc(
          userProfilePercentageDTO,
          userExperienceDto
        );

      userProfilePercentageDTO =
        UserProfilePercentageOperationHelper.updateFieldCurPercByKeys(
          userProfilePercentageDTO,
          [profilePercentageField.socialProfile]
        );

      //creating profile percentage SK for user
      UserProfilePercentageService.create(
        userSignUpDto.email,
        userProfilePercentageDTO
      );

      res.status(HttpStatusCode.CREATED_201).json(newUser);
    } catch (error) {
      // Handle errors

      // Pass the error to the next error handler
      next(error);
    }
  };

  /**
   *
   * updateEmailVerifyStatus
   *
   * Updated the email verification status of the user
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  updateEmailVerifyStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info(
        "update user primary Email status to true [controller]"
      );
      const email = req.params.id;

      const { error, value } = validateEmailField(email);

      if (error) {
        throw new RequestValidationError(error);
      }
      const verify = await UserService.verifyEmail(value);

      let userProfilePercentageDTO = await UserProfilePercentageService.get(
        value
      );
      userProfilePercentageDTO = userProfilePercentageDTO.toJSON()[0];

      userProfilePercentageDTO =
        UserProfilePercentageOperationHelper.updateFieldCurPercByKeys(
          userProfilePercentageDTO,
          [profilePercentageField.isEmailVerified]
        );

      UserProfilePercentageService.update(value, userProfilePercentageDTO);

      res.status(HttpStatusCode.OK_200).json(verify);
    } catch (error) {
      // Handle errors

      // Pass the error to the next error handler
      next(error);
    }
  };

  /**
   *
   * updateUserResume
   *
   * Updated the CV of the user
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  updateUserResume = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info("Update user resume [controller]");
      const resume = req.body.resume;
      const email = req.params.id;
      const { error, value } = validateEmailField(email);

      if (error) {
        throw new RequestValidationError(error);
      }
      const update = await UserService.updateUserCV(value, resume);

      let userProfilePercentageDTO = await UserProfilePercentageService.get(
        value
      );
      userProfilePercentageDTO = userProfilePercentageDTO.toJSON()[0];

      userProfilePercentageDTO =
        UserProfilePercentageOperationHelper.updateFieldCurPercByKeys(
          userProfilePercentageDTO,
          [profilePercentageField.CV]
        );

      UserProfilePercentageService.update(value, userProfilePercentageDTO);

      res.status(HttpStatusCode.OK_200).json(update);
    } catch (error) {
      // Handle errors
      // Pass the error to the next error handler
      next(error);
    }
  };
}

export default UserController;
