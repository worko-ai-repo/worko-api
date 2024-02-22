// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import {
  CompanyDTO,
  AddCompanyDTO,
  CompanyListingFilterOptions,
  CompanyListingFilterRequestDTO,
} from "../dtos/Company.dto";
import {
  RecordListingFilterOptions,
  RecordListingFilterRequestDTO,
  RecordListingResponseDTO,
} from "../dtos/Common.dto";

// Import Helpers
import { RequestHelper } from "../helpers/request.helper";
import { lastKeyToBase64EncodeStr } from "../helpers/dynamoose.helper";

// Load the shared service
import CompanyService from "../services/Company.service";

// Load the local schema
import {
  CompanyDTOValidation,
  CompanyRequestDTOValidation,
} from "../schemas/Company.schema";

//Load local util statuscode
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

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
        throw new RequestValidationError(error);
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
   * getCompanyList
   *
   * Get companies based on the provided filters
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  getCompanyList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Only the filter condition/details required for filtering the records
      const recordListingFilterRequest: CompanyListingFilterOptions =
        RequestHelper.parseFilterOptions(
          req.query as unknown as CompanyListingFilterRequestDTO
        );

      // Call the CompanyService to get company list
      const companyList = await CompanyService.getCompanyList(
        recordListingFilterRequest
      );

      // Response
      const response: RecordListingResponseDTO = {
        data: companyList,
        pagination: {
          count: companyList.count,
          queriedCount: companyList.queriedCount,
          pageSize: recordListingFilterRequest.pageSize,
          lastKey: lastKeyToBase64EncodeStr(companyList.lastKey),
        },
      };

      // Send successful response with company list data
      res.status(HttpStatusCode.OK_200).json(response);
    } catch (error: any) {
      // Let "app.ts" and/or expressjs handle the error
      next(error);
    }
  };

  /**
   * getCompany by beginsith name
   *
   * Get companies based on the provided filters
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  getByBeginsWith = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let beginsWith = req.params.beginsWith;
      // Capitalizing  the first letter if it's in lowercase :

      if (beginsWith[0] === beginsWith[0].toLowerCase()) {
        beginsWith = beginsWith.charAt(0).toUpperCase() + beginsWith.slice(1);
      }
      console.log(`company is ${beginsWith}`);

      // Call the CompanyService to get company list
      const companyList = await CompanyService.getByBeginsWith(beginsWith);

      // Send successful response with company list data
      res.status(HttpStatusCode.OK_200).json(companyList);
    } catch (error: any) {
      // Let "app.ts" and/or expressjs handle the error
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
        throw new RequestValidationError(error);
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
