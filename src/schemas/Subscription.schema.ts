// Import the Joi library
import Joi from "joi";

// Define a schema named SubscriptionSchema to validate subscription data.
const SubscriptionSchema = Joi.object({
  // Validate the 'name' field:
  name: Joi.string().required().messages({
    "any.required": "Name is required",
  }),

  // Validate the 'amount' field:
  amount: Joi.number().required().messages({
    "number.base": "Amount must be a number",
    "any.required": "Amount is required",
  }),

  // Validate the 'duration' field:
  duration: Joi.number().integer().required().messages({
    "number.base": "Duration must be a number",
    "number.integer": "Duration must be an integer",
    "any.required": "Duration is required",
  }),

  // Validate the 'userType' field:
  // @todo KIndly update this to read the values from enum.
  UserType: Joi.string().valid("CAND", "EMP").required().messages({
    "any.only": "User type must be either 'CAND' or 'EMP'",
    "any.required": "User type is required",
  }),
});

const SubscriptionDTOValidation = Joi.object({
  amount: Joi.number().required().messages({
    "any.required": "Amount is required.",
    "number.base": "Amount must be a number.",
  }),
  status: Joi.string()
    .valid("active", "inactive", "cancelled") // @todo KIndly update this to read the values from enum.
    .required()
    .messages({
      "any.required": "Status is required.",
      "string.base": "Status must be a string.",
      "any.only": 'Status must be one of "active", "inactive", or "cancelled".',
    }),
});

// Export the SubscriptionSchema for use in other parts of the application.
export { SubscriptionSchema, SubscriptionDTOValidation };
