// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import {
  UserProvidedServiceDTO,
  UserProvidedServiceDTOWithId,
} from "../dtos/UserProvidedService.dto";

// Load the local schema
import {
  userProvidedServiceDTOValidation,
  userProvidedServiceIdValidation,
  userProvidedServiceUpdateDTOValidation,
} from "../schemas/UserProvidedService.schema";
import { validateEmailField } from "../schemas/User.schema";

// Load the shared service
import MasterServiceService from "../services/MasterService.service";
import UserProvidedServiceService from "../services/UserProvidedService.service";
// import UserProfilePercentageService from "../services/UserProfilePercentage.service";

// Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

// Load local helper
// import { UserProfilePercentageOperationHelper } from "../helpers/ProfilePercentageOperations.helper";
import { TimestampHelper } from "../helpers/timeStamp.helper";
import { ProvidedServiceStatus } from "../enums/User.enum";
import { UuidHelper } from "../helpers/uuid.helper";
import ServiceHelper from "../helpers/UserService.helper";

/**
 * UserProvidedServiceController
 *
 * Class to perform related/relevant actions/activities related to the "UserProvidedService" table
 */
class UserProvidedServiceController {
  /**
   * getByEmail
   *
   * Retrieves the user based on the provided query parameters
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action for debugging purposes
      logger.info("Get user ProvidedService by email [controller]");

      // Extract email from request parameters
      const email = req.params.id;

      const { error } = validateEmailField(email);

      if (error) {
        throw new RequestValidationError(error);
      }

      const servicePlans = MasterServiceService.get();

      const result = await UserProvidedServiceService.get(email);

      ServiceHelper.updateServiceNames(result, await servicePlans);

      // Send a successful response with user data
      res.status(HttpStatusCode.OK_200).json(result);
    } catch (error: any) {
      // Handle errors

      // Check if the error is due to user not found
      if (error.message === "User not found") {
        // If user not found, send a 404 response with an informative error message
        res
          .status(HttpStatusCode.NOT_FOUND_404)
          .json({ error: "User not found. Please check the email." });
      } else {
        // If it's another type of error, pass it to the next error handler
        next(error);
      }
    }
  };

  /**
   * getById
   *
   * Retrieves the provided service based on the ID
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action for debugging purposes
      logger.info("Get user ProvidedService by Id [controller]");

      // Extract email from request parameters
      const param = req.params;

      const { error } = userProvidedServiceIdValidation.validate(param, {
        abortEarly: false,
      });

      if (error) {
        throw new RequestValidationError(error);
      }

      const servicePlans = MasterServiceService.get();

      const result = await UserProvidedServiceService.getById(
        param.id,
        param.pserviceId
      );

      ServiceHelper.updateServiceNames(result, await servicePlans);

      // Send a successful response with user data
      res.status(HttpStatusCode.OK_200).json(result);
    } catch (error: any) {
      // Handle errors

      // Check if the error is due to user not found
      if (error.message === "User not found") {
        // If user not found, send a 404 response with an informative error message
        res
          .status(HttpStatusCode.NOT_FOUND_404)
          .json({ error: "User not found. Please check the email." });
      } else {
        // If it's another type of error, pass it to the next error handler
        next(error);
      }
    }
  };

  /**
   * create
   *
   * Creates the user's ProvidedService URLs
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action for debugging purposes
      logger.info("Create user ProvidedService by email [controller]");

      // Extract email from request parameters
      const email = req.params.id;

      const { error: emailError } = validateEmailField(email);

      const userProvidedServiceDTO: UserProvidedServiceDTO = req.body;
      const { error } = userProvidedServiceDTOValidation.validate(
        userProvidedServiceDTO,
        {
          abortEarly: false,
        }
      );

      // Validate the user input and throw a validation error if necessary
      if (emailError) {
        throw new RequestValidationError(emailError);
      } else if (error) {
        throw new RequestValidationError(error);
      }

      /* let userProfilePercentageDTO = await UserProfilePercentageService.get(
        email
      );
      userProfilePercentageDTO = userProfilePercentageDTO.toJSON()[0]; */
      // checking the fields in profile percentage for UserExperience and updating the current percentage
      /* userProfilePercentageDTO =
          UserProfilePercentageOperationHelper.updateCurPerc(
            userProfilePercentageDTO,
            value[i]
          ); */

      // Check and add timestamps for each category
      if (userProvidedServiceDTO.durationAndPrices) {
        TimestampHelper.addCreatedAtAndUpdatedAt(
          userProvidedServiceDTO.durationAndPrices
        );
        UuidHelper.addUuid(userProvidedServiceDTO.durationAndPrices, "priceId");
      }

      userProvidedServiceDTO.status = ProvidedServiceStatus.ACTIVE;
      const result = await UserProvidedServiceService.create(
        email,
        userProvidedServiceDTO
      );

      //   UserProfilePercentageService.update(email, userProfilePercentageDTO);

      // Send a successful response with user data
      res.status(HttpStatusCode.OK_200).json(result);
    } catch (error: any) {
      // If it's another type of error, pass it to the next error handler
      next(error);
    }
  };

  /**
   * create
   *
   * Update the user's ProvidedService URLs
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  Update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the action for debugging purposes
      logger.info("Update user ProvidedService by email [controller]");

      // Extract email from request parameters
      const email = req.params.id;

      const { error: emailError } = validateEmailField(email);

      const userProvidedServiceDTO: UserProvidedServiceDTOWithId = req.body;
      let { error, value } = userProvidedServiceUpdateDTOValidation.validate(
        userProvidedServiceDTO,
        {
          abortEarly: false,
        }
      );

      // Validate the user input and throw a validation error if necessary
      if (emailError) {
        throw new RequestValidationError(emailError);
      } else if (error) {
        throw new RequestValidationError(error);
      }

      /* let userProfilePercentageDTO = await UserProfilePercentageService.get(
        email
      );
      userProfilePercentageDTO = userProfilePercentageDTO.toJSON()[0]; */
      // checking the fields in profile percentage for UserExperience and updating the current percentage
      /* userProfilePercentageDTO =
          UserProfilePercentageOperationHelper.updateCurPerc(
            userProfilePercentageDTO,
            value[i]
          ); */

      if (userProvidedServiceDTO.durationAndPrices) {
        TimestampHelper.addCreatedAtAndUpdatedAt(
          userProvidedServiceDTO.durationAndPrices
        );
        UuidHelper.addUuid(userProvidedServiceDTO.durationAndPrices, "priceId");
      }

      const result = await UserProvidedServiceService.update(
        email,
        userProvidedServiceDTO.SK,
        value
      );

      //   UserProfilePercentageService.update(email, userProfilePercentageDTO);

      // Send a successful response with user data
      res.status(HttpStatusCode.OK_200).json(result);
    } catch (error: any) {
      // If it's another type of error, pass it to the next error handler
      next(error);
    }
  };
}

export default UserProvidedServiceController;
