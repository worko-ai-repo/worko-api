// Import necessary packages
import Joi from "joi";

// Define validation schema for RazorpayTransactionResponseEncrptedDTO
export const RazorpayOrderCreateTransactionRequestPlainDTOValidation = Joi.object({
  razorpay_order_id: Joi.string().required().messages({
    "any.required": "Razorpay order ID is required.",
    "string.base": "Razorpay order ID must be a string.",
  }),
  razorpay_payment_id: Joi.string().required().messages({
    "any.required": "Razorpay payment ID is required.",
    "string.base": "Razorpay payment ID must be a string.",
  }),
  razorpay_signature: Joi.string().required().messages({
    "any.required": "Razorpay signature is required.",
    "string.base": "Razorpay signature must be a string.",
  }),
});
