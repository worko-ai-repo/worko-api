import Joi from "joi";

// Import enums
import { ReferralStatus } from "../enums/UserReferral.enum";
import { ReferralActions } from "../enums/User.enum";

// Import common schema
import { commonSchema } from "../schemas/Common.schema";

export const UserReferralRequestDTOValidation = Joi.object({
  companyId: Joi.string().required().messages({
    "any.required": "companyId is required",
  }),

  jobUrl: Joi.string().required().messages({
    "any.required": "jobUrl is required",
  }),

  jdExtracted: Joi.string().required().messages({
    "any.required": "jdExtracted is required",
  }),

  jobId: Joi
    .string()
    .allow('')
    .optional()
    .messages({
      "any.type": "jobId must be a string",
    }),

  jobPortal: Joi
    .string()
    .allow('')
    .optional()
    .messages({
      "any.required": "jobPoratal is required",
      "any.type": "jobPoratal must be a string",
    }),
});

export const UserReferralStatusValidation = Joi.string()
  .valid(...Object.values(ReferralStatus))
  .required()
  .messages({
    "string.valid": `Status must be one of: ${Object.values(
      ReferralStatus
    ).join(", ")}`,
    "any.required": "Status is required",
  });

export const withdrawnReferralPayloadValidation = Joi.object({
  actionDate: Joi.date().optional(),
  reason: Joi.string().required().messages({
    "any.required": "Reason is required"
  }),
  userComment: Joi.string().allow('').optional()
});

export const UserReferralEmployeeStatusValidation = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": "User ID is required",
  }),

  action: Joi.string()
    .valid(...Object.values(ReferralActions))
    .required()
    .messages({
      "string.valid": `Action must be one of: ${Object.values(
        ReferralActions
      ).join(", ")}`,
      "any.required": "Action is required",
    }),

  emailId: Joi.string().email().required().messages({
    "any.required": "Email is required.",
    "string.email": "Please provide a valid email address.",
    "string.empty": "Email cannot be empty.",
  }),

  // Additional fields for the REJECT action
  reason: Joi.when("action", {
    is: ReferralActions.REJECT,
    then: Joi.string().required().messages({
      "any.required": "Reason is required for rejection",
    }),
    otherwise: Joi.optional(),
  }),

  userComment: Joi.string().allow('').optional()
});

// Define validation schema for referral status filter DTO
export const userReferralStatusFilterDtoValidation = commonSchema.concat(
  Joi.object({
    status: Joi.string()
      .optional()
      .valid(...Object.values(ReferralStatus))
      .messages({
        "any.only": `Invalid referral status. Please provide a valid value from
      ${Object.values(ReferralStatus).join(", ")}.`,
      })
  })
);

// Define validation schema for employee referral filter DTO
export const empReferralFilterDtoValidation = commonSchema.concat(
  Joi.object({
    status: Joi.string()
      .valid(...Object.values(ReferralStatus))
      .messages({
        "any.only": `Invalid referral status. Please provide a valid value from
      ${Object.values(ReferralStatus).join(", ")}.`,
        "string.empty": "Referral status should not be empty.",
      }),
    
    companyId: Joi.string().required().messages({
      "any.required": "Company ID is required",
      "string.empty": "Company ID should not be empty.",
    }),
  })
);