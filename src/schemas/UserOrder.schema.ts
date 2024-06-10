// Import necessary packages
import Joi from "joi";

// import Enums 
import { UserOrderTypeEnum, UserOrderPaymentGatewayProviderEnum } from "../enums/UserOrder.enum";

// import schemas 
import { userOrderProductCreateRequestDtoValidation } from "./UserOrderProduct.schema";
import { BillDeskOrderCreateTransactionRequestPlainDTOValidation } from "./BillDesk.schema";
import { RazorpayOrderCreateTransactionRequestPlainDTOValidation } from "./Razorpay.schema";


// Define validation schema for user order creation API DTO
export const userOrderCreateApiDtoValidation = Joi.object({
    // Validate orderId field (optional)
    orderId: Joi.string().allow('').optional(),

    // Validate pgatewayProvider field (optional)
    pgatewayProvider: Joi.string().valid(...Object.values(UserOrderPaymentGatewayProviderEnum)).optional(),

    // Validate orderType field
    orderType: Joi.string().valid(...Object.values(UserOrderTypeEnum)).required().messages({
        "any.required": "Order type is required.",
        "any.only": `Invalid order type. Please provide a valid value from 
        ${Object.values(UserOrderTypeEnum).join(", ")}.`,
    }),

    // validate ipAddress
    returnUrl: Joi.string().required().messages({
        "any.required": "Return url required.",
    }),

    // Validate subTotalAmount field (minimum value of 1)
    subTotalAmount: Joi.number().required().min(1).messages({
        "any.required": "Subtotal amount is required.",
        "number.base": "Subtotal amount must be a number.",
        "number.min": "Subtotal amount must be at least 1.",
    }),

    // Validate discountAmount field
    discountAmount: Joi.number().required().messages({
        "any.required": "Discount amount is required.",
        "number.base": "Discount amount must be a number.",
    }),

    // Validate gstAmount field 
    gstAmount: Joi.number().required().messages({
        "any.required": "GST amount is required.",
        "number.base": "GST amount must be a number.",
    }),

    // Validate products field
    // Only required if orderId is not present
    products: Joi.array().items(userOrderProductCreateRequestDtoValidation).when('orderId', {
        is: '',
        then: Joi.required(),
        otherwise: Joi.optional()
    }).messages({
        "any.required": "Products are required when orderId is not provided.",
        "array.base": "Products must be an array.",
    }),

    // Note: Don't expect this value from user, instead override it from the application, after receiving request.
    ipAddress: Joi.string().allow('').optional(),

    // Note: Don't expect this value from user, instead override it from the application, after receiving request.
    userAgent: Joi.string().allow('').optional(),
});


// Define validation schema for UserOrderProcessGatewayTransactionRequestDTO
export const userOrderGatewayTransactionRequestDtoValidation = Joi.object({
  // Validate userId field
  userId: Joi.string().required().messages({
    "any.required": "User ID is required.",
    "string.base": "User ID must be a string.",
  }),

  // Validate orderType field
  orderType: Joi.string().valid(...Object.values(UserOrderTypeEnum)).required().messages({
    "any.required": "Order type is required.",
    "any.only": `Invalid order type. Please provide a valid value from ${Object.values(UserOrderTypeEnum).join(", ")}.`,
  }),

  // Validate orderId field
  orderId: Joi.string().required().messages({
    "any.required": "Order ID is required.",
    "string.base": "Order ID must be a string.",
  }),

  // Validate orderTxnId field
  orderTxnId: Joi.string().required().messages({
    "any.required": "Order transaction ID is required.",
    "string.base": "Order transaction ID must be a string.",
  }),

  // Validate pgatewayProvider field
  pgatewayProvider: Joi.string().valid(...Object.values(UserOrderPaymentGatewayProviderEnum)).required().messages({
    "any.required": "Payment gateway provider is required.",
    "any.only": `Invalid payment gateway provider. Please provide a valid value from ${Object.values(UserOrderPaymentGatewayProviderEnum).join(", ")}.`,
  }),

  // Conditional validation for pgResponse field
  pgResponse: Joi.alternatives()
    .conditional('pgatewayProvider', {
      is: UserOrderPaymentGatewayProviderEnum.RAZORPAY,
      then: RazorpayOrderCreateTransactionRequestPlainDTOValidation.required(),
      otherwise: BillDeskOrderCreateTransactionRequestPlainDTOValidation.required()
    })
    .messages({
      "any.required": "Payment gateway response is required.",
      "alternatives.types": "Payment gateway response must match one of the expected types.",
    }),
});

