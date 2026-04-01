
// Import Base Express Params and Types
import { Request, Response, NextFunction } from "express";

// Import DTOs
import { CorporateSubscriptionPricingConfigCreateApiDto, CorporateSubscriptionPricingConfigListingFilterOptions, CorporateSubscriptionPricingConfigListingFilterRequestDTO } from "../dtos/CorporateSubscriptionPricingConfig.dto";

// Import Enums
import { CorporateSubscriptionEntityTypeEnum, CorporateSubscriptionPlanTypeEnum } from "../enums/Common.enum";

// Import Helpers
import { GcpFirestoreRequestHelper } from "../helpers/request.gcp-firestore.helper";

// Import Schemas
import { corporateSubscriptionPricingConfigCreateApiDtoValidation, corporateSubscriptionPricingConfigFilterDtoValidation } from "../schemas/CorporateSubscriptionPricingConfig.schema";

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

  getCorporateSubscriptionPricingConfigByEntityTypeAndPlanType = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entityType = req.params.entityType as CorporateSubscriptionEntityTypeEnum;
      const planType = req.params.planType as CorporateSubscriptionPlanTypeEnum;
      const result = await corporateSubscriptionPricingConfigServiceObj.getCorporateSubscriptionPricingConfigByEntityTypeAndPlanType(entityType, planType);
      if(!result) throw new BaseError("Failed to get Corporate Subscription Pricing Config");
      return res.status(HttpStatusCode.OK_200).json(result);
    } catch (error) {
      global.logger.error("Error in getCorporateSubscriptionPricingConfigByEntityTypeAndPlanType [controller]",{
         error
      });
      next(error);
    }
  }

  getAllCorporateSubscriptionPricingConfigByFilterOptions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filterRequest: CorporateSubscriptionPricingConfigListingFilterOptions =
        GcpFirestoreRequestHelper.parseFilterOptions<
          CorporateSubscriptionPricingConfigListingFilterRequestDTO,
          CorporateSubscriptionPricingConfigListingFilterOptions
        >(
          req.query as unknown as CorporateSubscriptionPricingConfigListingFilterRequestDTO
        );

      let { error, value: validatedRequestBody } =
        corporateSubscriptionPricingConfigFilterDtoValidation.validate(
          filterRequest,
          { abortEarly: false }
        );
      if (error) {
        throw new RequestValidationError(error);
      }
      const result = await corporateSubscriptionPricingConfigServiceObj.getAllCorporateSubscriptionPricingConfigByFilterOptions(
        validatedRequestBody
      );
      return res.status(HttpStatusCode.OK_200).json(result);
    } catch (error) {
      global.logger.error("Error in getAllCorporateSubscriptionPricingConfigByFilterOptions [controller]",{
         error
      });
      next(error);
    }
  }
}

export default CorporateSubscriptionPricingConfig;
