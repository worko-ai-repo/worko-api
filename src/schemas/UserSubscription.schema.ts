import Joi from "joi";

export const UserSubscriptionDTOValidation = Joi.object({
  amount: Joi.number().required().messages({
    "number.base": "Amount must be a number",
    "any.required": "Amount is required",
  }),

  status: Joi.string()
    .valid("active", "inactive", "expired")
    .required()
    .messages({
      "string.valid": "Status must be one of: active, inactive, expired",
      "any.required": "Status is required",
    }),
});
