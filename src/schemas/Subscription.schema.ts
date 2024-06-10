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

const SubscriptionCreateApiDTOValidation = Joi.object({
  masterSubscriptionId: Joi.string().required().messages({
    "any.required": "Master Subscription ID is required.",
    "string.base": "Master Subscription ID must be a string.",
  }),
  orderId: Joi.string().required().messages({
    "any.required": "Order ID is required.",
    "string.base": "Order ID must be a string.",
  }),
});

// Export the SubscriptionSchema for use in other parts of the application.
export { SubscriptionSchema, SubscriptionCreateApiDTOValidation };
