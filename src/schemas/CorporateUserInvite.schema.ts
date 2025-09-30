// import joi
import Joi from "joi"

// import enums
import { CorporateUserInviteAccessTypeEnum, CorpInviteStatusEnum, CorporateUserInviteDbPricingPlanEnum } from "../enums/CorporateUserInvite.enum"

// import schemas
import { commonSchema } from "./Common.schema";

/**
 * CreateAccessRequestApiDtoValidation
 * 
 * This schema is used to validate the request body of the createAccessRequestApiDto.
 * 
 * @enum {CorporateUserInviteAccessTypeEnum} - Enum defining the allowed access types for corporate invites.
 */
export const CorporateUserInviteCreateApiDtoValidation = Joi.object({
    corporateUserType: Joi
        .string()
        .required()
        .valid(...Object.values(CorporateUserInviteAccessTypeEnum))
        .messages({
            'any.required': 'Access Type is required',
            'string.empty': 'Access Type is not allowed to be empty',
            "any.only": `Please provide a valid access type from below i.e. ${Object.values(CorporateUserInviteAccessTypeEnum).join(", ")}.`,
        }),
    companyId: Joi
        .string()
        .required()
        .messages({
            'any.required': 'Company ID is required',
            'string.empty': 'Company ID is not allowed to be empty',
            'string.base': 'Company ID should be a string',
        }),
    email: Joi
        .string()
        .email()
        .required()
        .messages({
            'any.required': 'Email is required',
            'string.empty': 'Email is not allowed to be empty',
            'string.email': 'Please provide a valid email address',
        }),
    firstName: Joi
        .string()
        .required()
        .messages({
            'any.required': 'First name is required',
            'string.empty': 'First name is not allowed to be empty',
            'string.base': 'First name should be a string',
        }),
    lastName: Joi
        .string()
        .required()
        .messages({
            'any.required': 'Last name is required',
            'string.empty': 'Last name is not allowed to be empty',
            'string.base': 'Last name should be a string',
        }),

    phoneNumberDetails: Joi.object({
        countryCode: Joi
            .number()
            .required()
            .messages({
                'any.required': 'Country code is required',
                'number.base': 'Country code should be a number',
            }),
        phoneNumber: Joi
            .number()
            .required()
            .messages({
                'any.required': 'Phone number is required',
                'number.base': 'Phone number should be a number',
            })
    }),

    pricingPlan: Joi
        .string()
        .optional()
        .valid(...Object.values(CorporateUserInviteDbPricingPlanEnum))
        .messages({
            'string.empty': 'Pricing plan is not allowed to be empty',
            'any.only': `Please provide a valid pricing plan from below i.e. ${Object.values(CorporateUserInviteDbPricingPlanEnum).join(", ")}.`,
        }),

    cvDuplicacyAccess: Joi
        .boolean()
        .optional()
        .messages({
            'boolean.base': 'CV duplicacy access should be a boolean',
        })
})

/**
 * CorporateUserInviteUpdateApiDtoValidation
 * 
 * This schema is used to validate the request body of the CorpAccessRequestUpdateApiDto.
 * 
 * @enum {CorpInviteStatusEnum} - Enum defining the allowed status values for corporate invites.
 */
export const CorporateUserInviteUpdateApiDtoValidation = Joi.object({
    inviteStatus: Joi
        .string()
        .optional()
        .valid(CorpInviteStatusEnum.AWAITING)
        .messages({
            'string.empty': 'Invite Status is not allowed to be empty',
            'any.only': `Only ${CorpInviteStatusEnum.AWAITING} status is allowed.`,
        }),

    cvDuplicacyAccess: Joi
        .boolean()
        .optional()
        .messages({
            'boolean.base': 'CV duplicacy access should be a boolean',
        })
})

export const corporateUserInviteSoftDeleteApiDtoValidation = Joi.object({
    reasonForRevokingInvite: Joi.string().required().messages({
        'any.required': 'Reason for revoking invite is required',
        'string.empty': 'Reason for revoking invite is not allowed to be empty',
        'string.base': 'Reason for revoking invite should be a string',
    })
})

/**
 * CorporateInviteListingFilterOptionValidation
 * 
 * Validation schema for filtering Corporate Invites.
 * 
 * Combines common schema with Invite-specific filters.
 * 
 * Utility function to create the validation schema
 * 
 * @enum {CorporateUserInviteAccessTypeEnum} - Enum defining the allowed access types for corporate invites.
 * @enum {CorpInviteStatusEnum} - Enum defining the allowed status values for corporate invites.
 * 
 * @param {string} userType - The type of user making the request.
 * 
 * @see {commonSchema} - Common validation rules shared across DTOs. 
 */
export const CorporateInviteListingFilterOptionValidation = () => {
    return commonSchema.concat(
        Joi.object({
            companyId: Joi
                .string()
                .optional()
                .allow('')
                .messages({
                    "string.empty": "Company ID is not allowed to be empty.",
                }),
            corporateUserType: Joi
                .string()
                .optional()
                .allow('')
                .valid(...Object.values(CorporateUserInviteAccessTypeEnum))
                .messages({
                    "any.only": `Invalid access type. Please provide a valid value from ${Object.values(CorporateUserInviteAccessTypeEnum).join(", ")}.`,
                }),
            email: Joi
                .string()
                .optional()
                .allow('')
                .messages({
                    "string.empty": "Email is not allowed to be empty.",
                }),
            firstName: Joi
                .string()
                .optional()
                .allow('')
                .messages({
                    "string.empty": "Name is not allowed to be empty.",
                }),
            lastName: Joi
                .string()
                .optional()
                .allow('')
                .messages({
                    "string.empty": "Name is not allowed to be empty.",
                }),
            inviteStatus: Joi
                .string()
                .optional()
                .allow('')
                .valid(...Object.values(CorpInviteStatusEnum))
                .messages({
                    "string.empty": "Status is not allowed to be empty.",
                    "any.only ": `Invalid status. Please provide a valid value from ${Object.values(CorpInviteStatusEnum).join(", ")}.`
                }),

            includeCompanyDetails: Joi
                .boolean()
                .optional()
                .messages({
                    'boolean.base': 'Include company details should be a boolean',
                }),
            includeRegisteredCorporateDetails: Joi
                .boolean()
                .optional()
                .messages({
                    'boolean.base': 'Include registered corporate details should be a boolean',
                }),
        })
    );
};