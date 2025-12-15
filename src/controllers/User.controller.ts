// Load npm packages
import { DateTime } from "luxon";
import { Request, Response, NextFunction } from "express";

// Load local configs
// import { profilePercentageField } from "../configs/constants/UserProfilePercentage.constant";

// Import dynamoose types
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Load the local dtos
import {
  NewUserCandSignUpDTO,
  NewUserEmpSignUpDTO,
  UserDetailSettingCreateApiDTO,
  UserEmployeeSignUpDTO,
  UserParseCvRequestApiDto,
  UserParseCvResponseDto,
  UserPartialCvExtractDetailUpdateApiDto,
  UserProfileResponse,
  UserSignUpDTO,
  UserUpdateResumeDto,
} from "../dtos/User.dto";
import { UserType } from "../dtos/Company.dto";
import { UserExperienceDTO } from "../dtos/UserExperience.dto";
import { UserSocialProfileDTO } from "../dtos/UserSocialProfile.dto";
// import { UserProfilePercentageDTO } from "../dtos/UserProfilePercentage.dto";

// Load the local schema
import {
  UserSignUpDTOValidation,
  userDetailSettingsDTOValidation,
  userEmployeeSignUpDTOValidation,
  userParseCvRequestApiDTOValidation,
  userPartialCvExtractDetailUpdateApiDtoValidation,
  userUpdateResumeDtoValidation,
  userlastAccessedDashDTOValidation,
  validateEmailField,
} from "../schemas/User.schema";

// Load the shared service
import UserService from "../services/User.service";
import UserEmailService from "../services/UserEmail.service";
import UserExperienceService from "../services/UserExperience.service";
import UserDetailService from "../services/UserDetail.service";
import UserSocialProfileService from "../services/UserSocialProfile.service";
// import UserProfilePercentageService from "../services/UserProfilePercentage.service";

// Load local helper
// import { UserProfilePercentageOperationHelper } from "../helpers/ProfilePercentageOperations.helper";

// Import models
import { DbUserDetailSettingDto } from "../db/models/UserDetailSetting.model";
import { DbUserDetailDto } from "../db/models/UserDetail.model";
import { DbUserSkillDto } from "../db/models/UserSkill.model";
import { DbUserPreferenceDto } from "../db/models/UserPreference.model";
import { DbUserAchievementDto } from "../db/models/UserAchievement.model";

// Load local service
import InvokeLambdaService from "../services/InvokeLambda.service";

// Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

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
   * getUserBasicDetails
   *
   * Get the user basic details
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  getUserBasicDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info("Get user basic details [controller]");

      // Extract the userId from the response locals
      const cognitoUserId: string = global.requestLocalContext.userId;

      // Call the UserService to get user basic details
      const userBasicDetails: Partial<DbUserDetailDto> &
        Partial<DbUserSkillDto> &
        Partial<DbUserPreferenceDto> &
        Partial<DbUserAchievementDto> = await UserService.getUserBasicDetails(
        cognitoUserId
      );

      // Send successful response
      return res.status(HttpStatusCode.OK_200).json(userBasicDetails);
    } catch (error: any) {
      // If it's another type of error, pass it to the next error handler
      next(error);
    }
  };

  /**
   * updateLastAccessedDash
   *
   * Update user's lastAccessedDash based on the provided query parameters
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  updateLastAccessedDash = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Extract email from request parameters
      const email = req.params.id;

      // Extract user profile response from request body
      const requestBody: string = req.body.lastAccessedDash;

      // Validate the request body against the Joi schema
      const { error } = userlastAccessedDashDTOValidation.validate(
        requestBody,
        {
          abortEarly: false, // Return all errors, not just the first one
          allowUnknown: true, // Allow unknown keys (optional based on your needs)
        }
      );

      // If validation fails, throw an error
      if (error) {
        throw new RequestValidationError(error);
      }

      // Validate email
      const { error: emailError, value: emailId } = validateEmailField(email);

      // If email validation fails, throw a RequestValidationError
      if (emailError) {
        throw new RequestValidationError(emailError);
      }

      // Update last accessed dashboard for the user
      const updatedDetails = await UserDetailService.updateLastAccessedDash(
        emailId,
        requestBody
      );

      // Return success response with updated details
      res.status(HttpStatusCode.OK_200).json({
        status: "Updated Successfully",
        data: updatedDetails,
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * createCandidate
   *
   * Creates a new candidate user based on the provided input data. This function performs the following steps:
   * 1. Validates the input data using the UserSignUpDTOValidation schema.
   * 2. Checks if a user with the given email already exists.
   * 3. Prepares additional user data (social profile, user type, email list, etc.).
   * 4. Creates a new user in the database.
   * 5. Creates a social profile for the user.
   * 6. Initializes and updates the user's profile completion percentage.
   * 7. Triggers resume extraction if a CV is provided.
   *
   * @param {Request} req - Express request object containing user sign-up data in the body.
   * @param {Response} res - Express response object used to send back the API response.
   * @param {NextFunction} next - Express next function for error handling.
   * @throws {RequestValidationError} If the input data fails validation.
   * @throws {Error} Any other errors that occur during the process.
   */
  createCandidate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      global.logger.info("Create candidate [controller]");

      // Extract user sign-up data from request body
      const userSignUpDTO: UserSignUpDTO = req.body;

      // Validate the input data using Joi schema
      const { error, value: userSignUpDto } = UserSignUpDTOValidation.validate(
        userSignUpDTO,
        {
          abortEarly: false,
        }
      );

      // If validation fails, throw a custom error
      if (error) {
        throw new RequestValidationError(error);
      }

      // Check if a user with this email already exists
      const existingUserDetails: QueryResponse<DbUserDetailDto> =
        await UserDetailService.get(userSignUpDto.email);
      if (existingUserDetails.count > 0) {
        return res
          .status(HttpStatusCode.CONFLICT_409)
          .json({ error: "The user with this provided email already exists." });
      }

      // Extract LinkedIn URL for social profile
      const linkedinUrl = req.body.linkedinUrl;
      const userSocialProfileDTO: UserSocialProfileDTO = {
        linkedin: [linkedinUrl],
      };

      // Set up additional user data
      const userType = UserType.CAND;
      const emailList = { primary: userSignUpDto.email };
      let userCandSignUpDto: NewUserCandSignUpDTO = {
        ...userSignUpDto,
        id: userSignUpDto.userId,
        emailList: emailList,
        userType: [userType],
        isEmailVerified: false,
        isNumberVerified: false,
        lastAccessedDash: userType,
        referralCount: 0,
        expiryDate: DateTime.now().toJSDate(), // Note: It is dummy value, it is being updated later in the process
        isSubscribed: false,
      };

      // Create the new user in the database
      const newUser = await UserService.createNewUser(
        userCandSignUpDto,
        userType
      );

      // Create a social profile for the user
      UserSocialProfileService.create(
        userSignUpDto.email,
        userSocialProfileDTO
      );

      /*
      WARNING: Do not remove this commented code because we may
      use this in near future

      NOTE: In `2024` we used `angular` in frontend and in that we used to have
      profile percentage for user(candidate, employee) but now we are not
      using it, so we are commenting this code to stop calculating the profile percentage
      for new users

      // Initialize the user's profile completion percentage
      let userProfilePercentageDTO: UserProfilePercentageDTO =
        UserProfilePercentageOperationHelper.createUserProfilePercentageDTO();
      global.logger.debug("userProfilePercentageDTO: ", {
        filePath: __filename,
        methodName: this.createCandidate.name,
        userProfilePercentageDTO,
      });

      // Update current percentage based on the validated data
      userProfilePercentageDTO =
        UserProfilePercentageOperationHelper.updateCurPerc(
          userProfilePercentageDTO,
          userSignUpDto
        );

      // Create a profile percentage record for the user
      UserProfilePercentageService.create(
        userSignUpDto.email,
        userProfilePercentageDTO
      );
      */

      // If a CV is provided, trigger asynchronous resume extraction
      if (userSignUpDto.CV) {
        await InvokeLambdaService.triggerResumeExtraction(userSignUpDto.email);
      }

      // Respond with the newly created user data
      res.status(HttpStatusCode.CREATED_201).json(newUser);
    } catch (error) {
      global.logger.error(`Error in create candidate [controller]`,{
        filePath: __filename,
        methodName: this.createCandidate.name,
        error
      });
      // Any errors that occur (validation, database, etc.) are passed to the global error handler
      next(error);
    }
  };

  /**
   * createEmployee
   *
   * Creates a new employee user based on the provided input data. This function performs the following steps:
   * 1. Validates the input data using the userEmployeeSignUpDTOValidation schema.
   * 2. Checks if a user with the given email already exists.
   * 3. Prepares additional user data (user type, email list, etc.).
   * 4. Creates a new user in the database.
   * 5. Extracts and sets up work-related information (department, company details).
   * 6. Creates a social profile for the user.
   * 7. Stores the user's work experience details.
   * 8. Initializes and updates the user's profile completion percentage.
   *
   * @param {Request} req - Express request object containing employee sign-up data in the body.
   * @param {Response} res - Express response object used to send back the API response.
   * @param {NextFunction} next - Express next function for error handling.
   * @throws {RequestValidationError} If the input data fails validation.
   * @throws {Error} Any other errors that occur during the process.
   */
  createEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
      global.logger.info("Create employee [controller]");

      // Extract employee sign-up data from request body
      const userSignUpDTO: UserEmployeeSignUpDTO = req.body;

      // Validate the input data using Joi schema
      const { error, value: userSignUpDto } =
        userEmployeeSignUpDTOValidation.validate(userSignUpDTO, {
          abortEarly: false,
        });

      // If validation fails, throw a custom error
      if (error) {
        throw new RequestValidationError(error);
      }

      // Check if a user with this email already exists
      const existingUserDetails: QueryResponse<DbUserDetailDto> =
        await UserDetailService.get(userSignUpDto.email);
      if (existingUserDetails.count > 0) {
        return res
          .status(HttpStatusCode.CONFLICT_409)
          .json({ error: "The user with this provided email already exists." });
      }

      // Extract core user information
      const email = userSignUpDto.email;
      const userType = UserType.EMP;
      const emailList = { primary: userSignUpDto.email };

      // Set up additional user data for employee
      let userEmpSignUpDto: NewUserEmpSignUpDTO = {
        ...userSignUpDto,
        id: userSignUpDto.userId,
        emailList: emailList,
        userType: [userType],
        isEmailVerified: false,
        isNumberVerified: false,
        lastAccessedDash: userType,
        referralCount: 0,
        isSubscribed: false,
        expiryDate: DateTime.now().toJSDate(), // Note: No trial period for employees?
      };

      // Prepare work experience data
      const userExperienceDto: UserExperienceDTO = {
        department: userSignUpDto.department,
        companyName: userSignUpDto.companyName,
        companyId: userSignUpDto.companySK.split("#").pop() as string, // Extracting ID from SK
        emailId: userSignUpDto.companyEmailId,
      };

      // Create the new user in the database
      const newUser = await UserService.createNewUser(
        userEmpSignUpDto,
        userType
      );

      // Destructure to separate common user data from work-related data
      const {
        companyName,
        companySK,
        companyEmailId,
        department,
        linkedinUrl,
        ...copyUserSignUpDTO
      } = userSignUpDto;

      // Set up social profile data
      const userSocialProfileDTO: UserSocialProfileDTO = {
        linkedin: [linkedinUrl],
      };
      UserSocialProfileService.create(email, userSocialProfileDTO);

      // Store user's work experience
      /* UserEmailService.createEmailt(email, companyName, companyEmailId); */
      // Note: Previous comment suggests UserEmail table is no longer used
      UserExperienceService.createUserExperience(email, userExperienceDto);

      /*
      WARNING: Do not remove this commented code because we may
      use this in near future

      NOTE: In `2024` we used `angular` in frontend and in that we used to have
      profile percentage for user(candidate, employee) but now we are not
      using it, so we are commenting this code to stop calculating the profile percentage
      for new users

      // Initialize the user's profile completion percentage
      let userProfilePercentageDTO: UserProfilePercentageDTO =
        UserProfilePercentageOperationHelper.createUserProfilePercentageDTO();

      // Update current percentage based on common user data
      userProfilePercentageDTO =
        UserProfilePercentageOperationHelper.updateCurPerc(
          userProfilePercentageDTO,
          copyUserSignUpDTO
        );

      // Further update percentage based on work experience data
      userProfilePercentageDTO =
        UserProfilePercentageOperationHelper.updateCurPerc(
          userProfilePercentageDTO,
          userExperienceDto
        );

      // Create a profile percentage record for the user
      UserProfilePercentageService.create(
        userSignUpDto.email,
        userProfilePercentageDTO
      );
      */

      // Respond with the newly created user data
      res.status(HttpStatusCode.CREATED_201).json(newUser);
    } catch (error) {
      // Any errors that occur (validation, database, etc.) are passed to the global error handler
      next(error);
    }
  };

  /**
   * createUserDetailSetting
   *
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @param {NextFunction} next - Express next function for error handling.
   * @throws {RequestValidationError} If the input data fails validation.
   * @throws {BaseError} Any other errors that occur during the process.
   */
  createUserDetailSetting = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // logger
      global.logger.info(`Create User Detail Settings [controller]`, {
        filePath: __filename,
        methodName: this.createUserDetailSetting.name,
      });

      // Extract the userId from the response locals
      const cognitoUserId: string = global.requestLocalContext.userId;

      // Parse the user details
      const userDetails: DbUserDetailDto = await UserService.getUserDetailsById(
        cognitoUserId
      );

      // Extract and validate the data from request body and throw error if not valid
      const reqBody: UserDetailSettingCreateApiDTO = req.body;
      const { error: reqBodyError, value: validatedRequestBody } =
        userDetailSettingsDTOValidation.validate(reqBody, {
          abortEarly: false,
        });
      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }

      const userDetailSettings: DbUserDetailSettingDto =
        await UserService.createUserDetailSetting(
          userDetails.PK.split("#")[2],
          validatedRequestBody
        );

      return res.status(HttpStatusCode.CREATED_201).json(userDetailSettings);
    } catch (error) {
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

      /*
      WARNING: Do not remove this commented code because we may
      use this in near future

      NOTE: In `2024` we used `angular` in frontend and in that we used to have
      profile percentage for user(candidate, employee) but now we are not
      using it, so we are commenting this code to stop calculating the profile percentage
      for new users

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
      */

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
      const requestBody: UserUpdateResumeDto = req.body;

      const { error: requestBodyError, value: validatedRequestBody } = userUpdateResumeDtoValidation.validate(
        requestBody,
        { abortEarly: false }
      );

      if (requestBodyError) {
        throw new RequestValidationError(requestBodyError);
      }

      const { resume, userCvFileName, isCvExtracted } = validatedRequestBody;
      const email = req.params.id;
      const { error, value } = validateEmailField(email);

      if (error) {
        throw new RequestValidationError(error);
      }

      // Check if user exists or not and throw error if not
      const userDetails: QueryResponse<DbUserDetailDto> =
        await UserDetailService.get(email);
      if (!userDetails.count) {
        return res
          .status(HttpStatusCode.CONFLICT_409)
          .json({ error: "User Does Not Exist." });
      }

      const update = await UserService.updateUserCV(
        value,
        resume,
        userCvFileName,
        isCvExtracted
      );

      /*
      WARNING: Do not remove this commented code because we may
      use this in near future

      NOTE: In `2024` we used `angular` in frontend and in that we used to have
      profile percentage for user(candidate, employee) but now we are not
      using it, so we are commenting this code to stop calculating the profile percentage
      for new users

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
      */

      // Trigger for Resume extraction
      await InvokeLambdaService.triggerResumeExtraction(email);

      return res.status(HttpStatusCode.OK_200).json(update);
    } catch (error) {
      // Handle errors
      // Pass the error to the next error handler
      next(error);
    }
  };

  parseCv = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqBody: UserParseCvRequestApiDto = req.body;
      global.logger.info("reqBody: ", {
        s3ResumeId: reqBody.s3ResumeId,
        methodName: this.parseCv.name,
      });

      const { error: reqBodyError, value: validatedRequestBody } =
        userParseCvRequestApiDTOValidation.validate(reqBody, {
          abortEarly: false,
        });
      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }

      const response: UserParseCvResponseDto = await UserService.parseCv(
        validatedRequestBody
      );
      return res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error("Error in parse cv [controller]", {
        methodName: this.parseCv.name,
        error: error,
      });

      next(error);
    }
  };

  updatePartialCvExtractDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqBody: UserPartialCvExtractDetailUpdateApiDto = req.body;

      const { error: reqBodyError, value: validatedRequestBody } =
        userPartialCvExtractDetailUpdateApiDtoValidation.validate(reqBody, {
          abortEarly: false,
        });
      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }

      const userRegisteredEmail: string = req.params.registeredEmail;
      const { error, value } = validateEmailField(userRegisteredEmail);
      if (error) {
        throw new RequestValidationError(error);
      }

      const response: boolean = await UserService.updatePartialCvExtractDetails(
        userRegisteredEmail,
        validatedRequestBody
      );
      return res.status(HttpStatusCode.OK_200).json({
        isUpdated: response,
      });
    } catch (error) {
      global.logger.error("Error in partial update cv extract details [controller]", {
        methodName: this.updatePartialCvExtractDetails.name,
        error: error,
      });

      next(error);
    }
  };
}

export default UserController;
