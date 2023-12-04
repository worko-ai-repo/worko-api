import Joi from "joi";

export const UserLinkedinSignUpDTOValidation = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Name is required",
  }),

  emailList: Joi.object()
    .pattern(/.*/, Joi.string().email().required())
    .required()
    .messages({
      "object.base": "Email list must be an object",
      "object.pattern.any": "Invalid email format in the email list",
      "any.required": "Email list is required",
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

  CV: Joi.string().required().messages({
    "any.required": "CV is required",
  }),
});
