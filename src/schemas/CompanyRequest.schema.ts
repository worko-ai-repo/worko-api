// Import necessary packages
import Joi from "joi"; // Joi package for validation

// Import dtos
import { Status } from "../dtos/Company.dto";

// Import Schemas
import { commonSchema } from "./Common.schema";

// Define validation schema for get all referrals filter DTO
export const companyRequestFilterDtoValidation = commonSchema.concat(
  Joi.object({
    status: Joi.string()
      .optional()
      .allow(null, "")
      .valid(...Object.values(Status))
      .messages({
        "any.type": "The Status field must be a string.",
        "any.only": `Invalid requested company status. Please provide a valid value from ${Object.values(Status).join(", ")}.`,
      })
  })
);