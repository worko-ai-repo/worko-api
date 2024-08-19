// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load services
import { companyServiceObj } from "../services/Company.service";

// Load utils
import HttpStatusCode from "../../utils/http-codes.util";
import { BaseError } from "../../utils/errors.util";

/**
 * CompanyController
 *
 * This class is a controller in an Express.js application responsible for handling HTTP requests related to companies only by admin.
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
   * @throws {BaseError} - If the company is not found with the provided companyId
   */
  getCompanyDetailById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Log the action of fetching company details by id in the controller
      global.logger.info("Get company details by company id [admin company controller]");

      // Get the company ID from the request parameters as a string type assertion
      const companyId = req.params.companyId as string;

      // Get company details based on the provided companyId from the service, if not found then return 404
      const companyDetails = await companyServiceObj.getCompanyDetailById(companyId);
      if (!companyDetails.count) {
        throw new BaseError(
          `The company with the provided "${companyId}" id is not found.`,
          HttpStatusCode.NOT_FOUND_404
        );
      }

      // return the fetched result as JSON response
      return res.status(HttpStatusCode.OK_200).json(companyDetails[0]);
    } catch (error) {
      // Pass the error to the next error handler
      next(error);
    }
  };
}

// Export the CompanyController
export default CompanyController;
