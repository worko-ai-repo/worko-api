import { Request, Response, NextFunction } from "express";
import { CompanyDTO, AddCompanyDTO } from "../dtos/Company.dto";
import CompanyService from "../services/Company.service";

class CompanyController {
  createCompany = async (req: Request, res: Response, next: NextFunction) => {
    const companyDto: CompanyDTO = req.body;
    const createdCompany = await CompanyService.addNewCompany(companyDto);

    res.status(201).json(createdCompany);
  };

  getCompanyList = async (req: Request, res: Response, next: NextFunction) => {
    const companyList = await CompanyService.getCompanyList();

    res.status(200).json(companyList);
  };

  AddCompany = async (req: Request, res: Response, next: NextFunction) => {
    console.log("controller");
    const addCompanyDto: AddCompanyDTO = req.body;
    const addCompany = await CompanyService.AddCompany(addCompanyDto);
    res.status(201).json(addCompany);
  };

  getRequestedCompanyList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const companyList = await CompanyService.getRequestedCompanies();

    res.status(200).json(companyList);
  };
}

export default CompanyController;
