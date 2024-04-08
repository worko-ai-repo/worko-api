// Import necessary packages
import Joi from "joi"; // Joi package for validation
import { UserCorporateRequestStatusEnum } from "../enums/User.enum";

// Define validation schema for user corporate request creation API DTO
export const userCorporateRequestCreateApiDtoValidation = Joi.object({
    // Validate userFullName field
    userFullName: Joi.string().required().messages({
        "any.required": "User full name is required.",
        "string.empty": "User full name should not be empty.",
    }),

    // Validate userEmail field
    userEmail: Joi.string().email().required().messages({
        "any.required": "User email is required.",
        "string.email": "User email must be a valid email address.",
        "string.empty": "User email should not be empty.",
    }),

    // Validate contactNumber field
    contactNumber: Joi.string().required().messages({
        "any.required": "Contact number is required.",
        "string.empty": "Contact number should not be empty.",
    }),

    // Validate isContactNumberVerified field
    isContactNumberVerified: Joi.boolean().required().messages({
        "any.required": "Contact number verification status is required.",
        "boolean.base": "Contact number verification status must be true or false.",
    }),

    // Validate companyName field
    companyName: Joi.string().required().messages({
        "any.required": "Company name is required.",
        "string.empty": "Company name should not be empty.",
    }),

    // Validate userDesignation field
    userDesignation: Joi.string().required().messages({
        "any.required": "User designation is required.",
        "string.empty": "User designation should not be empty.",
    }),

    // Validate userMessage field
    userMessage: Joi.string().required().messages({
        "any.required": "User message is required.",
        "string.empty": "User message should not be empty.",
    }),
});

export const userCorporateRequestUpdateApiDtoValidation = Joi.object({
    // Validate status field
    status: Joi.string()
        .valid(...Object.values(UserCorporateRequestStatusEnum))
        .required()
        .messages({
            "any.required": "Status is required.",
            "any.only": `Invalid status. Please provide a valid value from 
        ${Object.values(UserCorporateRequestStatusEnum).join(", ")}.`,
            "string.empty": "Status should not be empty.",
        }),
    // Validate adminComment field
    adminComment: Joi.string().allow("").optional(),
});
