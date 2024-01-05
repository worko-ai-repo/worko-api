import Joi from "joi";

export const userDetailDTOValidation = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Name is required.",
    "string.empty": "Name cannot be empty.",
  }),
  emailList: Joi.object()
    .pattern(Joi.string(), Joi.string().email().required())
    .required()
    .messages({
      "any.required": "Email list is required.",
      "object.base": "Email list must be an object.",
    }),
  number: Joi.number().required().messages({
    "any.required": "Number is required.",
    "number.base": "Number must be a valid number.",
  }),
  userType: Joi.array()
    .items(Joi.string().valid("admin", "user"))
    .required()
    .messages({
      "any.required": "User type is required.",
      "array.includesOne": "Invalid user type.",
    }),
  linkedinUrl: Joi.string().uri().required().messages({
    "any.required": "LinkedIn URL is required.",
    "string.uri": "Invalid LinkedIn URL.",
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
