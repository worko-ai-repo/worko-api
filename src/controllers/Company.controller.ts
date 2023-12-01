// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import { CompanyDTO, AddCompanyDTO } from "../dtos/Company.dto";

// Load the shared service
import CompanyService from "../services/Company.service";

//Load local util statuscode
import HttpStatusCode from "../utils/http-codes.util";

/**
 * CompanyController
 *
 * Class to perform related/relevent action/activities related to the "company" table
 */
class CompanyController {
  /**
   *createCompany
   *
   * create a new company based on the provided input data. Validates the input data
   * and, if successful, proceeds with the company creation logic.
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  createCompany = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyDto: CompanyDTO = req.body;
      const createdCompany = await CompanyService.addNewCompany(companyDto);

      res.status(HttpStatusCode.CREATED_201).json(createdCompany);
    } catch (error) {
      throw error;
    }
  };

  /**
   *getCompanyList
   *
   * Get company details in list
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  getCompanyList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyList = await CompanyService.getCompanyList();

      res.status(HttpStatusCode.OK_200).json(companyList);
    } catch (error) {
      throw error;
    }
  };

  /**
   *
   *requestCompany
   *
   * create a new request for company based on the provided input data. Validates the input data
   * and, if successful, proceeds with the request company creation logic.
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  requestCompany = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const addCompanyDto: AddCompanyDTO = req.body;
      const addCompany = await CompanyService.requestNewCompany(addCompanyDto);
      res.status(HttpStatusCode.CREATED_201).json(addCompany);
    } catch (error) {
      throw error;
    }
  };

  /**
   *
   * getRequestedCompanyList
   *
   * Get the requested company list for admin
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  getRequestedCompanyList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const companyList = await CompanyService.getRequestedCompanies();

      res.status(HttpStatusCode.OK_200).json(companyList);
    } catch (error) {
      throw error;
    }
  };
}

export default CompanyController;
