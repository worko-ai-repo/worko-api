
// Import Base Express Params and Types
import { Request, Response, NextFunction } from "express";

// Import DTOs
import { CorporateSubscriptionPricingConfigCreateApiDto } from "../dtos/CorporateSubscriptionPricingConfig.dto";

// Import Schemas
import { corporateSubscriptionPricingConfigCreateApiDtoValidation } from "../schemas/CorporateSubscriptionPricingConfig.schema";

// Import Services
import { corporateSubscriptionPricingConfigServiceObj } from "../services/CorporateSubscriptionPricingConfig.service";

// Import utils
import { BaseError, RequestValidationError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

class CorporateSubscriptionPricingConfig {
  createCorporateSubscriptionPricingConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {

      // Get the Request Body
      const requestBody: CorporateSubscriptionPricingConfigCreateApiDto = req.body;

      // Validate the Request and Throw an Error if Invalid
      const { error, value: validatedRequestBody } =
        corporateSubscriptionPricingConfigCreateApiDtoValidation.validate(requestBody, {
          abortEarly: false,
        });
      if (error) {
        throw new RequestValidationError(error);
      }

      // Send to the Service
      const result =
        await corporateSubscriptionPricingConfigServiceObj.performCreateCorporateSubscriptionPricingConfig(validatedRequestBody);
      if(!result) throw new BaseError("Failed to create Corporate Subscription Pricing Config");

      // Prepare the Response
      return res.status(HttpStatusCode.CREATED_201).json(result);
    } catch (error) {
      global.logger.error("Error in createCorporateSubscriptionPricingConfig [controller]",{
         error
      });
      next(error);
    }
  };
}

export default CorporateSubscriptionPricingConfig;
