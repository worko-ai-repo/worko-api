// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load dynamoose library
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Load the local dtos
import {
  CompanyDTO,
  AddCompanyDTO,
  CompanyListingFilterOptions,
  CompanyListingFilterRequestDTO,
  CompanyRequestDTO,
  CompanyUpdateApiDto,
  CompanyUpdateDto,
  CompanyUpdateLogoApiDto,
} from "../dtos/Company.dto";
import {
  PaginatedResultsWithMatchingConditionsResponse,
  RecordListingResponseDTO,
} from "../dtos/Common.dto";
import {
  CompanyRequestListingFilterOptions,
  CompanyRequestListingFilterRequestDTO,
} from "../dtos/CompanyRequest.dto";

// Import Helpers
import { RequestHelper } from "../helpers/request.helper";
import { paginationResponseHelperObj } from "../helpers/pagination-response.helper";

// Load the local models
import { DbCompanyDetailDto } from "../db/models/CompanyDetail.model";
import { DbCompanyRequestDto } from "../db/models/CompanyRequest.model";

// Load the shared service
import CompanyService from "../services/Company.service";

// Load the local schema
import {
  CompanyDTOValidation,
  CompanyListingFilterRequestDTOValidation,
  CompanyRequestDTOValidation,
  CompanyUpdateApiDtoValidation,
  companyUpdateLogoApiDtoValidation,
} from "../schemas/Company.schema";
import { companyRequestFilterDtoValidation } from "../schemas/CompanyRequest.schema";

