import Joi from "joi";

export const CompanyDTOValidation = Joi.object({
  // Assuming WorkoDTO has its own validation or properties
  // ...

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
});

// export const addCompanyDTOValidation = Joi.object({

//   userType: Joi.string().valid(UserType.EMP, UserType.CAND).required()
//     .messages({
//       'string.valid': 'User type must be one of: EMP, CAND',
//       'any.required': 'User type is required',
//     }),

//   companyDetail: Joi.object({
//     name: Joi.string().required()
//       .messages({
//         'any.required': 'Company name is required',
//       }),

//     industry: Joi.string().required()
//       .messages({
//         'any.required': 'Industry is required',
//       }),

//     teamSize: Joi.number().integer().min(0).required()
//       .messages({
//         'number.base': 'Team size must be a number',
//         'number.integer': 'Team size must be an integer',
//         'number.min': 'Team size must be greater than or equal to 0',
//         'any.required': 'Team size is required',
//       }),

//     carrierPage: Joi.string().uri().required()
//       .messages({
//         'string.uri': 'Carrier page must be a valid URI',
//         'any.required': 'Carrier page is required',
//       }),

//     linkedIn: Joi.string().uri().required()
//       .messages({
//         'string.uri': 'LinkedIn must be a valid URI',
//         'any.required': 'LinkedIn is required',
//       }),

//     logoUrl: Joi.string().uri().required()
//       .messages({
//         'string.uri': 'Logo URL must be a valid URI',
//         'any.required': 'Logo URL is required',
//       }),
//   }).required()
//     .messages({
//       'object.base': 'Company detail must be an object',
//       'any.required': 'Company detail is required',
//     }),

//   status: Joi.string().valid(Status.NEW, Status.APPROVED, Status.DENIED).required()
//     .messages({
//       'string.valid': 'Status must be one of: new, approved, denied',
//       'any.required': 'Status is required',
//     }),
// });
