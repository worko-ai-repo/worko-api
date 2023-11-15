import { Request, Response, NextFunction } from "express";
import { CompanyDTO } from "../dtos/Company.dto";
import CompanyService from "../services/Company.service";

class CompanyController {
  createCompany = async (req: Request, res: Response, next: NextFunction) => {
    const companyDto: CompanyDTO = req.body;
    const createdCompany = await CompanyService.createNewCompany(companyDto);

    res.status(201).json(createdCompany);
  };

  getCompanyList = async (req: Request, res: Response, next: NextFunction) => {
    const companyList = await CompanyService.getCompanyList();

    res.status(200).json(companyList);
  };
}

export default CompanyController;
