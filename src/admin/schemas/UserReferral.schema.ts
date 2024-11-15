// Import necessary packages
import Joi from "joi"; // Joi package for validation

// Import enums
import { ReferralStatus } from "../../enums/UserReferral.enum";

// Import common schema
import { commonSchema } from "../../schemas/Common.schema";

// Define validation schema for get all referrals filter DTO
export const userReferralFilterDtoValidation = commonSchema.concat(
  Joi.object({
    status: Joi.string()
      .optional()
      .valid(...Object.values(ReferralStatus))
      .messages({
        "any.only": `Invalid referral status. Please provide a valid value from
      ${Object.values(ReferralStatus).join(", ")}.`,
      })
  })
);