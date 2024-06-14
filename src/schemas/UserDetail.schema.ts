// import joi
import Joi from "joi";

// import enums
import { UserType } from "../enums/User.enum";

const candidateExperienceSchema = Joi.object({
  companyName: Joi.string().allow("").optional().messages({
    "string.empty": "Company Name should not be empty.",
  }),
  designation: Joi.string().allow("").optional().messages({
    "string.empty": "Designation should not be empty.",
  }),
  department: Joi.string().allow("").optional().messages({
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
  // validate isCandidateFresher when lastAccessedDash is set to be cand or other dont accept it and throw forbiden error 
  isCandidateFresher: Joi.when("lastAccessedDash", {
    is: UserType.CAND,
    then: Joi.boolean().required().messages({
      "any.required":
        "The 'isCandidateFresher' field is required for Candidate.",
      "boolean.base": "The value for 'isCandidateFresher' must be a boolean.",
    }),
    otherwise: Joi.forbidden(),
  }),
  // Validate candidateExperience when lastAccessedDash is set to be cand
  candidateExperience: Joi.when("lastAccessedDash", {
    // check before validating whether the isCandidateFresher is set to false then only validate 
    is: UserType.CAND,
    then: Joi.when("isCandidateFresher", {
      is: false,
      then: candidateExperienceSchema.required().messages({
        "any.required":
          "The 'candidateExperienceSchema' field is required for Candidate.",
      }),
      otherwise: candidateExperienceSchema.forbidden(),
    }),
    otherwise: Joi.forbidden(),
  }),
}).options({ stripUnknown: true });
