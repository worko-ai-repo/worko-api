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
      const email = req.params.id;
      const result = await UserService.getUserByEmail(email);
      res.status(HttpStatusCode.OK_200).json(result);
    } catch (error) {
      throw error;
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
      const email = req.params.id;
      const newUser = await UserService.addUser(userSingUpDto, email);
      res.status(HttpStatusCode.CREATED_201).json(newUser);
    } catch (error) {
      throw error;
    }
  };
}

export default UserController;
