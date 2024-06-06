import Joi from "joi";

const candidateExperienceSchema = Joi.object({
  companyName: Joi.string().allow('').optional().messages({
    "string.empty": "Company Name should not be empty.",
  }),
  designation: Joi.string().allow('').optional().messages({
    "string.empty": "Designation should not be empty.",
  }),
  department: Joi.string().allow('').optional().messages({
    "string.empty": "Department should not be empty.",
  }),
});

export const userDetailDTOValidation = Joi.object({
  name: Joi.string()
    .regex(/^[a-zA-Z\u00C0-\u01FF\s.'-]+$/)
    .required()
    .messages({
      "any.required": "Name is required",
      "string.pattern.base":
        "Name must contain only alphabetic characters, spaces, dots, apostrophes, or hyphens",
    }),
  emailList: Joi.object()
    .pattern(Joi.string(), Joi.string().email().required())
    .required()
    .messages({
      "any.required": "Email list is required.",
      "object.base": "Email list must be an object.",
    }),
  number: Joi.string()
    .required()
    .regex(/^\+?\d{2,16}$/)
    .messages({
      "string.base": "Number must be a string",
      "string.empty": "Number cannot be empty",
      "string.pattern.base": "Number must be a valid phone number",
      "any.required": "Number is required",
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
  coverLetter: Joi.string().allow('').optional(),
  lastAccessedDash: Joi.string().required().messages({
    "any.required": "Last accessed dashboard date is required.",
    "string.empty": "Last accessed dashboard date cannot be empty.",
  }),
  profileImage: Joi.string().optional(),
    //country
    country: Joi.string().required().messages({
      "any.required": "Country is Required.",
      "string.empty": "Country Cannot be Empty !",
    }),
    isCandidateFresher: Joi.boolean().required().default(false).messages({
      "any.required": "isCandidateFresher is required.",
      "boolean.base": "Invalid isCandidateFresher status.",
    }),
    
    // If user type is Cand ask the candidateExperince fields along with optional details but if it other then throw forbidden message
    candidateExperience: Joi.when('userType', {
      is: Joi.array().items(Joi.string().valid('CAND')),
      then: candidateExperienceSchema.optional(),
      otherwise: Joi.when('userType', {
        is: Joi.array().items(Joi.string().valid('EMP')),
        then: Joi.forbidden(),
        otherwise: Joi.forbidden()
      })
    }),
  }).options({ stripUnknown: true });