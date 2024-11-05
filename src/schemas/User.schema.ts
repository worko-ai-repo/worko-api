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
  ),
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
