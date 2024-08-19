// Import necessary packages
import Joi from "joi"; // Joi package for validation

// Import enums
import {
  UserSupportContextTypeEnum,
  UserSupportStatusEnum,
} from "../../enums/User.enum";

// Define validation schema for user support filter DTO
export const userSupportFilterDtoValidation = Joi.object({
  status: Joi.string()
    .optional()
    .custom((value, helpers) => {
      if (
        value &&
        !Object.values(UserSupportStatusEnum).includes(
          value as UserSupportStatusEnum
        )
      ) {
        return helpers.message({
          custom: `Invalid status. Please provide a valid value from ${Object.values(
            UserSupportStatusEnum
          ).join(", ")}.`,
        });
      }
      return value;
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
    .custom((value, helpers) => {
      if (
        value &&
        !Object.values(UserSupportContextTypeEnum).includes(
          value as UserSupportContextTypeEnum
        )
      ) {
        return helpers.message({
          custom: `Invalid context type. Please provide a valid value from ${Object.values(
            UserSupportContextTypeEnum
          ).join(", ")}.`,
        });
      }
      return value;
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

  pageSize: Joi.number().integer().min(1).required().messages({
    "number.base": "Page size must be a number.",
    "number.integer": "Page size must be an integer.",
    "number.min": "Page size must be at least 1.",
    "any.required": "Page size is required.",
  }),

  lastKey: Joi.string().optional().allow("").messages({
    "string.empty": "Last key should not be empty.",
  }),
});
