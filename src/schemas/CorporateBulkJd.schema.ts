// Import the Joi library
import Joi from "joi";

// import schemas
import { commonSchema } from "./Common.schema";

// Define validation schema for Bulk Job Description Matching request api dto
export const corporateBulkJdDTOValidation = Joi.object({
    companyId: Joi
      .string()
      .required()
      .messages({
        "any.required": "The Company id field is required.",
        "any.type": "The Company id field must be a string.",
        "string.empty": "The Company id field should not be empty.",
      }),

    jobTitle: Joi
      .string()
      .required()
      .lowercase()
      .messages({
        "any.type": "The Job title field must be a string.",
        "string.empty": "The Job title field should not be empty.",
        "any.required": "The Job title field is required.",
      }),
  
    jobDescription: Joi
      .string()
      .required()
      .messages({
        "any.required": "The Job description field is required.",
        "any.type": "The Job description field must be a string.",
        "string.empty": "The Job description field should not be empty.",
      }),

    jobLocation: Joi
      .string()
      .optional()
      .messages({
        "any.type": "The Job location field must be a string.",
      }),

    mustHaveSkills: Joi
      .array()
      .items(Joi
      .string().allow(""))
      .optional()
      .default([])
      .messages({
        "array.base": "The Must have skills field should be an array of strings.",
        "string.base": "Each skill must be a string.",
      }),

    mustNotHaveSkills: Joi
      .array()
      .items(Joi
      .string().allow(""))
      .optional()
      .default([])
      .messages({
        "array.base": "The Must not have skills field should be an array of strings.",
        "string.base": "Each skill must be a string.",
      }),

    goodToHaveSkills: Joi
      .array()
      .items(Joi
      .string().allow(""))
      .optional()
      .default([])
      .messages({
        "array.base": "The Good to have skills field should be an array of strings.",
        "string.base": "Each skill must be a string.",
      }),

    experienceRange: Joi.object({
        min: Joi
        .number()
        .integer()
        .min(0)
        .optional()
        .messages({
            "number.base": "The Min experience field must be a number.",
            "number.integer": "The Min experience field must be an integer.",
            "number.min": "The Min experience field must be a positive number.",
        }),
        max: Joi
        .number()
        .integer()
        .min(Joi
        .ref('min')) // Ensure "max" is greater than or equal to min
        .optional().messages({
            "number.base": "The Max experience field must be a number.",
            "number.integer": "The Max experience field must be an integer.",
            "number.min": "The Max experience field must be greater than or equal to min experience field.",
        }),
    }).optional(),
});

// Define validation schema for filtering corporate bulk job description  requests
export const corporateBulkJdFilterDtoValidation = commonSchema.concat(
  Joi.object({
    companyId: Joi
      .string()
      .optional()
      .allow("",null)
      .messages({
        "any.type": "The Company Id field must be a string.", 
        "any.required": "The Company Id field is required.",
        "string.empty": "The Company Id field should not be empty.",
      }),
  })
);