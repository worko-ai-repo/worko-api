// Import necessary packages
import Joi from "joi"; // Joi package for validation

// Import enums
import { UserType } from "../enums/User.enum";
import { UserReviewEmpContext, UserReviewCandContext } from "../enums/User.enum";
import { MasterServiceCode } from "../enums/MasterService.enum";

// Let define the userReview Context 
let userReviewContexts = [...Object.values(UserReviewEmpContext), ...Object.values(UserReviewCandContext)];

// Define validation schema for user review creation API DTO
export const userReviewCreateApiDtoValidation = Joi.object({
    // Validate ratingForUserType field
    ratingForUserType: Joi
        .string()
        .valid(UserType.CAND, UserType.EMP)
        .optional()
        .messages({
            "any.only": "Invalid user type.",
        }),

    // Validate rating field
    rating: Joi
        .number()
        .min(0)
        .max(5)
        .required() 
        .messages({
            "any.required": "Rating value is required.",
            "number.min": "Rating value should be at least 0.",
            "number.max": "Rating value should be at most 5.",
        }),

    // Validate reviewText field
    reviewText: Joi
        .string()
        .allow('')
        .default('')
        .optional(),

    // Validate reviewContext field for update
    reviewContext: Joi
        .string()
        .valid(...userReviewContexts)
        .required()
        .messages({
            "any.required": "Review context is required.",
            "string.empty": "Review context should not be empty.",
            "any.only": `Invalid review context. Please provide a valid value from ${userReviewContexts.join(", ")}.`,
        }),

    // Conditional validation for referalId field based on reviewContext
    referalId: Joi
        .string()
        .when('reviewContext', {
            is: UserReviewEmpContext.EMP_REFERRAL,
            then: Joi
                .string()
                .required()
                .messages({
                    "any.required": "Referral ID is required for referral context.",
                    "string.empty": "Referral ID should not be empty.",
                }),
            otherwise: Joi
                .string()
                .allow('')
                .optional(),
        }),

    // Conditional validation for masterServiceCode field based on reviewContext
    masterServiceCode: Joi
        .string()
        .when('reviewContext', {
            is: [UserReviewEmpContext.EMP_PROVIDED_SERVICE],
            then: Joi
                .string()
                .required()
                .valid(...Object.values(MasterServiceCode))
                .messages({
                "any.only": `Invalid master service code. Please provide a valid value from ${Object.values(MasterServiceCode)}.`,
                "any.required": "Master service code is required for EMP_PROVIDED_SERVICE context.",
                }),
            otherwise: Joi
                .string()
                .allow('')
                .optional(),
        }),

    // Validate serviceReqId field
    serviceReqId: Joi
        .string()
        .allow('')
        .optional()
});
