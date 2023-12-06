// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import { UserLinkedinSignUpDTO } from "../dtos/User.dto";

// Load the local schema
import { UserLinkedinSignUpDTOValidation } from "../schemas/User.schema";

// Load the shared service
import UserService from "../services/User.service";

//Load local util statuscode
import HttpStatusCode from "../utils/http-codes.util";

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
  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // const companyDto: CompanyDTO = req.body;
      // const createdCompany = await CompanyService.createNewCompany(companyDto);
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
      const newUser = await UserService.addUser(userSingUpDto);
      res.status(HttpStatusCode.CREATED_201).json(newUser);
    } catch (error) {
      // Handle errors

      // Pass the error to the next error handler
      next(error);
    }
  };
}

export default UserController;
