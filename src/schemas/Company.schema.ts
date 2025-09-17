// Import the Joi library
import Joi from "joi";

// import schemas
import { commonSchema } from "./Common.schema";

/**
 * CompanyDTOValidation
 *
 * Schema for validating a company object
 */
export const CompanyDTOValidation = Joi.object({
  name: Joi.string().required().uppercase().messages({
    "any.required": "The Company name field is required.",
    "any.type": "The Company name field must be a string.",
    "string.empty": "The Company name field cannot be empty.",
  }),

  industry: Joi.string().required().lowercase().messages({
    "any.required": "The Industry field is required.",
    "any.type": "The Industry field must be a string.",
    "string.empty": "The Industry field cannot be empty.",
  }),

  teamSize: Joi.number().integer().min(0).required().messages({
    "number.base": "The Team size field must be a number.",
    "number.integer": "The Team size field must be an integer.",
    "number.min": "The Team size field must be greater than or equal to 0.",
    "any.required": "The Team size field is required.",
  }),

  carrierPage: Joi.string().uri().required().messages({
    "string.uri": "The Carrier page field must be a valid URI.",
    "any.required": "The Carrier page field is required.",
  }),

  linkedIn: Joi.string().uri().required().messages({
    "string.uri": "The LinkedIn field must be a valid URI.",
    "any.required": "The LinkedIn field is required.",
  }),

  logoUrl: Joi.string().uri().optional().allow("").default("").messages({
    "string.uri": "The Logo URL field must be a valid URI.",
  }),

  logo: Joi.string().allow("").optional().messages({
    "any.type": "The Logo field must be a string.",
  }),

  aboutCompany: Joi.string().allow("").optional().messages({
    "any.type": "The About Company field must be a string.",
  }),

  website: Joi.string().allow("").optional().messages({
    "any.type": "The Website field must be a string.",
  }),
});

/**
 * CompanyUpdateApiDtoValidation
 *
 * Schema for validating a company update object
 */
export const CompanyUpdateApiDtoValidation = Joi.object({
  name: Joi.string().required().uppercase().messages({
    "any.required": "The Company name field is required.",
    "any.type": "The Company name field must be a string.",
    "string.empty": "The Company name field cannot be empty.",
  }),

  industry: Joi.string().required().lowercase().messages({
    "any.required": "The Industry field is required.",
    "any.type": "The Industry field must be a string.",
    "string.empty": "The Industry field cannot be empty.",
  }),

  teamSize: Joi.number().integer().min(0).required().messages({
    "number.base": "The Team size field must be a number.",
    "number.integer": "The Team size field must be an integer.",
    "number.min": "The Team size field must be greater than or equal to 0.",
    "any.required": "The Team size field is required.",
  }),

  carrierPage: Joi.string().uri().required().messages({
    "string.uri": "The Carrier page field must be a valid URI.",
    "any.required": "The Carrier page field is required.",
  }),

  linkedIn: Joi.string().uri().required().messages({
    "string.uri": "The LinkedIn field must be a valid URI.",
    "any.required": "The LinkedIn field is required.",
  }),

  logoUrl: Joi.string().uri().optional().allow("").default("").messages({
    "string.uri": "The Logo URL field must be a valid URI.",
  }),

  logo: Joi.string().allow("").optional().messages({
    "any.type": "The Logo field must be a string.",
  }),

  aboutCompany: Joi.string().allow("").optional().messages({
    "any.type": "The About Company field must be a string.",
  }),

  website: Joi.string().allow("").optional().messages({
    "any.type": "The Website field must be a string.",
  }),

  isCompanyRequestPageFlag: Joi.boolean().required().messages({
    "any.required": "The Company request page flag field is required.",
    "boolean.base": "The Company request page flag field must be a boolean.",
  }),
});

export const CompanyRequestDTOValidation = Joi.object({
  userName: Joi.string().required().messages({
    "any.required": "The User name field is required.",
    "any.type": "The User name field must be a string.",
    "string.empty": "The User name field cannot be empty.",
  }),

  userType: Joi.string().valid("EMP", "CAND").required().messages({
    "any.only": "The User type field must be either 'EMP' or 'CAND'.",
    "any.required": "The User type field is required.",
  }),

  companyDetail: Joi.object({
    name: Joi.string().required().messages({
      "any.required": "The Company name field is required.",
    }),

    industry: Joi.string().required().messages({
      "any.required": "The Industry field is required.",
    }),

    teamSize: Joi.number().integer().min(0).messages({
      "number.base": "The Team size field must be a number.",
      "number.integer": "The Team size field must be an integer.",
      "number.min": "The Team size field must be greater than or equal to 0.",
      "any.required": "The Team size field is required.",
    }),

    carrierPage: Joi.string().uri().messages({
      "string.uri": "The Carrier page field must be a valid URI.",
      "any.required": "The Carrier page field is required.",
    }),

    linkedIn: Joi.string().uri().required().messages({
      "string.uri": "The LinkedIn field must be a valid URI.",
      "any.required": "The LinkedIn field is required.",
    }),

    logoUrl: Joi.string().uri().messages({
      "string.uri": "The Logo URL field must be a valid URI.",
      "any.required": "The Logo URL field is required.",
    }),

    logo: Joi.string().allow("").optional(),
  }),

  userEmail: Joi.string().email().required().messages({
    "any.required": "The User email field is required.",
    "string.email": "The User email field must be a valid email address.",
  }),

  jobUrl: Joi.string().uri().allow("").optional().messages({
    "string.uri": "The job request URL field must be a valid URI.",
  }),

  userContactNumber: Joi.string().allow("").optional(),
});

/**
 * CompanyListingFilterRequestDTOValidation
 *
 * This schema is used to validate the request body for listing companies
 */
export const CompanyListingFilterRequestDTOValidation = commonSchema.concat(
  Joi.object({
    companyName: Joi.string()
      .optional() // This field allows `undefined` value
      .allow("", null)
      .messages({
        "any.type": "The Company Name field must be a string.",
      }),

    industryName: Joi.string()
      .optional() // This field allows `undefined` value
      .allow("", null)
      .messages({
        "any.type": "The Industry Name field must be a string.",
      }),

    teamSize: Joi.string()
      .optional() // This field allows `undefined` value
      .allow("", null)
      .messages({
        "any.type": "The Team Size field must be a string.",
      }),

    isVerified: Joi.number()
      .integer()
      .optional() // This field allows `undefined` value
      .allow("", null)
      .messages({
        "any.type": "The Is Verified field must be a number.",
      }),
  })
);


/**
 * companyUpdateLogoApiDtoValidation
 */
export const companyUpdateLogoApiDtoValidation = Joi.object({
  companyLogoCloudFileName: Joi.string()
    .pattern(/^[^\/\\]+?\.[a-zA-Z0-9]+$/)
    .required()
    .messages({
      "any.required": "The Company logo cloud file name field is required.",
      "any.type": "The Company logo cloud file name field must be a string.",
      "string.empty": "The Company logo cloud file name field cannot be empty.",
      "string.pattern.base": "The Company logo cloud file name must be a valid filename (e.g., logo.jpg).",
    }),
});