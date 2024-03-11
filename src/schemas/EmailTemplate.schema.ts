// Import installed packages
import Joi from "joi";

/**
 * EmailTemplateCreateValidation
 * 
 * Joi schema validation rules for Create Email Template API action.
 */
export const EmailTemplateCreateValidation = Joi.object({
  templateName: Joi.string().required().messages({
    "any.required": "The 'Email Template Name' field is required",
  }),

  subject: Joi.string().required().messages({
    "any.required": "The 'Email Subject' field is required",
  }),

  bodyHtml: Joi.string().required().messages({
    "any.required": "The 'Email Body Html' field is required",
  }),

  bodyText: Joi.string().required().messages({
    "any.required": "The 'Email Body Text' field is required",
  }),

  placeholders: Joi.array()
    .items(Joi.string())
    .required().messages({
      "any.required": "The placeholders field is required.",
      "array.includesRequiredUnknowns": "The placeholder items must be valid strings.",
      "array.empty": "The placeholders field is required.",
    }),
});

/**
 * EmailTemplateUpdateValidation
 * 
 * Joi schema validation rules for Update Email Template API action.
 */
export const EmailTemplateUpdateValidation = Joi.object({
  templateName: Joi.string().required().messages({
    "any.required": "The 'Email Template Name' field is required",
  }),

  subject: Joi.string().required().messages({
    "any.required": "The 'Email Subject' field is required",
  }),

  bodyHtml: Joi.string().required().messages({
    "any.required": "The 'Email Body Html' field is required",
  }),

  bodyText: Joi.string().required().messages({
    "any.required": "The 'Email Body Text' field is required",
  }),
});