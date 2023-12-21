// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import {
  MasterServiceDTO,
  ServicePlanResponseDTO,
} from "../dtos/MasterService.dto";

// Load the local schema
import { masterServiceDTOValidation } from "../schemas/MasterService.schema";

// Load the shared service
import MasterServiceService from "../services/MasterService.service";

//Load local util statuscode
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

/**
 *  MasterServiceController
 *
 * Class to perform related/relevent action/activities related to the "MasterService" table
 */
class MasterServiceController {
  /**
   *
   * createMasterService
   *
   * Create a new Master Service based on the provided input data. Validates the input data
   * and, if successful, proceeds with the Master Service creation logic.
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns
   */
  createMasterService = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("Create new mater Service plan [controller]");
      const masterServiceDto: MasterServiceDTO = req.body;

      const { error, value } = masterServiceDTOValidation.validate(
        masterServiceDto,
        {
          abortEarly: false, // Do not abort on the first validation error
        }
      );

      if (error) {
        throw new RequestValidationError(error);
      }

      const addMasterService =
        await MasterServiceService.createNewMasterService(masterServiceDto);
      res.status(HttpStatusCode.CREATED_201).json(addMasterService);
    } catch (error) {
      // Handle errors

      // Pass the error to the next error handler
      next(error);
    }
  };

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  getMasterService = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("Get all mater Service [controller]");
      const servicePlans = await MasterServiceService.getMasterServicePlans();
      const allServicePlans: ServicePlanResponseDTO[] = servicePlans.map(
        (plan: { SK: any; name: any; details: any; isActive: any }) => ({
          SK: plan.SK,
          name: plan.name,
          details: plan.details ?? "",
          isActive: plan.isActive,
        })
      );
      res.status(HttpStatusCode.OK_200).json(allServicePlans);
    } catch (error) {
      // Handle errors

      // Pass the error to the next error handler
      next(error);
    }
  };
}

export default MasterServiceController;
