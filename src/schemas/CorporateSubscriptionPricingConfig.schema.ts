
import Joi from "joi";

// Import enums
import { CorporateSubscriptionEntityTypeEnum, CorporateSubscriptionPlanTypeEnum } from "../enums/Common.enum";

export const corporateSubscriptionPricingConfigCreateApiDtoValidation = Joi.object({
  entityType: Joi.string()
    .valid(...Object.values(CorporateSubscriptionEntityTypeEnum))
    .required()
    .messages({
      "any.required": "entityType is required",
      "string.base": "entityType must be a string",
      "any.only": `entityType must be one of ${Object.values(CorporateSubscriptionEntityTypeEnum).join(", ")}`,
    }),

  planType: Joi.string().required().valid(
    ...Object.values(CorporateSubscriptionPlanTypeEnum)
  ).messages({
    "any.required": "planType is required",
    "string.base": "planType must be a string",
    "any.only": `planType must be one of ${Object.values(CorporateSubscriptionPlanTypeEnum).join(", ")}`,
  }),
  pricePerEntityPerMonth: Joi.number().required().messages({
    "any.required": "pricePerEntityPerMonth is required",
    "number.base": "pricePerEntityPerMonth must be a number",
  }),
});