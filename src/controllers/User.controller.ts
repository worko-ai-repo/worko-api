import { Request, Response, NextFunction } from "express";
import UserService from "../services/User.service";
import {
  UserLinkedinSignUpDTO,
  UserReferralRequestDTO,
} from "../dtos/User.dto";

class UserController {
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  getUserByEmail = async (req: Request, res: Response, next: NextFunction) => {
    const email = req.params.email;
    console.log(email, "working");
    const result = await UserService.getUserByEmail(email);
    res.status(200).json(result);
  };

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  getsubscriptionDetailsByEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const email = req.params.email;
    const result = await UserService.getsubscriptionDetails(email);
    res.status(200).json(result);
  };

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  addNewUser = async (req: Request, res: Response, next: NextFunction) => {
    // const companyDto: CompanyDTO = req.body;
    // const createdCompany = await CompanyService.createNewCompany(companyDto);
    const userSingUpDto: UserLinkedinSignUpDTO = req.body;
    const email = req.params.email;
    const newUser = await UserService.addUser(userSingUpDto, email);
    res.status(201).json(newUser);
  };

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  newReferralRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const referralRequest: UserReferralRequestDTO = req.body;
    const email = req.params.email;
    const newreferral = await UserService.referralRequest(
      referralRequest,
      email
    );
    res.status(201).json(newreferral);
  };
}

export default UserController;
