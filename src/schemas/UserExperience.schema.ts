import Joi from "joi";

export const userExperienceDTOValidation = Joi.object({
  department: Joi.string().required().messages({
    "any.required": "Department is required.",
    "string.empty": "Department should not be empty.",
  }),
  designation: Joi.string().required().messages({
    "any.required": "Designation is required.",
    "string.empty": "Designation should not be empty.",
  }),
  designationTag: Joi.number(),
  startedMonth: Joi.number().integer().min(1).max(12),
  endedMonth: Joi.number().integer().min(1).max(12),
  startedYear: Joi.number().integer().min(1900).max(new Date().getFullYear()),
  endedYear: Joi.number().integer().min(1900).max(new Date().getFullYear()),
  companyName: Joi.string().required().messages({
    "any.required": "Company Name is required.",
    "string.empty": "Company Name should not be empty.",
  }),
  emailId: Joi.string().email().required().messages({
    "any.required": "Email ID is required.",
    "string.empty": "Email ID should not be empty.",
    "string.email": "Email ID must be a valid email address.",
  }),
});

export const userExperienceDTOArrayValidation = Joi.array().items(
  Joi.object({
    department: Joi.string().required().messages({
      "any.required": "Department is required.",
      "string.empty": "Department should not be empty.",
    }),
    designation: Joi.string().required().messages({
      "any.required": "Designation is required.",
      "string.empty": "Designation should not be empty.",
    }),
    designationTag: Joi.number(),
    startedMonth: Joi.number().integer().min(1).max(12),
    endedMonth: Joi.number().integer().min(1).max(12),
    startedYear: Joi.number().integer().min(1900).max(new Date().getFullYear()),
    endedYear: Joi.number().integer().min(1900).max(new Date().getFullYear()),
    companyName: Joi.string().required().messages({
      "any.required": "Company Name is required.",
      "string.empty": "Company Name should not be empty.",
    }),
    emailId: Joi.string().email().required().messages({
      "any.required": "Email ID is required.",
      "string.empty": "Email ID should not be empty.",
      "string.email": "Email ID must be a valid email address.",
    }),
  }).options({ stripUnknown: true })
);
