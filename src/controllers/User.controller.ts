// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import {
  UserDetailResponseDto,
  UserEmployeeSignUpDTO,
  UserLinkedinSignUpDTO,
} from "../dtos/User.dto";

// Load the local schema
import {
  UserLinkedinSignUpDTOValidation,
  userEmployeeSignUpDTOValidation,
} from "../schemas/User.schema";

// Load the shared service
import UserService from "../services/User.service";
import UserEmailService from "../services/UserEmail.service";
import UserExperienceService from "../services/UserExperience.service";
//Load local util statuscode
import HttpStatusCode from "../utils/http-codes.util";
import { UserType } from "../dtos/Company.dto";

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
      console.log("Get user detail by id [controller]");
      // Extract email from request parameters
      const email = req.params.id;

      // Call the UserService to get user by email
      const result = await UserService.getUserByEmail(email);

      // Check if user not found
      if (result.count === 0) {
        // If user not found, throw a specific error
        throw new Error("User not found");
      }
      // Send successful response with user data
      res.status(HttpStatusCode.OK_200).json(result);
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
      console.log("Create candidate [controller]");
      const userSingUpDto: UserLinkedinSignUpDTO = req.body;
      const { error } = UserLinkedinSignUpDTOValidation.validate(
        userSingUpDto,
        {
          abortEarly: false,
        }
      );

      if (error) {
        return res.status(HttpStatusCode.BAD_REQUEST_400).json({
          error: "Validation Error",
          details: error.details.map((detail) => ({
            message: detail.message,
            path: detail.path,
          })),
        });
      }
      const userType = UserType.CAND;
      const newUser = await UserService.addUser(userSingUpDto, userType);
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
      console.log("Create employee [controller]");
      const userSingUpDto: UserEmployeeSignUpDTO = req.body;

      const { error } = userEmployeeSignUpDTOValidation.validate(
        userSingUpDto,
        {
          abortEarly: false,
        }
      );

      if (error) {
        return res.status(HttpStatusCode.BAD_REQUEST_400).json({
          error: "Validation Error",
          details: error.details.map((detail) => ({
            message: detail.message,
            path: detail.path,
          })),
        });
      }

      const email = userSingUpDto.email;
      const {
        companyName,
        companyEmailId,
        department,
        designation,
        ...copyUserSignUpDTO
      } = userSingUpDto;
      const userType = UserType.EMP;
      const newUser = await UserService.addUser(copyUserSignUpDTO, userType);
      await UserEmailService.createEmailt(email, companyName, companyEmailId);
      await UserExperienceService.createExperience(
        email,
        department,
        designation
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
      console.log("update EmailVerify Status [controller]");
      const email = req.params.id;
      const verify = await UserService.verifyEmail(email);
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
      console.log("Update user resume [controller]");
      const resume = req.body.resume;
      const email = req.params.id;
      const update = await UserService.updateUserCV(email, resume);
      res.status(HttpStatusCode.OK_200).json(update);
    } catch (error) {
      // Handle errors
      // Pass the error to the next error handler
      next(error);
    }
  };
}

export default UserController;
