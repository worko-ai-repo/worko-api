// Import necessary packages
import Joi from "joi"; // Joi package for validation

// Import enums
import { UserType, UserSupportContextTypeEnum, UserSupportStatusEnum } from "../enums/User.enum";

// Define validation schema for user support creation API DTO
export const userSupportCreateApiDtoValidation = Joi.object({

    // Validate userId field
    userId: Joi.string().required().messages({
        "any.required": "User ID is required.",
        "string.empty": "User ID should not be empty.",
    }),

    // Validate userEmail field
    userEmail: Joi.string().email().required().messages({
        "any.required": "User email is required.",
        "string.email": "User email must be a valid email address.",
        "string.empty": "User email should not be empty.",
    }),

    // Validate userFirstName field
    userFirstName: Joi.string().required().messages({
        "any.required": "User first name is required.",
        "string.empty": "User first name should not be empty.",
    }),

    // Validate userLastName field
    userLastName: Joi.string().optional(),

    // Validate userRole field
    userRole: Joi.string().valid(...Object.values(UserType)).required().messages({
        "any.required": "User role is required.",
        "any.only": `Invalid user role. Please provide a valid value from 
        ${Object.values(UserType).join(", ")}.`,
    }),

    // Validate userSupportType field
    userSupportType: Joi.string().required().messages({
        "any.required": "Support type is required.",
        "string.empty": "Support type should not be empty.",
    }),

    // Validate userMessage field
    userMessage: Joi.string().required().messages({
        "any.required": "Support message is required.",
        "string.empty": "Support message should not be empty.",
    }),

    // Validate contextType field
    contextType: Joi.string().valid(...Object.values(UserSupportContextTypeEnum))
        .required().messages({
            "any.required": "Context type is required.",
            "any.only": `Invalid context type. Please provide a valid value from
         ${Object.values(UserSupportContextTypeEnum).join(", ")}.`,
        }),

    // Validate contextId field
    contextId: Joi.string().required().messages({
        "any.required": "Context ID is required.",
        "string.empty": "Context ID should not be empty.",
    }),

    // Validate createdByUserId field
    createdByUserId: Joi.string().required().messages({
        "any.required": "Created by user ID is required.",
        "string.empty": "Created by user ID should not be empty.",
    }),
});

// Define validation schema for user support update API DTO
export const userSupportUpdateApiDtoValidation = Joi.object({
    // Validate actionByUserId field
    actionByUserId: Joi.string().required().messages({
        "any.required": "Action by user ID is required.",
        "string.empty": "Action by user ID should not be empty.",
    }),

    // Validate assignedToUserId field (optional)
    assignedToUserId: Joi.string().allow('').optional(),

    // Validate status field
    status: Joi.string().valid(...Object.values(UserSupportStatusEnum))
        .required().messages({
            "any.required": "Status is required.",
            "any.only": `Invalid status. Please provide a valid value from
         ${Object.values(UserSupportStatusEnum).join(", ")}.`,
        }),

    // Validate adminComment field (optional)
    adminComment: Joi.string().allow('').optional(),
});
