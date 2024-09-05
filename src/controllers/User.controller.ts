// Load npm packages
import { DateTime } from "luxon";
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import {
  NewUserCandSignUpDTO,
  NewUserEmpSignUpDTO,
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
import InvokeLambdaService from "../services/InvokeLambda.service";
import { EmailSourceDestinationAddress } from "../libraries/email.library";
import { EmailTemplatePlaceholderCAND_WELCOME_MSG } from "../dtos/EmailTemplatePlaceholder.dto";

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
      const lastAccessedDash = req.body.lastAccessedDash;

      // Validate email
      const { error: emailError, value: emailId } = validateEmailField(email);

      // If email validation fails, throw a RequestValidationError
      if (emailError) {
        throw new RequestValidationError(emailError);
      } 

      // Fetch SK (Sort Key) for the user
      // @todo If you wish to get the User Details, consider using UserDetailService.get(email)
      const SK = await UserService.getSK(emailId); 

      // Check if SK is null or indicates an error
      if (!SK) {
        // If user not found, return 404 status with error message
        return res.status(404).json({ error: "User not found" });
      }

      // Update last accessed dashboard for the user
      const updatedDetails = await UserService.updateLastAccessedDash(emailId,lastAccessedDash);

      // Return success response with updated details
      res.status(HttpStatusCode.OK_200).json({
        status: "Updated Successfully",
        data: updatedDetails,
      });
    } catch (error: any) {
      next(error)
    }
  }

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
      const userSignUpDto: UserSignUpDTO = req.body;

      // Validate the input data using Joi schema
      const { error, value } = UserSignUpDTOValidation.validate(userSignUpDto, {
        abortEarly: false,
      });

      // If validation fails, throw a custom error
      if (error) {
        throw new RequestValidationError(error);
      }

      // Check if a user with this email already exists
      const count = await UserService.getCount(userSignUpDto.email);
      if (count.count > 0) {
        res
          .status(HttpStatusCode.CONFLICT_409)
          .json({ error: "User Already Exists!." });
        return; // Important to return here to prevent further execution
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
        userRole:userType,
        isEmailVerified: false,
        isNumberVerified: false,
        lastAccessedDash: userType,
        referralCount: 0,
        expiryDate: DateTime.now().toJSDate(), // Note: It is dummy value, it is being updated later in the process
        isSubscribed: false,
      };

      // Create the new user in the database
      const newUser = await UserService.addUser(userCandSignUpDto, userType);

      // Create a social profile for the user
      UserSocialProfileService.create(
        userSignUpDto.email,
        userSocialProfileDTO
      );

      // Initialize the user's profile completion percentage
      let userProfilePercentageDTO: UserProfilePercentageDTO =
        UserProfilePercentageOperationHelper.createUserProfilePercentageDTO();

      // Update current percentage based on the validated data
      userProfilePercentageDTO =
        UserProfilePercentageOperationHelper.updateCurPerc(
          userProfilePercentageDTO,
          value
        );

      // Update field-specific percentages (in this case, for social profile)
      userProfilePercentageDTO =
        UserProfilePercentageOperationHelper.updateFieldCurPercByKeys(
          userProfilePercentageDTO,
          [profilePercentageField.socialProfile]
        );

      // Create a profile percentage record for the user
      UserProfilePercentageService.create(
        userSignUpDto.email,
        userProfilePercentageDTO
      );

      // If a CV is provided, trigger asynchronous resume extraction
      if (userSignUpDto.CV) {
        InvokeLambdaService.triggerResumeExtraction(userSignUpDto.email);
      }

      // Respond with the newly created user data
      res.status(HttpStatusCode.CREATED_201).json(newUser);
    } catch (error) {
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
    const userSignUpDto: UserEmployeeSignUpDTO = req.body;

    // Validate the input data using Joi schema
    const { error } = userEmployeeSignUpDTOValidation.validate(
      userSignUpDto,
      {
        abortEarly: false,
      }
    );

    // If validation fails, throw a custom error
    if (error) {
      throw new RequestValidationError(error);
    }

    // Check if a user with this email already exists
    const count = await UserService.getCount(userSignUpDto.email);
    if (count.count > 0) {
      res
        .status(HttpStatusCode.CONFLICT_409)
        .json({ error: "User Already Exists!." });
      return; // Important to return here to prevent further execution
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
      userRole:userType,
      isEmailVerified: false,
      isNumberVerified: false,
      lastAccessedDash: userType,
      referralCount: 0,
      isSubscribed: false,
      expiryDate: DateTime.now().toJSDate(),  // Note: No trial period for employees?
    };

    // Prepare work experience data
    const userExperienceDto: UserExperienceDTO = {
      department: userSignUpDto.department,
      companyName: userSignUpDto.companyName,
      companyId: userSignUpDto.companySK.split("#").pop() as string,  // Extracting ID from SK
      emailId: userSignUpDto.companyEmailId,
    };
    
    // Create the new user in the database
    const newUser = await UserService.addUser(userEmpSignUpDto, userType);
    
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
    UserExperienceService.create(email, userExperienceDto);

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

    // Update field-specific percentages (in this case, for social profile)
    userProfilePercentageDTO =
      UserProfilePercentageOperationHelper.updateFieldCurPercByKeys(
        userProfilePercentageDTO,
        [profilePercentageField.socialProfile]
      );

    // Create a profile percentage record for the user
    UserProfilePercentageService.create(
      userSignUpDto.email,
      userProfilePercentageDTO
    );

    // Respond with the newly created user data
    res.status(HttpStatusCode.CREATED_201).json(newUser);
  } catch (error) {
    // Any errors that occur (validation, database, etc.) are passed to the global error handler
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

      const userCount = await UserService.getCount(email);
      if (!userCount.count) {
        return res.status(HttpStatusCode.CONFLICT_409).json({ error: "User Does Not Exist." });
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
        // Trigger for Resume extraction
      InvokeLambdaService.triggerResumeExtraction(email)

      res.status(HttpStatusCode.OK_200).json(update);
      
    } catch (error) {
      // Handle errors
      // Pass the error to the next error handler
      next(error);
    }
  };
}

export default UserController;
