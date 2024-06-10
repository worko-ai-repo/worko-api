import Joi from "joi";

// @todo Kindly add appropriate comments for all schemas
export const CompanyDTOValidation = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Company name is required",
  }),

  industry: Joi.string().required().messages({
    "any.required": "Industry is required",
  }),

  teamSize: Joi.number().integer().min(0).required().messages({
    "number.base": "Team size must be a number",
    "number.integer": "Team size must be an integer",
    "number.min": "Team size must be greater than or equal to 0",
    "any.required": "Team size is required",
  }),

  carrierPage: Joi.string().uri().required().messages({
    "string.uri": "Carrier page must be a valid URI",
    "any.required": "Carrier page is required",
  }),

  linkedIn: Joi.string().uri().required().messages({
    "string.uri": "LinkedIn must be a valid URI",
    "any.required": "LinkedIn is required",
  }),

  logoUrl: Joi.string().uri().required().messages({
    "string.uri": "Logo URL must be a valid URI",
    "any.required": "Logo URL is required",
  }),
  logo: Joi.string().allow("").optional(),
});

export const CompanyRequestDTOValidation = Joi.object({
  userType: Joi.string().valid("EMP", "CAND").required().messages({
    "any.only": "User type must be either EMP or CAND",
    "any.required": "User type is required",
  }),

  companyDetail: Joi.object({
    name: Joi.string().required().messages({
      "any.required": "Company name is required",
    }),

    industry: Joi.string().required().messages({
      "any.required": "Industry is required",
    }),

    teamSize: Joi.number().integer().min(0).messages({
      "number.base": "Team size must be a number",
      "number.integer": "Team size must be an integer",
      "number.min": "Team size must be greater than or equal to 0",
      "any.required": "Team size is required",
    }),

    carrierPage: Joi.string().uri().messages({
      "string.uri": "Carrier page must be a valid URI",
      "any.required": "Carrier page is required",
    }),

    linkedIn: Joi.string().uri().required().messages({
      "string.uri": "LinkedIn must be a valid URI",
      "any.required": "LinkedIn is required",
    }),

    logoUrl: Joi.string().uri().messages({
      "string.uri": "Logo URL must be a valid URI",
      "any.required": "Logo URL is required",
    }),
    logo: Joi.string().allow("").optional(),
  }),
  userEmail: Joi.string().allow("").optional(),
  userContactNumber : Joi.string().allow("").optional(),
});
