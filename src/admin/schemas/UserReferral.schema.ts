// Import necessary packages
import Joi from "joi"; // Joi package for validation

// Import enums
import { ReferralStatus } from "../../enums/UserReferral.enum";

// Import common schema
import { commonSchema } from "../../schemas/Common.schema";

// Define validation schema for get all signup users filter DTO
export const userReferralFilterDtoValidation = commonSchema.concat(
  Joi.object({
    status: Joi.string()
      .optional()
      .valid(...Object.values(ReferralStatus))
      .messages({
        "any.only": `Invalid referral status. Please provide a valid value from
      ${Object.values(ReferralStatus).join(", ")}.`,
      }),

    // The fromDate field can be a string in a valid ISO 8601 date format, null, or undefined.
    fromDate: Joi.string().isoDate().optional().allow(null).messages({
      "string.base": "Provide a valid fromDate.",
    }),

    // The toDate field can be a string in a valid ISO 8601 date format, null, or undefined.
    toDate: Joi.string().isoDate().optional().allow(null).messages({
      "string.base": "Provide a valid toDate.",
    }),
  })
);