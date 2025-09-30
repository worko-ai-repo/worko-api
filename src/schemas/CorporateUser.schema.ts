// import joi
import Joi from "joi";

// Import Enums
import { CorporateUserTypeEnum } from "../enums/CorporateUser.enum";

// import schemas
import { commonSchema } from "./Common.schema";

/**
 * CorporateUserCreateApiDtoValidation
 * 
 * This is a Joi Schema that is used to validate the Request Body of the Corporate User Create API
 */
export const CorporateUserCreateApiDtoValidation = Joi.object({
    companyId: Joi
        .string()
        .required()
        .messages({
            "string.base": " 'companyId' should be a string",
            "string.empty": " 'companyId' should not be empty",
            "any.required": " 'companyId' is required"
        }),

    email: Joi
        .string()
        .email()
        .required()
        .messages({
            "string.base": "Email should be a string",
            "string.empty": "Email should not be empty",
            "string.email": "Email should be a valid email",
            "any.required": "Email is required"
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
    corporateUserType: Joi
        .string()
        .valid(...Object.values(CorporateUserTypeEnum))
        .required()
        .messages({
            "string.base": " 'corporateUserType' should be a string",
            "string.empty": " 'corporateUserType' should not be empty , Please choose a valid role from below i.e. " + Object.values(CorporateUserTypeEnum).join(", "),
        }),
    inviteId: Joi
        .string()
        .required()
        .messages({
            "string.base": "Invite Id should be a string",
            "string.empty": "Invite Id should not be empty",
            "any.required": "Invite Id is required"
        }),
    cognitoUserId: Joi
        .string()
        .required()
        .messages({
            "string.base": " 'cognitoUserId' should be a string",
            "string.empty": " 'cognitoUserId' should not be empty",
            "any.required": " 'cognitoUserId' is required"
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
    })
})

/**
 * CorporateUserUpdateApiDtoValidation
 * 
 * This is a Joi Schema that is used to validate the Request Body of the Corporate User Update API
 */
export const CorporateUserUpdateApiDtoValidation = Joi.object({
    firstName: Joi
        .string()
        .required()
        .messages({
            'any.required': 'First name is required',
            'string.empty': 'First name is not allowed to be empty',
        }),
    lastName: Joi
        .string()
        .required()
        .messages({
            'any.required': 'Last name is required',
            'string.empty': 'Last name is not allowed to be empty',
        }),
})

/**
 * CorporateUserListingFilterOptionValidation
 * 
 * This is a Joi Schema that is used to validate the Request Query Params of the Corporate User Listing API
 * 
 * @see {CorporateUserTypeEnum}  - The type of access the user is requesting. 
 */

export const CorporateUserListingFilterOptionValidation = commonSchema.concat(Joi.object({
    cognitoUserId:Joi
    .string()
    .optional()
    .messages({
        "string.base": "Cognito Id should be a string",
        "string.empty": "Cognito Id should not be empty",
    }),

    id: Joi
        .string()
        .optional()
        .messages({
            "string.base": "Id should be a string",
            "string.empty": "Id should not be empty",
        }),
    companyId: Joi
        .string()
        .optional()
        .messages({
            "string.base": "Company should be a string",
            "string.empty": "Company should not be empty",
        }),
    email: Joi
        .string()
        .optional()
        .messages({
            "string.base": "Email should be a string",
            "string.empty": "Email should not be empty",
        }),
    corporateUserType: Joi
        .string()
        .valid(...Object.values(CorporateUserTypeEnum))
        .optional()
        .messages({
            "string.base": "Role should be a string",
            "string.empty": "User Role should not be empty , Please choose a valid role from below i.e. " + Object.values(CorporateUserTypeEnum).join(", "),
        }),
    firsName: Joi
        .string()
        .optional()
        .messages({
            "string.base": "First Name should be a string",
            "string.empty": "First Name should not be empty",
        }),
    lastName: Joi
        .string()
        .optional()
        .messages({
            "string.base": "Last Name should be a string",
            "string.empty": "Last Name should not be empty",
        }),
})
)


/**
 * validateEmailField
 * 
 * Schema to validate companyId in requestBody Middleware for CorporateUser
 * 
 * @param {string} companyId - The companyId to validate.
 **/ 
export const validateCompanyIdFields = (companyId: string) => {
    const companyIdSchema = Joi
        .string()
        .required()
        .messages({
            "any.required": "Company Id is required.",
            "string.base": "Company Id should be a string.",
            "string.empty": "Company Id cannot be empty.",
        });
    
    return companyIdSchema.validate(companyId);
};