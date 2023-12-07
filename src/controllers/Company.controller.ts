// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import {
  CompanyDTO,
  AddCompanyDTO,
  CompanyListResponseDto,
} from "../dtos/Company.dto";

// Load the shared service
import CompanyService from "../services/Company.service";

// Load the local schema
import {
  CompanyDTOValidation,
  CompanyRequestDTOValidation,
} from "../schemas/Company.schema";

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
      // Extract company data from the request body
      const companyDto: CompanyDTO = req.body;

      // Validate the incoming company data using the defined validation schema in CompanyDTOValidation
      const { error } = CompanyDTOValidation.validate(companyDto, {
        abortEarly: false,
      });

      // Check if validation resulted in errors
      if (error) {
        // If validation errors are present, respond with a 400 Bad Request status
        // Include a meaningful error message and details about each validation error
        return res.status(HttpStatusCode.BAD_REQUEST_400).json({
          error: "Validation Error",
          details: error.details.map((detail) => ({
            // Include the error message and the path in the data structure
            message: detail.message,
            path: detail.path,
          })),
        });
      }

      // Call the CompanyService to add a new company
      const createdCompany = await CompanyService.addNewCompany(companyDto);

      // Send successful response with the created company data
      res.status(HttpStatusCode.CREATED_201).json(createdCompany);
    } catch (error) {
      // Handle errors

      // Pass the error to the next error handler
      next(error);
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
      // Call the CompanyService to get company list
      const companyList = await CompanyService.getCompanyList();

      console.log("companyList: ", companyList);

      // Send successful response with company list data
      res.status(HttpStatusCode.OK_200).json(companyList);
    } catch (error: any) {
      // Handle errors
      // If it's another type of error, pass it to the next error handler
      next(error);
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

      // Validate the incoming company data using the defined validation schema in CompanyRequestDTOValidation
      const { error } = CompanyRequestDTOValidation.validate(addCompanyDto, {
        abortEarly: false,
      });

      // Check if validation resulted in errors
      if (error) {
        // If validation errors are present, respond with a 400 Bad Request status
        // Include a meaningful error message and details about each validation error
        return res.status(HttpStatusCode.BAD_REQUEST_400).json({
          error: "Validation Error",
          details: error.details.map((detail) => ({
            // Include the error message and the path in the data structure
            message: detail.message,
            path: detail.path,
          })),
        });
      }

      const addCompany = await CompanyService.requestNewCompany(addCompanyDto);

      res.status(HttpStatusCode.CREATED_201).json(addCompany);
    } catch (error) {
      // Handle errors

      // Pass the error to the next error handler
      next(error);
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
      // Handle errors

      // Pass the error to the next error handler
      next(error);
    }
  };
}

export default CompanyController;
