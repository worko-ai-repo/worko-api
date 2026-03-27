// Import express packages
import { NextFunction, Request, Response } from "express";

// Import models
import { DbUserGoogleInterviewTokenDetailsDto } from "../db/gcp-firestore-models/UserGoogleInterviewToken.model";

// Import dtos
import { UserGoogleInterviewTokenDetailsApiDto } from "../dtos/UserGoogleInterviewToken.dto";

// Import schemas
import { userGoogleInterviewTokenDetailsApiDtoValidation } from "../schemas/UserGoogleInterviewToken.schema";

// Import services
import { userGoogleInterviewTokenServiceObj } from "../services/UserGoogleInterviewToken.service";

// Import utils
import { BaseError, RequestValidationError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

class UserGoogleInterviewTokenController {
  /**
   * createUserGoogleInterviewTokenDetails
   *
   * Exchanges the provided Google GIS authorization code for tokens
   * and stores them in Firestore.
   *
   * @param {Request} req - The Request Object
   * @param {Response} res - The Response Object
   * @param {NextFunction} next - The Next Function
   */
  createUserGoogleInterviewTokenDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info(
        "Initialized createUserGoogleInterviewTokenDetails [CONTROLLER]",
        {
          filePath: __filename,
          methodName: this.createUserGoogleInterviewTokenDetails.name,
        }
      );

      const requestBody: UserGoogleInterviewTokenDetailsApiDto = req.body;

      const { error, value: validatedReqBody } =
        userGoogleInterviewTokenDetailsApiDtoValidation.validate(requestBody, {
          abortEarly: false,
        });

      if (error) {
        throw new RequestValidationError(error);
      }

      const response: DbUserGoogleInterviewTokenDetailsDto | undefined =
        await userGoogleInterviewTokenServiceObj.createUserGoogleInterviewTokenDetails(
          validatedReqBody
        );

      if (!response) {
        global.logger.error(
          "Error in createUserGoogleInterviewTokenDetails [controller]",
          {
            error: "Failed to create user google interview token details",
            requestBody,
          }
        );
        throw new BaseError(
          "Internal Server Error.",
          HttpStatusCode.INTERNAL_SERVER_ERROR_500
        );
      }

      return res.status(HttpStatusCode.CREATED_201).json(response);
    } catch (error) {
      global.logger.error(
        "Error in createUserGoogleInterviewTokenDetails [controller]",
        { error }
      );
      next(error);
    }
  };

  /**
   * getUserGoogleInterviewTokenDetailsByUserId
   *
   * Fetches the user's token document from Firestore.
   *
   * @param {Request} req - The Request Object
   * @param {Response} res - The Response Object
   * @param {NextFunction} next - The Next Function
   */
  getUserGoogleInterviewTokenDetailsByUserId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info(
        "Initialized getUserGoogleInterviewTokenDetailsByUserId [CONTROLLER]",
        {
          filePath: __filename,
          methodName: this.getUserGoogleInterviewTokenDetailsByUserId.name,
        }
      );

      const response: DbUserGoogleInterviewTokenDetailsDto | undefined =
        await userGoogleInterviewTokenServiceObj.getUserGoogleInterviewTokenDetailsByUserId();

      return res
        .status(HttpStatusCode.OK_200)
        .json(response ? response : {});
    } catch (error) {
      global.logger.error(
        "Error in getUserGoogleInterviewTokenDetailsByUserId [controller]",
        { error }
      );
      next(error);
    }
  };

  /**
   * updateUserGoogleInterviewTokenDetails
   *
   * Exchanges the provided Google GIS authorization code for tokens
   * and updates the token document in Firestore.
   *
   * @param {Request} req - The Request Object
   * @param {Response} res - The Response Object
   * @param {NextFunction} next - The Next Function
   */
  updateUserGoogleInterviewTokenDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info(
        "Initialized updateUserGoogleInterviewTokenDetails [CONTROLLER]",
        {
          filePath: __filename,
          methodName: this.updateUserGoogleInterviewTokenDetails.name,
        }
      );

      const requestBody: UserGoogleInterviewTokenDetailsApiDto = req.body;

      const { error, value: validatedReqBody } =
        userGoogleInterviewTokenDetailsApiDtoValidation.validate(requestBody, {
          abortEarly: false,
        });

      if (error) {
        throw new RequestValidationError(error);
      }

      const response: DbUserGoogleInterviewTokenDetailsDto | undefined =
        await userGoogleInterviewTokenServiceObj.updateUserGoogleInterviewTokenDetails(
          validatedReqBody
        );

      if (!response) {
        throw new BaseError(
          "Internal Server Error.",
          HttpStatusCode.INTERNAL_SERVER_ERROR_500
        );
      }

      return res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(
        "Error in updateUserGoogleInterviewTokenDetails [controller]",
        { error }
      );
      next(error);
    }
  };

  /**
   * deleteUserGoogleInterviewTokenDetailsByUserId
   *
   * Deletes the token document from Firestore.
   *
   * @param {Request} req - The Request Object
   * @param {Response} res - The Response Object
   * @param {NextFunction} next - The Next Function
   */
  deleteUserGoogleInterviewTokenDetailsByUserId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info(
        "Initialized deleteUserGoogleInterviewTokenDetailsByUserId [CONTROLLER]",
        {
          filePath: __filename,
          methodName: this.deleteUserGoogleInterviewTokenDetailsByUserId.name,
        }
      );

      await userGoogleInterviewTokenServiceObj.deleteUserGoogleInterviewTokenDetailsByUserId();

      return res.status(HttpStatusCode.NO_CONTENT_204).json();
    } catch (error) {
      global.logger.error(
        "Error in deleteUserGoogleInterviewTokenDetailsByUserId [controller]",
        { error }
      );
      next(error);
    }
  };
}

export default UserGoogleInterviewTokenController;

