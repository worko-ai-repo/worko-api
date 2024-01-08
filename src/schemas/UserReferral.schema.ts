import Joi from "joi";

import { ReferralStatus } from "../enums/UserReferral.enum";

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
