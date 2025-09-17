// Import joi 
import Joi from "joi";

// Import luxon
import { DateTime } from "luxon";

// Import enums
import { UserGuidanceRequestTypeEnum } from "../enums/User.enum";

//Import schemas
import { commonSchema } from "./Common.schema";


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

/**
 * userGuidanceRequestCreateApiDTOValidation
 */
export const userGuidanceRequestCreateApiDTOValidation = Joi.object({
  guidanceRequestType: Joi.string()
    .valid(...Object.values(UserGuidanceRequestTypeEnum)) // Ensure it matches the enum values
    .required()
    .messages({
      "any.required": "The Guidance request type field is required.",
      "string.valid": `The Guidance request type field must be one of: ${Object.values(
        UserGuidanceRequestTypeEnum
      ).join(", ")}.`,
    }),

  guidanceRequestDeadline: Joi.string()
    .isoDate() // Ensures the string is in ISO 8601 date format
    .required()
    .custom((value, helpers) => {
      /**
       * @todo: We are anticipating that the `zone` parameter is auto set to `utc`, Please review whether
       * it is auto set to `utc` or not, and if it is auto set to `utc`, then
       * remove the `zone` parameter
       */
      const inputDate = DateTime.fromISO(value, { zone: "utc" });
      const today = DateTime.utc().startOf("day"); // Get today's date (00:00:00 UTC)

      if (!inputDate.isValid) {
        return helpers.error("string.isoDate");
      }

      if (inputDate < today) {
        return helpers.error("date.min", { min: today.toISO() });
      }

      return value;
    })
    .messages({
      "string.isoDate":
        "Please provide a valid ISO 8601 date (e.g., 2025-01-27T11:26:06.458Z).",
      "any.required": "The Guidance request deadline field is required.",
      "date.min":
        "The guidance request deadline field must be today or a future date.",
    }),

  companyName: Joi.string().trim().uppercase().required().messages({
    "any.required": "The Company name field is required.",
    "string.empty": "The Company name field is required.",
    "any.type": "The Company name field must be a string.",
  }),

  companyId: Joi
    .string()
    .trim()
    .optional()
    .messages({
      "any.type": "The Company ID field must be a string.",
    }),

  jobUrl: Joi.string()
    .uri() // Ensures it is a valid URL
    .required()
    .messages({
      "string.uri": "Please provide a valid job URL.",
      "any.required": "The Job URL field is required.",
      "string.empty": "The Job URL field cannot be empty.",
      "any.type": "The Job URL field must be a string.",
    }),

  guidanceRequestDescription: Joi.string().trim().required().messages({
    "any.required": "The Guidance request description field is required.",
    "string.empty": "The Guidance request description field is required.",
    "any.type": "The Guidance request description field must be a string.",
  }),
});

export const userGuidanceRequestFilterDtoValidation = commonSchema.concat(
  Joi.object({
      email: Joi.string()
      .optional()
      .email()
      .messages({
        "string.email": "Please provide a valid email address.",
      }),
      companyName: Joi.string()
      .optional()
      .email()
      .messages({
        "any.type": "The Company name field must be a string.",
      }),
      guidanceRequestType: Joi.string()
      .optional()
      .valid(...Object.values(UserGuidanceRequestTypeEnum))
      .messages({
        "any.only": `Invalid guidance request type. Please provide a valid value from
      ${Object.values(UserGuidanceRequestTypeEnum).join(", ")}.`,
      }),
  })
);
