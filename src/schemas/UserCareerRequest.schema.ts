// Joi package for validation
import Joi from "joi"; 

// import enums
import { UserCareerRequestStatusEnum } from "../enums/User.enum";

// Define validation schema for user corporate request creation API DTO
export const userCareerRequestCreateApiDtoValidation = Joi.object({
    // Validate userFullName field
    userFullName: Joi.string().required().lowercase().messages({
        "any.required": "User full name is required.",
        "string.empty": "User full name should not be empty.",
    }),

    // Validate userEmail field
    userEmail: Joi.string().email().required().lowercase().messages({
        "any.required": "User email is required.",
        "string.email": "User email must be a valid email address.",
        "string.empty": "User email should not be empty.",
    }),

    // Validate userContactNumber field
    userContactNumber: Joi.string().required().messages({
        "any.required": "User contact number is required.",
        "string.empty": "User contact number should not be empty.",
    }),

    // Validate userMessage field
    userMessage: Joi.string().required().messages({
        "any.required": "User message is required.",
        "string.empty": "User message should not be empty.",
    }),

    // Validate userCvFileName field
    userCvFileName: Joi.string().required().messages({
        "any.required": "User CV file name is required.",
        "string.empty": "User CV file name should not be empty.",
    }),

    // Validate userCvCloudFileName field
    userCvCloudFileName: Joi.string().required().messages({
        "any.required": "User CV cloud file name is required.",
        "string.empty": "User CV cloud file name should not be empty.",
    }),
});

export const userCareerRequestUpdateApiDtoValidation = Joi.object({
    // Validate status field
    status: Joi.string()
        .valid(...Object.values(UserCareerRequestStatusEnum))
        .required()
        .messages({
            "any.required": "Status is required.",
            "any.only": `Invalid status. Please provide a valid value from
             ${Object.values(UserCareerRequestStatusEnum).join(",")}.`,
            "string.empty": "Status should not be empty.",
        }),

    // Validate adminComment field
    adminComment: Joi.string().allow("").optional(),
});
