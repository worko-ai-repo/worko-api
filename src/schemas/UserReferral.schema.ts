import Joi from "joi";

import { ReferralStatus } from "../enums/UserReferral.enum";
import { ReferralActions } from "../enums/User.enum";

export const UserReferralRequestDTOValidation = Joi.object({
  companySK: Joi.string().required().messages({
    "any.required": "CompanySK is required",
  }),

  jobUrl: Joi.string().required().messages({
    "any.required": "jobUrl is required",
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
});
