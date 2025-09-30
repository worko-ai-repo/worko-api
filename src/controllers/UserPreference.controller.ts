
// Import express types
import { Request, Response, NextFunction } from "express";

// Import dynamoose types
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import dtos
import { UserPreferenceCreateOrUpdateApiDto } from "../dtos/UserPreference.dto";

// Import models
import { DbUserPreferenceDto } from "../db/models/UserPreference.model";

// Import schemas
import { userPreferenceCreateOrUpdateApiDtoValidation } from "../schemas/UserPreference.schema";

// Import services
import { userPreferenceServiceObj } from "../services/UserPreference.service";

// Import utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError, RequestValidationError } from "../utils/errors.util";

class UserPreferenceController {
  createOrUpdateUserPreference = async (req: Request, res: Response, next: NextFunction) => {
    try {
      global.logger.info("Create or update user preference [controller]", {
        methodName: this.createOrUpdateUserPreference.name,
      });

      const requestBody: UserPreferenceCreateOrUpdateApiDto = req.body;

      const { error, value: validatedData } = userPreferenceCreateOrUpdateApiDtoValidation.validate(requestBody, { abortEarly: false });
      if (error) {
        throw new RequestValidationError(error);
      }

      const result: DbUserPreferenceDto = await userPreferenceServiceObj.createOrUpdateUserPreference(
        validatedData
      );

      res.status(HttpStatusCode.CREATED_201).json(result);
    } catch (error) {
      global.logger.error("Error in create or update user preference [controller]", {
        methodName: this.createOrUpdateUserPreference.name,
        error: error,
      });

      next(error);
    }
  };

  getUserPreferenceByEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      global.logger.info("Get user preference by email [controller]", {
        methodName: this.getUserPreferenceByEmail.name
      });

      const result: QueryResponse<DbUserPreferenceDto> = await userPreferenceServiceObj.getUserPreferenceByEmail(
        req.params.email
      );

      if(!result.count) {
        throw new BaseError("User preference details not found.", HttpStatusCode.NOT_FOUND_404);
      }

      res.status(HttpStatusCode.OK_200).json(result[0]);
    } catch (error) {
      global.logger.error("Error in get user preference by email [controller]", {
        methodName: this.getUserPreferenceByEmail.name,
        error: error
      });

      next(error);
    }
  };
}

export default UserPreferenceController;