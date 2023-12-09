import Joi from "joi";

export const UserReferralRequestDTOValidation = Joi.object({
  status: Joi.string()
    .valid("pending", "approved", "rejected") // @todo KIndly update this to read the values from enum.
    .required()
    .messages({
      "string.valid": "Status must be one of: pending, approved, rejected",
      "any.required": "Status is required",
    }),

  company: Joi.string().required().messages({
    "any.required": "Company is required",
  }),
});
