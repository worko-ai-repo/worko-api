// Import necessary packages
import Joi from "joi";

// import Enums 
import { UserOrderProductContextTypeEnum } from "../enums/UserOrderProduct.enum";

// Define validation schema for user order product creation API DTO
export const userOrderProductCreateRequestDtoValidation = Joi.object({
    // Validate productContext field
    productContext: Joi.string().valid(...Object.values(UserOrderProductContextTypeEnum)).required().messages({
        "any.required": "Product context is required.",
        "any.only": `Invalid product context. Please provide a valid value from 
        ${Object.values(UserOrderProductContextTypeEnum).join(", ")}.`,
    }),

    // Validate productContextId field
    productContextId: Joi.string().required().messages({
        "any.required": "Product context ID is required.",
        "string.empty": "Product context ID should not be empty.",
    }),

    // Validate productContextDetails field (optional) //@todo : Prepare from contextid and pass here 
    productContextDetails: Joi.object().optional(),

    // Validate unitPrice field (minimum value of 1)
    unitPrice: Joi.number().required().min(1).messages({
        "any.required": "Unit price is required.",
        "number.base": "Unit price must be a number.",
        "number.min": "Unit price must be at least 1.",
    }),

     // Validate quantity field (minimum value of 1)
     quantity: Joi.number().required().min(1).messages({
        "any.required": "Quantity is required.",
        "number.base": "Quantity must be a number.",
        "number.min": "Quantity must be at least 1.",
    }),

    // Validate totalAmount field (minimum value of 1)
    totalAmount: Joi.number().required().min(1).messages({
        "any.required": "Total amount is required.",
        "number.base": "Total amount must be a number.",
        "number.min": "Total amount must be at least 1.",
    }),
});
