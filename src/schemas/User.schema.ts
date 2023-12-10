import Joi from "joi";

export const UserLinkedinSignUpDTOValidation = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Name is required",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),

  number: Joi.number().options({ convert: false }).required().messages({
    "any.required": "Number is required",
  }),

  linkedinUrl: Joi.string().required().messages({
    "any.required": "LinkedIn URL is required",
  }),

  ECTC: Joi.number().options({ convert: false }).required().messages({
    "any.required": "ECTC is required",
    "number.base": "ECTC should be a valid number",
  }),

  YOE: Joi.number().options({ convert: false }).required().messages({
    "any.required": "YOE is required",
    "number.base": "YOE should be a valid number",
  }),

  CV: Joi.string().optional().messages({
    "any.required": "CV is required",
  }),
  userId: Joi.string().required().messages({
    "any.required": "User ID is required",
  }),
});

export const userEmployeeSignUpDTOValidation = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Name is required.",
    "string.empty": "Name cannot be empty.",
  }),
  email: Joi.string().email().required().messages({
    "any.required": "Email is required.",
    "string.email": "Please provide a valid email address.",
    "string.empty": "Email cannot be empty.",
  }),
  number: Joi.number().options({ convert: false }).required().messages({
    "any.required": "Number is required.",
    "number.base": "Number must be a valid number.",
  }),
  linkedinUrl: Joi.string().required().messages({
    "any.required": "LinkedIn URL is required.",
    "string.empty": "LinkedIn URL cannot be empty.",
  }),
  YOE: Joi.number().options({ convert: false }).integer().required().messages({
    "any.required": "Years of Experience (YOE) is required.",
    "number.base": "YOE must be a valid number.",
    "number.integer": "YOE must be an integer.",
  }),
  companyName: Joi.string().required().messages({
    "any.required": "Company Name is required.",
    "string.empty": "Company Name cannot be empty.",
  }),
  companyEmailId: Joi.string().email().required().messages({
    "any.required": "Company Email ID is required.",
    "string.email": "Please provide a valid company email address.",
    "string.empty": "Company Email ID cannot be empty.",
  }),
  department: Joi.string().required().messages({
    "any.required": "Department is required.",
    "string.empty": "Department cannot be empty.",
  }),
  designation: Joi.string().required().messages({
    "any.required": "Designation is required.",
    "string.empty": "Designation cannot be empty.",
  }),
  userId: Joi.string().required().messages({
    "any.required": "User ID is required",
  }),
});
