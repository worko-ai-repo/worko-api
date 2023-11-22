import { Request, Response, NextFunction } from "express";
import UserService from "../services/User.service";
import UserLinkedinSignUpDTO from "../dtos/User.dto";

class UserController {
  addNewUser = async (req: Request, res: Response, next: NextFunction) => {
    // const companyDto: CompanyDTO = req.body;
    // const createdCompany = await CompanyService.createNewCompany(companyDto);
    const userSingUpDto: UserLinkedinSignUpDTO = req.body;
    const newUser = await UserService.addUser(userSingUpDto);
    res.status(201).json(newUser);
  };

  getUserByEmail = async (req: Request, res: Response, next: NextFunction) => {
    const email = req.params.email;
    console.log(email, "working");
    const result = await UserService.getUserByEmail(email);
    res.status(200).json(result);
  };
}

export default UserController;
