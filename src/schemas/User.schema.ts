// Import joi 
import Joi from "joi";

export const UserSignUpDTOValidation = Joi.object({
  name: Joi.string()
    .regex(/^[a-zA-Z\u00C0-\u01FF\s.'-]+$/)
    .lowercase()
    .required()
    .messages({
      "any.required": "Name is required",
      "string.pattern.base":
        "Name must contain only alphabetic characters, spaces, dots, apostrophes, or hyphens",
    }),
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .messages({
      "any.required": "Email is required.",
      "string.email": "Please provide a valid email address.",
      "string.empty": "Email cannot be empty.",
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

  linkedinUrl: Joi.string()
    .regex(
      /^(https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_\-]+\/?)$/,
      "LinkedIn URL is not valid"
    )
    .optional()
    .messages({
      "string.pattern.base": "Please Provide Valid URL",
    }),
  ECTC: Joi.number().min(0).options({ convert: false }).optional().messages({
    "number.base": "ECTC should be a valid number",
    "number.min": "Number must be greater than or equal to 0",
  }),
  CTC: Joi.number().min(0).options({ convert: false }).optional().messages({
    "number.base": "CTC should be a valid number",
    "number.min": "Number must be greater than or equal to 0",
  }),
  YOE: Joi.number().min(0).options({ convert: false }).optional().messages({
    "number.base": "YOE should be a valid number",
    "number.min": "Number must be greater than or equal to 0",
  }),
  CV: Joi.string().optional().messages({
    "any.required": "CV is required",
  }),
  userId: Joi.string().required().messages({
    "any.required": "User ID is required",
  }),
  acceptedTermsAndConditions: Joi.boolean().valid(true).required().messages({
    "any.required": "acceptedTermsAndConditions is required.",
    "boolean.base": "acceptedTermsAndConditions must be a boolean.",
    "any.only": "acceptedTermsAndConditions must be true.",
  }),
}).options({ stripUnknown: true });

export const userEmployeeSignUpDTOValidation = Joi.object({
  name: Joi.string()
    .regex(/^[a-zA-Z\u00C0-\u01FF\s.'-]+$/)
    .required()
    .lowercase()
    .messages({
      "any.required": "Name is required",
      "string.pattern.base":
        "Name must contain only alphabetic characters, spaces, dots, apostrophes, or hyphens",
    }),
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .messages({
      "any.required": "Email is required.",
      "string.email": "Please provide a valid email address.",
      "string.empty": "Email cannot be empty.",
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

  linkedinUrl: Joi.string().regex(
    /^(https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_\-]+\/?)$/,
    "LinkedIn URL is not valid"
  ).optional().allow("").messages({
    "string.pattern.base": "Please Provide Valid URL",
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
  companySK: Joi.string().required().messages({
    "any.required": "Company SK is required.",
    "string.empty": "Company SK should not be empty.",
  }),
  companyEmailId: Joi.string().email().optional().allow("").messages({
    "string.email": "Please provide a valid email address.",
  }),
  department: Joi.string().optional().allow(""),
  // UI removed the `designation` & `designationTag` fields from sign-up page
  /* designation: Joi.string().required().messages({
    "any.required": "Designation is required.",
    "string.empty": "Designation cannot be empty.",
  }),
  designationTag: Joi.number()
    .options({ convert: false })
    .integer()
    .required()
    .messages({
      "any.required": "designationTag is required.",
      "number.base": "designationTag must be a valid number.",
      "number.integer": "designationTag must be an integer.",
    }), */
  userId: Joi.string().required().messages({
    "any.required": "User ID is required",
  }),
  acceptedTermsAndConditions: Joi.boolean().valid(true).required().messages({
    "any.required": "acceptedTermsAndConditions is required.",
    "boolean.base": "acceptedTermsAndConditions must be a boolean.",
    "any.only": "acceptedTermsAndConditions must be true.",
  }),
});

export const validateEmailField = (email: string) => {
  const Email = Joi.string().email().required().lowercase().messages({
    "any.required": "Email is required.",
    "string.email": "Please provide a valid email address.",
    "string.empty": "Email cannot be empty.",
  });

  return Email.validate(email);
};

/**
 * userlastAccessedDashDTOValidation
 * 
 * This schema is used to validate the lastAccessedDash field in the UserDetail table.
 */
export const userlastAccessedDashDTOValidation = Joi
      .string()
      .valid('CAND', 'EMP') // Only allow specific string values
      .required() // This field must be present
      .messages({
          "any.required": "lastAccessedDash is required.", // Custom message for missing field
          "any.only": `lastAccessedDash must be one of the allowed values: CAND, EMP`, // Custom message for invalid values
      });

/**
 * userDetailSettingsDTOValidation
 */
export const userDetailSettingsDTOValidation = Joi.object({
  subscribedEmailId: Joi
  .string()
  .email()
  .optional()
  .lowercase()
  .messages({
    "string.email": "Please provide a valid email address.",
  }),
});

export const userParseCvRequestApiDTOValidation = Joi.object({
  s3ResumeId: Joi.string().required().messages({
    "any.required": "The s3ResumeId field is required.",
    "string.empty": "The s3ResumeId field cannot be empty.",
    "any.type": "The s3ResumeId field must be a string.",
  }),
});

export const userUpdateResumeDtoValidation = Joi.object({
  resume: Joi.string().required().messages({
    "any.required": "The resume field is required.",
    "string.empty": "The resume field cannot be empty.",
    "any.type": "The resume field must be a string.",
  }),

  userCvFileName: Joi.string().required().messages({
    "any.required": "The userCvFileName field is required.",
    "string.empty": "The userCvFileName field cannot be empty.",
    "any.type": "The userCvFileName field must be a string.",
  }),

  /**
   * We are accepting only false value for isCvExtracted
   * because if user uploads the CV then we will start the CV parsing process
   * again and once the CV is parsed then we will update the isCvExtracted field from ai code
   */
  isCvExtracted: Joi.boolean().valid(false).required().messages({
    "any.required": "The isCvExtracted field is required.",
    "boolean.base": "The isCvExtracted field must be a boolean.",
  }),
});

export const userPartialCvExtractDetailUpdateApiDtoValidation = Joi.object({
  coreSkills: Joi.array()
    .items(
      Joi.object({
        skillName: Joi.string().required().lowercase().messages({
          "any.required": "The skillName field is required.",
          "string.empty": "The skillName field cannot be empty.",
          "any.type": "The skillName field must be a string.",
        }),
        years: Joi.number().required().messages({
          "any.required": "The years field is required.",
          "number.base": "The years field must be a number.",
        }),
        timestamps: Joi.object({
          createdAt: Joi.string().isoDate().required().messages({
            "any.required": "The createdAt field is required.",
            "string.empty": "The createdAt field cannot be empty.",
            "any.type": "The createdAt field must be a string.",
          }),
          updatedAt: Joi.string().isoDate().required().messages({
            "any.required": "The updatedAt field is required.",
            "string.empty": "The updatedAt field cannot be empty.",
            "any.type": "The updatedAt field must be a string.",
          }),
        }).optional(),
      })
    )
    .required()
    .messages({
      "any.required": "The coreSkills field is required.",
      "array.base": "The coreSkills field must be an array.",
    }),
  userPreferredlocations: Joi.array()
    .items(Joi.string().required().lowercase().messages({
      "any.required": "The userPreferredlocations field is required.",
      "string.empty": "The userPreferredlocations field cannot be empty.",
      "any.type": "The userPreferredlocations field must be a string.",
    }))
    .required()
    .messages({
      "any.required": "The userPreferredlocations field is required.",
      "array.base": "The userPreferredlocations field must be an array.",
    }),
  noticePeriod: Joi.number().required().messages({
    "any.required": "The noticePeriod field is required.",
    "number.base": "The noticePeriod field must be a number.",
  }),
  YOE: Joi.number().required().messages({
    "any.required": "The YOE field is required.",
    "number.base": "The YOE field must be a number.",
  }),
  CTC: Joi.number().required().messages({
    "any.required": "The CTC field is required.",
    "number.base": "The CTC field must be a number.",
  }),
  userPreferredDepartments: Joi.array()
    .items(Joi.string().lowercase().required().messages({
      "any.required": "The userPreferredDepartments field is required.",
      "string.empty": "The userPreferredDepartments field cannot be empty.",
      "any.type": "The userPreferredDepartments field must be a string.",
    }))
    .required()
    .messages({
      "any.required": "The userPreferredDepartments field is required.",
      "array.base": "The userPreferredDepartments field must be an array.",
    }),
})