import Joi from "joi";

export const UserReferralRequestDTOValidation = Joi.object({
  status: Joi.string()
    .valid("pending", "approved", "rejected")
    .required()
    .messages({
      "string.valid": "Status must be one of: pending, approved, rejected",
      "any.required": "Status is required",
    }),

  company: Joi.string().required().messages({
    "any.required": "Company is required",
  }),
});
