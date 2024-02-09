import Joi from "joi";

export const userDetailDTOValidation = Joi.object({
  name: Joi.string().regex(/^[a-zA-Z]+$/).required().messages({
    "any.required": "Name is required",
    "string.pattern.base": "Name must contain only alphabetic characters"
  }),
  emailList: Joi.object()
    .pattern(Joi.string(), Joi.string().email().required())
    .required()
    .messages({
      "any.required": "Email list is required.",
      "object.base": "Email list must be an object.",
    }),
    number: Joi.number().integer().required().min(1000000000).max(9999999999).messages({
      "number.base": "Number must be a valid number",
      "number.integer": "Number must be an integer",
      "number.min": "Number must be a 10-digit phone number",
      "number.max": "Number must be a 10-digit phone number",
      "any.required": "Number is required"
  }),
  userType: Joi.array()
    .items(Joi.string().valid("CAND", "EMP"))
    .required()
    .messages({
      "any.required": "User type is required.",
      "array.includesOne": "Invalid user type.",
    }),
  isEmailVerified: Joi.boolean().required().messages({
    "any.required": "Email verification status is required.",
    "boolean.base": "Invalid email verification status.",
  }),
  isNumberVerified: Joi.boolean().required().messages({
    "any.required": "Number verification status is required.",
    "boolean.base": "Invalid number verification status.",
  }),
  isSubscribed: Joi.boolean().required().messages({
    "any.required": "Subscription status is required.",
    "boolean.base": "Invalid subscription status.",
  }),
  referralCount: Joi.number().required().messages({
    "any.required": "Referral count is required.",
    "number.base": "Referral count must be a valid number.",
  }),
  location: Joi.string().optional(),
  about: Joi.string().optional(),
  CTC: Joi.number().optional(),
  ECTC: Joi.number().optional(),
  noticePeriod: Joi.number().optional(),
  YOE: Joi.number().required().messages({
    "any.required": "Years of experience is required.",
    "number.base": "Years of experience must be a valid number.",
  }),
  CV: Joi.string().optional(),
  coverLetter: Joi.string().optional(),
  lastAccessedDash: Joi.string().required().messages({
    "any.required": "Last accessed dashboard date is required.",
    "string.empty": "Last accessed dashboard date cannot be empty.",
  }),
  profileImage: Joi.string().optional(),
}).options({ stripUnknown: true });
