// Import necessary packages
import Joi from "joi"; // Joi package for validation

// Import enums
import {
  UserSupportContextTypeEnum,
  UserSupportStatusEnum,
} from "../../enums/User.enum";

// Import common schema
import {commonSchema} from "../../schemas/Common.schema"

// Define validation schema for user support filter DTO
export const userSupportFilterDtoValidation = commonSchema.concat(
  Joi.object({
    status: Joi.string()
      .valid(...Object.values(UserSupportStatusEnum))
      .optional()
      .messages({
        "any.only": `Invalid support status. Please provide a valid value from
      ${Object.values(UserSupportStatusEnum).join(", ")}.`,
      }),

    userEmail: Joi.string().email().optional().messages({
      "string.email": "User email must be a valid email address.",
      "string.empty": "User email should not be empty.",
    }),

    userSupportType: Joi.string().optional().messages({
      "string.empty": "Support type should not be empty.",
    }),

    contextType: Joi.string()
      .optional()
      .valid(...Object.values(UserSupportContextTypeEnum))
      .messages({
        "any.only": `Invalid context type. Please provide a valid value from
      ${Object.values(UserSupportContextTypeEnum).join(", ")}.`,
      }),

    contextId: Joi.string().optional().messages({
      "string.empty": "Context ID should not be empty.",
    }),

    assignedToUserId: Joi.string().optional().messages({
      "string.empty": "Assigned to user ID should not be empty.",
    }),

    resolvedbyUserId: Joi.string().optional().messages({
      "string.empty": "Resolved by user ID should not be empty.",
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