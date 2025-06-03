
// Import the Joi library
import Joi from "joi";

// Import enums
import { BlogStatusEnum } from "../enums/Blog.enum";

// Import schemas
import { commonSchema } from "./Common.schema";

/**
 * blogCreateApiDtoValidation
 */
export const blogCreateApiDtoValidation = Joi.object({
  title: Joi.string().lowercase().required().messages({
    "any.required": "The Title field is required.",
    "any.type": "The Title field must be a string.",
    "any.empty": "The Title field cannot be empty.",
  }),

  basicDescription: Joi.string().required().messages({
    "any.required": "The Basic Description field is required.",
    "any.type": "The Basic Description field must be a string.",
    "any.empty": "The Basic Description field cannot be empty.",
  }),

  detailedDescription: Joi.string().required().messages({
    "any.required": "The Detailed Description field is required.",
    "any.type": "The Detailed Description field must be a string.",
    "any.empty": "The Detailed Description field cannot be empty.",
  }),

  htmlDetailedDescription: Joi.string()
    .pattern(/<("[^"]*"|'[^']*'|[^'">])*>/)
    .required()
    .messages({
      "any.required": "The HTML Detailed Description field is required.",
      "any.type": "The HTML Detailed Description field must be a string.",
      "any.empty": "The HTML Detailed Description field cannot be empty.",
      "string.pattern.base": "The HTML Detailed Description field must contain valid HTML tags.",
    }),

  status: Joi.string()
    .required()
    .valid(...Object.values(BlogStatusEnum))
    .messages({
      "any.required": "The Status field is required.",
      "any.type": "The Status field must be a string.",
      "any.only": `Invalid requested blog status. Please provide a valid value from ${Object.values(
        BlogStatusEnum
      ).join(", ")}.`,
    }),

  tags: Joi.array().items(Joi.string().lowercase()).optional().messages({
    "any.type": "The Tags field must be an array of strings.",
  }),
});

/**
 * blogFilterOptionsValidation
 *
 * Define validation schema for the blogs listing filter API
 */
export const blogFilterOptionsValidation = commonSchema.concat(Joi.object({
   title: Joi.string().optional().allow("", null).messages({
      "any.type": "The Title field must be a string.",
   }),

   status: Joi.string()
      .optional()
      .allow(null, "")
      .valid(...Object.values(BlogStatusEnum))
      .messages({
         "any.type": "The Status field must be a string.",
         "any.only": `Invalid requested blog status. Please provide a valid value from ${Object.values(BlogStatusEnum).join(", ")}.`,
      }),
}));

/**
 * blogUpdateApiDtoValidation
 */
export const blogUpdateApiDtoValidation = Joi.object({
  title: Joi.string().lowercase().optional().messages({
    "any.type": "The Title field must be a string.",
  }),

  basicDescription: Joi.string().optional().messages({
    "any.type": "The Basic Description field must be a string.",
  }),

  detailedDescription: Joi.string().optional().messages({
    "any.type": "The Detailed Description field must be a string.",
  }),

  htmlDetailedDescription: Joi.string()
    .pattern(/<("[^"]*"|'[^']*'|[^'">])*>/)
    .optional()
    .messages({
      "string.pattern.base":
        "The HTML Detailed Description field must contain valid HTML tags.",
      "any.type": "The HTML Detailed Description field must be a string.",
    }),

  status: Joi.string()
    .optional()
    .valid(...Object.values(BlogStatusEnum))
    .messages({
      "any.type": "The Status field must be a string.",
      "any.only": `Invalid requested blog status. Please provide a valid value from ${Object.values(
        BlogStatusEnum
      ).join(", ")}.`,
    }),

  tags: Joi.array().items(Joi.string().lowercase()).optional().messages({
    "any.type": "The Tags field must be an array of strings.",
  }),

  cloudBlogCoverImageName: Joi.string()
    .pattern(/^[^\/\\]+?\.[a-zA-Z0-9]+$/)
    .optional()
    .messages({
      "any.type": "The Cloud Blog Cover Image Name field must be a string.",
      "string.pattern.base":
        "The Cloud Blog Cover Image Name field must include a file extension (e.g., 'logo.png').",
    }),
});