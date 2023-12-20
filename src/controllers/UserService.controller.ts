// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import {
  UserServiceInterviewGuidanceRequestDTO,
  UserServiceRequestDTO,
} from "../dtos/UserService.dto";

// Load the local schema
import {
  userServiceInterviewGuidanceRequestDTOValidation,
  userServiceRequestDTOValidation,
} from "../schemas/UserService.schema";

// Load the shared service

//Load local util statuscode
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";
import UserServiceService from "../services/UserService.service";

/**
 * UserServiceController
 *
 * Class to perform related/relevent action/activities related to the "user Service" table
 */
class UserServiceController {
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  getServiceStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("Get candidate service status [controller]");
      const { emailAddress, serviceId } = req.params;
      const matchingScore = await UserServiceService.getStatus(
        emailAddress,
        serviceId
      );
      res.status(HttpStatusCode.OK_200).json(matchingScore[0]);
    } catch (error) {
      console.log("getStatusError-> Error: ", error);
      next(error);
    }
  };

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  requestService = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = req.params.emailAddress;
      const userServiceRequestDTO: UserServiceRequestDTO = req.body;
      const { error, value } = userServiceRequestDTOValidation.validate(
        userServiceRequestDTO,
        {
          abortEarly: false, // Do not abort on the first validation error
        }
      );

      if (error) {
        throw new RequestValidationError(error);
      }
      const serviceRequestId = await UserServiceService.createServiceRequest(
        email,
        value
      );
      res.status(HttpStatusCode.CREATED_201).json(serviceRequestId);
    } catch (error) {
      // Handle errors
      console.log("Error Service: ", error);

      // Pass the error to the next error handler
      next(error);
    }
  };

  requestServiceInterviewGuidance = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const email = req.params.emailAddress;
      const userServiceInterviewGuidanceRequestDTO: UserServiceInterviewGuidanceRequestDTO =
        req.body;
      const { error, value } =
        userServiceInterviewGuidanceRequestDTOValidation.validate(
          userServiceInterviewGuidanceRequestDTO,
          {
            abortEarly: false, // Do not abort on the first validation error
          }
        );

      if (error) {
        throw new RequestValidationError(error);
      }
      const serviceRequestId = await UserServiceService.createServiceRequest(
        email,
        value
      );
      res.status(HttpStatusCode.CREATED_201).json(serviceRequestId);
    } catch (error) {
      // Handle errors
      console.log("Error Service: ", error);

      // Pass the error to the next error handler
      next(error);
    }
  };
}

export default UserServiceController;
