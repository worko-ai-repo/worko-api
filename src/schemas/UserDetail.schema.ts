// import joi
import Joi from "joi";

// import enums
import { UserDetailDbGenderEnum, UserType } from "../enums/User.enum";

const candidateExperienceSchema = Joi.object({
  companyId: Joi.string().optional(),
  companyName: Joi.string().allow("").optional().messages({
    "string.empty": "Company Name should not be empty.",
  }),
  designation: Joi.string().allow("").optional().messages({
    "string.empty": "Designation should not be empty.",
  }),
  department: Joi.string().allow("").optional().messages({
    "string.empty": "Department should not be empty.",
  }),
  YOE: Joi.number().optional().messages({
    "number.base": "YOE must be a valid number.",
    "number.integer": "YOE must be an integer.",
  }),
  startDate: Joi.string().isoDate().optional().messages({
    "date.base": "Start date must be a valid ISO date string.",
  }),
  endDate: Joi.string().allow("").isoDate().optional().messages({
    "date.base": "End date must be a valid ISO date string.",
  }),
});

export const userDetailDTOValidation = Joi.object({
  name: Joi.string()
    .regex(/^[a-zA-Z\u00C0-\u01FF\s.'-]+$/)
    .lowercase() // Convert the name to lowercase
    .required()
    .messages({
      "any.required": "Name is required",
      "string.pattern.base":
        "Name must contain only alphabetic characters, spaces, dots, apostrophes, or hyphens",
    }),
  gender: Joi.string()
    .valid(...Object.values(UserDetailDbGenderEnum))
    .optional()
    .messages({
      "any.only": `Invalid gender value . Please provide a valid value from
      ${Object.values(UserDetailDbGenderEnum).join(", ")}.`,
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
  location: Joi.string().optional().allow(""),
  about: Joi.string().optional().allow(""),
  CTC: Joi.number().optional(),
  ECTC: Joi.number().optional(),
  noticePeriod: Joi.number().optional(),
  isNoticePeriodNegotiable: Joi.boolean().optional().messages({
    "boolean.base": "Invalid notice period negotiable status.",
  }),
  YOE: Joi.number().optional().messages({
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
  country: Joi.string().optional().allow(""),
  // validate isCandidateFresher when lastAccessedDash is set to be cand or other dont accept it and throw forbiden error
  // isCandidateFresher: Joi.when("lastAccessedDash", {
  //   is: UserType.CAND,
  //   then: Joi.boolean().required().messages({
  //     "any.required":
  //       "The 'isCandidateFresher' field is required for Candidate.",
  //     "boolean.base": "The value for 'isCandidateFresher' must be a boolean.",
  //   }),
  //   otherwise: Joi.forbidden(),
  // }),
  isCandidateFresher: Joi.boolean().required().messages({
    "any.required": "The 'isCandidateFresher' field is required for Candidate.",
    "boolean.base": "The value for 'isCandidateFresher' must be a boolean.",
  }),
  // // Validate candidateExperience when lastAccessedDash is set to be cand
  // candidateExperience: Joi.when("lastAccessedDash", {
  //   // check before validating whether the isCandidateFresher is set to false then only validate
  //   is: UserType.CAND,
  //   then: Joi.when("isCandidateFresher", {
  //     is: false,
  //     then: candidateExperienceSchema.required().messages({
  //       "any.required":
  //         "The 'candidateExperienceSchema' field is required for Candidate.",
  //     }),
  //     otherwise: candidateExperienceSchema.forbidden(),
  //   }),
  //   otherwise: Joi.forbidden(),
  // }),
  candidateExperience: Joi.when("isCandidateFresher", {
      is: false,
      then: candidateExperienceSchema.required().messages({
        "any.required":
          "The 'candidateExperienceSchema' field is required for Candidate.",
      }),
      otherwise: candidateExperienceSchema.forbidden(),
    }),
  // multipleCandidateExperience: Joi.when("lastAccessedDash", {
  //   is: UserType.CAND,
  //   then: Joi.array().items(candidateExperienceSchema).optional().min(1).messages({
  //     "array.min": "At least one candidate experience is required.",
  //   }),
  //   otherwise: Joi.forbidden(),
  // }),
  multipleCandidateExperience: Joi.array()
    .items(candidateExperienceSchema)
    .optional()
    .min(1)
    .messages({
      "array.min": "At least one candidate experience is required.",
    }),
  responsibilities: Joi.array()
    .items(
      Joi.object({
        companyId: Joi.string().optional(),
        companyName: Joi.string().optional(),
        date: Joi.object({
          startDate: Joi.string().isoDate().required().messages({
            "any.required": "Start date is required.",
            "string.isoDate": "Start date must be a valid ISO date string.",
          }),
          // Empty string or undefined represents that the candidate is still working here
          endDate: Joi.string().isoDate().optional().allow("").messages({
            "string.isoDate": "End date must be a valid ISO date string.",
          }),
        }),
        description: Joi.string().required().messages({
          "any.required": "Description is required.",
          "string.base": "Description must be a string.",
        }),
      })
    )
    .optional()
    .messages({
      "array.base": "Responsibilities must be an array of strings.",
    }),
  isWhatsappNotificationEnabled: Joi.boolean().default(true).optional(),
}).options({ stripUnknown: true });

export const userDetailUpdateApiDtoValidation = Joi.object({
  isNumberVerified: Joi.boolean().optional().messages({
    "boolean.base": "Provided value must be a boolean.",
  }),
  isEmailVerified: Joi.boolean().optional().messages({
    "boolean.base": "Provided value must be a boolean.",
  }),
  isAlreadyVerifiedInCognito: Joi.boolean().optional().messages({
    "boolean.base": "Provided value must be a boolean.",
  }),
});

export const userDetailForceChangePasswordSendOtpApiDtoValidation = Joi.object({
  candidateRegisteredEmail: Joi.string().email().required().messages({
    "any.required": "Candidate registered email is required.",
    "string.email": "Candidate registered email is invalid.",
  }),
});

export const userDetailForceChangePasswordVerifyOtpApiDtoValidation = Joi.object({
  candidateRegisteredEmail: Joi.string().email().required().messages({
    "any.required": "Candidate registered email is required.",
    "string.email": "Candidate registered email is invalid.",
  }),
  otp: Joi.string().required().messages({
    "any.required": "OTP is required.",
    "string.empty": "OTP should not be empty.",
  }),
})