// Import installed packages
import Joi from "joi";

// Import enums
import { EmailTemplateStatusEnum } from "../enums/EmailTemplate.enum";

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

  title: Joi.string().required().messages({
    "any.required": "The 'Title' field is required",
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

  description: Joi.string().required().messages({
    "any.required": "The 'Description' field is required",
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

  status: Joi.string()
    .required()
    .valid(EmailTemplateStatusEnum.ENABLED, EmailTemplateStatusEnum.DISABLED)
    .messages({
      "any.required": "The 'Status' field is required.",
      "any.only": `The 'Status' field must be one of: ${EmailTemplateStatusEnum.ENABLED}, ${EmailTemplateStatusEnum.DISABLED}.`
    }),

  subject: Joi.string().required().messages({
    "any.required": "The 'Email Subject' field is required",
  }),

  title: Joi.string().required().messages({
    "any.required": "The 'Title' field is required",
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

  description: Joi.string().required().messages({
    "any.required": "The 'Description' field is required",
  }),
});