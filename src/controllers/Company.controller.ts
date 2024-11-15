// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load dynamoose library and types
import { QueryResponse } from "dynamoose/dist/ItemRetriever";
import { AnyItem } from "dynamoose/dist/Item";

// Load the local dtos
import {
  CompanyDTO,
  AddCompanyDTO,
  CompanyListingFilterOptions,
  CompanyListingFilterRequestDTO,
  CompanyRequestDTO,
} from "../dtos/Company.dto";
import { RecordListingResponseDTO } from "../dtos/Common.dto";

// Import Helpers
import { RequestHelper } from "../helpers/request.helper";

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
import { paginationResponseHelperObj } from "../helpers/pagination-response.helper";

/**
 * CompanyController
 *
 * Class to perform related/relevent action/activities related to the "company" table
 */
class CompanyController {
  /**
   * getCompanyDetailById
   *
   * Retrieves company details based on the provided companyId.
   *
   * @param {Request} req - The request object
   * @param {Response} res - The response object
   * @param {NextFunction} next - The next function
   */
  getCompanyDetailById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const companyId: string = req.params.companyId as string;

      const companyDetails = await CompanyService.getCompanyDetailById(
        companyId
      );

      res.status(HttpStatusCode.OK_200).json(companyDetails);
    } catch (error: any) {
      // Pass the error to the next error handler
      next(error);
    }
  };

  updateCompany = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract company data from the request body
      const companyDto: CompanyRequestDTO = req.body;
      // Extract company id from the request query parameter
      const companyId: string = req.params.id as string;
      // Validate the incoming company data using the defined validation schema in CompanyDTOValidation
      const { error } = CompanyDTOValidation.validate(companyDto, {
        abortEarly: false,
      });

      // Check if validation resulted in errors
      if (error) {
        throw new RequestValidationError(error);
      }

      const updateCompanyDTO: CompanyDTO = {
        ...companyDto,
        isVerified: true,
      };

      // Call the CompanyService to update a  company
      const updateCompany = await CompanyService.updateCompany(
        updateCompanyDTO,
        companyId
      );

      // Send successful response with the created company data
      res.status(HttpStatusCode.OK_200).json(updateCompany);
    } catch (error) {
      // Handle errors

      // Pass the error to the next error handler
      next(error);
    }
  };
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
      const companyDto: CompanyRequestDTO = req.body;
      // Check if company name already exist
      // Call the CompanyService to get company by name
      const company = await CompanyService.getCompanyByName(companyDto.name);
      if (company.count) {
        throw new Error("Company name already exist");
      }

      // const companyList = await CompanyService.getCompanyList({
      //    companyName: companyDto.name,
      //    industryName: "",
      //    pageSize: 25
      //  });
      // // check array companyList size is more than 0
      // if (companyList.length > 0) {
      //   throw new Error("Company name already exist");
      // }

      // Validate the incoming company data using the defined validation schema in CompanyDTOValidation
      const { error } = CompanyDTOValidation.validate(companyDto, {
        abortEarly: false,
      });

      // Check if validation resulted in errors
      if (error) {
        throw new RequestValidationError(error);
      }

      const addCompanyDTO: CompanyDTO = {
        ...companyDto,
        isVerified: true,
      };
      // Call the CompanyService to add a new company
      const createdCompany = await CompanyService.addNewCompany(addCompanyDTO);

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
   * REFERENCE TUTORIAL[Typescript Generics]: https://youtu.be/EcCTIExsqmI?si=3g9M7sVRUeoL3dj7
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  getCompanyList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Only the filter condition/details required for filtering the records
      const recordListingFilterRequest: CompanyListingFilterOptions =
        RequestHelper.parseFilterOptions<
          CompanyListingFilterRequestDTO,
          CompanyListingFilterOptions
        >(req.query as unknown as CompanyListingFilterRequestDTO);

      // Set isVerified to true (1) before passing to the service
      recordListingFilterRequest.isVerified = 1;

      // Call the CompanyService to get company list
      const companyList = await CompanyService.getCompanyList(
        recordListingFilterRequest
      );

      // Generate pagination response
      const companyListResponse: RecordListingResponseDTO<
        QueryResponse<AnyItem>
      > = paginationResponseHelperObj.paginationRecordListingResponse<
        QueryResponse<AnyItem>,
        CompanyListingFilterOptions
      >(companyList, recordListingFilterRequest);

      // Send successful response with company list data
      res.status(HttpStatusCode.OK_200).json(companyListResponse);
    } catch (error) {
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

      // Convert the input to uppercase
      beginsWith = beginsWith.toUpperCase();

      // Call the CompanyService to get the company list
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

      const companyName = addCompanyDto.companyDetail.name as string;
      const company = await CompanyService.getRequestedCompanyByName(
        companyName
      );
      if (company.count) {
        return res
          .status(HttpStatusCode.CONFLICT_409)
          .json({ error: "Company has already been added to Request List" });
      }

      const addCompany = await CompanyService.requestNewCompany(addCompanyDto);

      let requestedCompany: CompanyDTO = {
        name: addCompanyDto.companyDetail.name as string,
        industry: (addCompanyDto.companyDetail.industry as string) ?? "",
        teamSize: (addCompanyDto.companyDetail.teamSize as number) ?? 0,
        carrierPage: addCompanyDto.companyDetail.carrierPage as string,
        linkedIn: addCompanyDto.companyDetail.linkedIn as string,
        logoUrl: (addCompanyDto.companyDetail.logoUrl as string) ?? "",
        logo: (addCompanyDto.companyDetail.logo as string) ?? "",
        isVerified: false,
      };

      const createdCompany = await CompanyService.addNewCompany(
        requestedCompany
      );

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

  getAllCompanyNames = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const companyNames = await CompanyService.getAllCompanyNames();
      res.status(HttpStatusCode.OK_200).json(companyNames);
    } catch (error: any) {
      next(error);
    }
  };
}

export default CompanyController;
