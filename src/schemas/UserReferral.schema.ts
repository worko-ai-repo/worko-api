import Joi from "joi";

import { ReferralStatus } from "../enums/UserReferral.enum";
import { ReferralActions } from "../enums/User.enum";

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
  userComment: Joi.string().optional()
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

  userComment: Joi.when("action", {
    is: ReferralActions.REJECT,
    then: Joi.string().required().messages({
      "any.required": "User comment is required for rejection",
    }),
    otherwise: Joi.optional(),
  })
});