//Load local util statuscode
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError, RequestValidationError } from "../utils/errors.util";

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

  /**
   * updateCompany
   *
   * update the company details based on the provided companyId.
   *
   * @param {Request} req - The request object
   * @param {Response} res - The response object
   * @param {NextFunction} next - The next function
   */
  updateCompany = async (req: Request, res: Response, next: NextFunction) => {
    try {
      global.logger.info("updateCompany [controller]", {
        filePath: __filename,
        methodName: this.updateCompany.name,
      });

      // Extract company id from the request query parameter
      const companyId: string = req.params.id;

      // Extract company data from the request body
      const companyDto: CompanyUpdateApiDto = req.body;
      // Validate the incoming company data using the defined validation schema in CompanyDTOValidation
      const { error, value: validatedCompanyRequestBody } =
        CompanyUpdateApiDtoValidation.validate(companyDto, {
          abortEarly: false,
        });

      // Check if validation resulted in errors
      if (error) {
        throw new RequestValidationError(error);
      }

      // Prepare the data required to update a company
      const { isCompanyRequestPageFlag, ...remainingCompanyDto } =
        validatedCompanyRequestBody as CompanyUpdateApiDto;

      let updateCompanyDTO: CompanyUpdateDto;
      if (isCompanyRequestPageFlag) {
        // Prepare the data required to update a company
        updateCompanyDTO = {
          ...remainingCompanyDto,
          isVerified: companyDto.isCompanyRequestPageFlag,
        };
      } else {
        updateCompanyDTO = remainingCompanyDto;
      }

      // Call the CompanyService to update a company
      const updateCompany: DbCompanyDetailDto =
        await CompanyService.updateCompany(
          companyId,
          updateCompanyDTO,
          isCompanyRequestPageFlag
        );

      // Send successful response with the created company data
      return res.status(HttpStatusCode.OK_200).json(updateCompany);
    } catch (error) {
      // Pass the error to the next error handler
      next(error);
    }
  };

  /**
   * updateCompanyLogo
   *
   * update the company logo based on the provided companyId.
   *
   * @param {Request} req - The request object
   * @param {Response} res - The response object
   * @param {NextFunction} next - The next function
   */
  updateCompanyLogo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info("update Company Logo [controller]", {
        filePath: __filename,
        methodName: this.updateCompanyLogo.name,
      });

      // Extract company id from the request query parameter
      const companyId: string = req.params.id;

      // Extract company data from the request body
      const companyDto: CompanyUpdateLogoApiDto = req.body;
      // Validate the incoming company data using the defined joi validation schema
      const { error, value: validatedCompanyRequestBody } =
        companyUpdateLogoApiDtoValidation.validate(companyDto, {
          abortEarly: false,
        });

      // Check if validation resulted in errors
      if (error) {
        throw new RequestValidationError(error);
      }

      // Call the CompanyService to update a company
      const updateCompany: DbCompanyDetailDto =
        await CompanyService.updateCompanyLogo(
          companyId,
          validatedCompanyRequestBody
        );

      // Send successful response with the created company data
      return res.status(HttpStatusCode.OK_200).json(updateCompany);
    } catch (error) {
      // Pass the error to the next error handler
      next(error);
    }
  };

  /**
   * createCompany
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

      // Validate the incoming company data using the defined validation schema in CompanyDTOValidation
      const { error, value: validatedCompanyRequestBody } =
        CompanyDTOValidation.validate(companyDto, {
          abortEarly: false,
        });

      // Check if validation resulted in errors
      if (error) {
        throw new RequestValidationError(error);
      }

      // Check if company name already exist
      // Call the CompanyService to get company by name
      const company: QueryResponse<DbCompanyDetailDto> =
        await CompanyService.getCompanyByName(companyDto.name);
      if (company.count) {
        throw new BaseError(
          "The Company name already exists. Please enter a different name to ensure uniqueness.",
          HttpStatusCode.FORBIDDEN_403
        );
      }

      // Prepare the data required to add a new company
      const addCompanyDTO: CompanyDTO = {
        ...validatedCompanyRequestBody,
        isVerified: true,
      };
      // Call the CompanyService to add a new company
      const createdCompany: DbCompanyDetailDto =
        await CompanyService.addNewCompany(addCompanyDTO);

      // Send successful response with the created company data
      return res.status(HttpStatusCode.CREATED_201).json(createdCompany);
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
   * Typscript generics reference:
   * @see https://youtu.be/EcCTIExsqmI?si=3g9M7sVRUeoL3dj7
   *
   * @param {Request} req - The request object
   * @param {Response} res - The response object
   * @param {NextFunction} next - The next function
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
      // recordListingFilterRequest.isVerified = 1;

      // Validate the filter options and throw an error if any of them is invalid
      let { error, value: validatedRecordListingFilterRequest } =
        CompanyListingFilterRequestDTOValidation.validate(
          recordListingFilterRequest,
          {
            abortEarly: false,
          }
        );
      if (error) {
        throw new RequestValidationError(error);
      }

      // Call the CompanyService to get company list
      const companyList: PaginatedResultsWithMatchingConditionsResponse<DbCompanyDetailDto> =
        await CompanyService.getCompanyList(
          validatedRecordListingFilterRequest
        );

      // Destructure the company list data and pagination details
      const { count, timesQueried, lastKey, queriedCount, ...companyData } =
        companyList;

      // Generate pagination response
      const companyListResponse: RecordListingResponseDTO<
        DbCompanyDetailDto[]
      > = paginationResponseHelperObj.customizedPaginationRecordListingResponse<
        DbCompanyDetailDto[],
        CompanyListingFilterOptions
      >(
        Object.values(companyData),
        recordListingFilterRequest,
        count,
        timesQueried,
        lastKey,
        queriedCount
      );

      // Send successful response with company list data
      res.status(HttpStatusCode.OK_200).json(companyListResponse);
    } catch (error) {
      // Let "app.ts" and/or expressjs handle the error
      next(error);
    }
  };

  /**
   * softDeleteCompanyById
   *
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The function to pass control to the next middleware.
   */
  softDeleteCompanyById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info("Soft Deleting company by id [Controller]", {
        filePath: __filename,
        methodName: this.softDeleteCompanyById.name,
        requestParams: req.params,
      });

      // Extract the company id from the request
      const id: string = req.params.id;

      // Call the CompanyService to delete the company
      await CompanyService.softDeleteCompanyById(id);

      // Send successful response
      return res.status(HttpStatusCode.NO_CONTENT_204).json();
    } catch (error) {
      next(error);
    }
  };

  /**
   * softDeleteCompanyRequestByCompanyId
   *
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The function to pass control to the next middleware.
   */
  softDeleteCompanyRequestByCompanyId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info(
        "Deleting company request by company id [Controller]",
        {
          filePath: __filename,
          methodName: this.softDeleteCompanyRequestByCompanyId.name,
          requestParams: req.params,
        }
      );

      // Extract the company id from the request
      const companyId: string = req.params.id;

      // Call the CompanyService to delete the company
      await CompanyService.softDeleteCompanyRequestByCompanyId(companyId);

      // Send successful response
      return res.status(HttpStatusCode.NO_CONTENT_204).json();
    } catch (error) {
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
   * requestCompany
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

      const createdCompany: DbCompanyDetailDto =
        await CompanyService.addNewCompany(requestedCompany);

      const addCompany: DbCompanyRequestDto =
        await CompanyService.requestNewCompany(
          addCompanyDto,
          createdCompany.id
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
   * Get the requested company list based on the provided filters
   *
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next  - The function to pass control to the next middleware.
   */
  getRequestedCompanyList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Log the action of getting company details in the controller
      global.logger.info(
        "Get all requested companies by filter options [Controller] ",
        {
          filePath: __filename,
          methodName: this.getRequestedCompanyList.name,
        }
      );

      // Parse filter options from the request query parameters
      const companyRecordListingFilterRequest: CompanyRequestListingFilterOptions =
        RequestHelper.parseFilterOptions<
          CompanyRequestListingFilterRequestDTO,
          CompanyRequestListingFilterOptions
        >(req.query as unknown as CompanyRequestListingFilterRequestDTO);

      // Validate the filter options and throw an error if any of them is invalid
      let { error, value: validatedCompanyRequestFilterOptions } =
        companyRequestFilterDtoValidation.validate(
          companyRecordListingFilterRequest,
          {
            abortEarly: false,
          }
        );
      if (error) {
        throw new RequestValidationError(error);
      }

      // Fetch the company details from the service
      const requestedCompanies: PaginatedResultsWithMatchingConditionsResponse<DbCompanyRequestDto> =
        await CompanyService.getRequestedCompanyList(
          validatedCompanyRequestFilterOptions
        );

      // Extract the count, timesQueried,lastKey and other details from the response
      const {
        lastKey,
        count,
        timesQueried,
        queriedCount,
        ...requestedCompanyData
      } = requestedCompanies;

      // Generate the pagination response
      const requestedCompanyResponse: RecordListingResponseDTO<
        DbCompanyRequestDto[]
      > = paginationResponseHelperObj.customizedPaginationRecordListingResponse<
        DbCompanyRequestDto[],
        CompanyRequestListingFilterOptions
      >(
        Object.values(requestedCompanyData),
        companyRecordListingFilterRequest,
        count,
        timesQueried,
        lastKey,
        queriedCount
      );

      // Send the fetched result as JSON response
      return res.status(HttpStatusCode.OK_200).json(requestedCompanyResponse);
    } catch (error) {
      // Pass the error to the error handling middleware
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
