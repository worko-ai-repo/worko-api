// Import necessary packages
import Joi from "joi";

// Define validation schema for BillDeskTransactionResponseEncryptedDTO
export const BillDeskOrderCreateTransactionRequestPlainDTOValidation =
  Joi.object({
    status: Joi.number().required().messages({
      "any.required": "Status is required.",
      "number.base": "Status must be a number.",
    }),
    txnResponse: Joi.object({
      bdcres: Joi.string().required().messages({
        "any.required": "BDC response is required.",
        "string.base": "BDC response must be a string.",
      }),
      failure_reason: Joi.string().allow("").optional(),
      mercid: Joi.string().required().messages({
        "any.required": "Merchant ID is required.",
        "string.base": "Merchant ID must be a string.",
      }),
      orderid: Joi.string().required().messages({
        "any.required": "Order ID is required.",
        "string.base": "Order ID must be a string.",
      }),
      return_url: Joi.string().required().messages({
        "any.required": "Return URL is required.",
        "string.base": "Return URL must be a string.",
      }),
      status: Joi.string().allow("").optional(),
      terminal_state: Joi.string().required().messages({
        "any.required": "Terminal state is required.",
        "string.base": "Terminal state must be a string.",
      }),
      transaction_response: Joi.string().required().messages({
        "any.required": "Transaction response is required.",
        "string.base": "Transaction response must be a string.",
      }),
    })
      .required()
      .messages({
        "any.required": "Transaction response object is required.",
        "object.base": "Transaction response must be an object.",
      }),
  });
