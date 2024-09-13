// Import necessary packages
import Joi from "joi"; // Joi package for validation

// Import enums
import { UserType } from "../../enums/User.enum";

// Import common schema
import {commonSchema} from "../../schemas/Common.schema"

// Define validation schema for get all signup users filter DTO
export const usersFilterDtoValidation = commonSchema.concat(
  Joi.object({
    userType: Joi
      .string()
      .optional()
      .valid(...Object.values(UserType))
      .messages({
        "any.only": `Invalid user Type. Please provide a valid value from
      ${Object.values(UserType).join(", ")}.`,
      })
  })
);