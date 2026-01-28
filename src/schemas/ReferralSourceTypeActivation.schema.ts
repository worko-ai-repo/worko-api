// Import npm packages
import Joi from "joi";

export const createReferralSourceTypeActivationApiDtoValidation = Joi.object({
  referralSourceTypeEmail: Joi.string().required().messages({
    "any.required": "Referral source type email is required.",
    "string.empty": "Referral source type email should not be empty.",
    "string.base": "Referral source type email should be a string.",
  }),
  isEmailVerified: Joi.boolean().valid(true).required().messages({
    "any.required": "Email verification status is required.",
    "boolean.base": "Invalid email verification status.",
    "boolean.valid": "Email is not verified."
  })
});