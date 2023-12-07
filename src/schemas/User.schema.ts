import Joi from "joi";

export const UserLinkedinSignUpDTOValidation = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Name is required",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),

  number: Joi.number().required().messages({
    "any.required": "Number is required",
  }),

  linkedinUrl: Joi.string().required().messages({
    "any.required": "LinkedIn URL is required",
  }),

  ECTC: Joi.number().required().messages({
    "any.required": "ECTC is required",
  }),

  YOE: Joi.number().required().messages({
    "any.required": "YOE is required",
  }),

  CV: Joi.string().optional().messages({
    "any.required": "CV is required",
  }),
});
