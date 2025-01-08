// Import Joi
import Joi from 'joi';

// Import enums
import { 
    CompanyJobEmploymentTypeEnum,
    CompanyJobStatusEnum,
    CompanyJobWorkModeEnum,
    UserCompanyJobListingStatusEnum
} from '../../enums/CompanyJob.enum';
import { InternalUserRoleEnum } from '../../enums/Common.enum';

// Import common schema
import { anyTypeToArray, commonSchema } from '../../schemas/Common.schema';

/**
 * CompanyJobCreateApiDtoValidation
 * 
 * Validation schema for creating a company job.
 * 
 * @property {string} companyId - The ID of the company. Required.
 * 
 * @see {CompanyJobEmploymentTypeEnum} employmentType - The employment type.
 * @see {CompanyJobStatusEnum} status - The status of the job.
 * @see {CompanyJobWorkModeEnum} workMode - The work mode.
 */
export const companyJobCreateApiDtoValidation = Joi.object({
    // Validate companyID field
    companyId: Joi
        .string()
        .required()
        .messages({
            "any.required": "Company ID is required.",
            "string.empty": "Company ID should not be empty.",
        }),

    // Validate jobTitle field
    jobTitle: Joi
        .string()
        .lowercase()
        .min(1)
        .required()
        .messages({
            "any.required": "Job title is required.",
            "string.min": "Job title must be at least 1 character long.",
        }),

    // Validate jobDescription field
    jobDescription: Joi
        .string()
        .min(1)
        .required()
        .messages({
            "any.required": "Job description is required.",
            "string.min": "Job description must be at least 1 character long.",
        }),

    // Validate otherRequirements field
    otherRequirements: Joi
        .string()
        .allow('')
        .optional(),

    // Validate experienceRange field
    experienceRange: Joi.object({
        min: Joi.number()
            .integer()
            .min(0)
            .required()
            .messages({
                'number.base': 'Minimum experience must be a number.',
                'number.min': 'Minimum experience must be a positive integer.'
            }),
        max: Joi.number()
            .integer()
            .min(Joi.ref('min')) // Ensure max is greater than or equal to min
            .required()
            .messages({
                'number.base': 'Maximum experience must be a number.',
                'number.min': 'Maximum experience cannot be less than minimum experience.'
            })
    }).required().messages({
        "any.required": "Experience range is required."
    }),


    // Validate noticePeriod field
    noticePeriod: Joi
        .number()
        .integer()
        .min(0)
        .required()
        .messages({
            "any.required": "Notice period is required.",
            "number.base": "Notice period must be a number.",
            "number.min": "Notice period cannot be negative.",
        }),

    // Validate numOfOpenings field
    numOfOpenings: Joi
        .number()
        .integer()
        .min(1)
        .required()
        .messages({
            "any.required": "Number of openings is required.",
            "number.base": "Number of openings must be a number.",
            "number.min": "There must be at least one opening.",
        }),

    // Validate salaryRange field
    salaryRange: Joi.object({
        min: Joi.number()
            .min(0)
            .required()
            .messages({
                "any.required": "Minimum salary is required.",
                "number.base": "Minimum salary must be a number.",
                "number.min": "Minimum salary cannot be negative.",
            }),
        max: Joi.number()
            .min(Joi.ref('min')) // Ensure max is greater than or equal to min
            .required()
            .messages({
                "any.required": "Maximum salary is required.",
                "number.base": "Maximum salary must be a number.",
                "number.min": "Maximum salary cannot be less than minimum salary.",
            })
    }).required().messages({
        "any.required": "Salary range is required.",
    }),

    // Validate department field
    department: Joi
        .string()
        .lowercase()
        .min(1)
        .required()
        .messages({
            "any.required": "Department is required.",
            "string.min": "Department should be at least 1 character long."
        }),

    location: Joi
        .string()
        .lowercase()
        .required()
        .messages({
            "any.required": "Location is required.",
            "string.empty": "Location should not be empty",
        }),

    // Validate workMode field
    workMode: Joi
        .string()
        .required()
        .valid(...Object.values(CompanyJobWorkModeEnum))
        .messages({
            "any.required": "Work mode is required.",
            "any.only": `Work mode must be one of the allowed values i.e. ${Object.values(CompanyJobWorkModeEnum).join(", ")}.`,
        }),

    // Validate typeofEmployment field
    typeofEmployment: Joi
        .string()
        .required()
        .valid(...Object.values(CompanyJobEmploymentTypeEnum))
        .messages({
            "any.required": "Type of employment is required.",
            "any.only": `Type of employment must be one of the allowed values i.e. ${Object.values(CompanyJobEmploymentTypeEnum).join(", ")}`,
        }),

    //Validate coreSkills field
    coreSkills: Joi
        .array()
        .min(1)
        .items(Joi.string().lowercase())
        .required()
        .messages({
            "array.base": "Core skills must be an array.",
            "array.min": "At least one core skill is required.",
            "any.required": "Core skills are required.",
        }),

    //Validate softSkills field
    softSkills: Joi
        .array()
        .min(1)
        .items(Joi.string().lowercase())
        .required()
        .messages({
            "array.base": "Soft skills must be an array.",
            "array.min": "At least one soft skill is required.",
            "any.required": "Soft skills are required.",
        }),

    //Validate technicalSkills field
    technicalSkills: Joi
        .array()
        .min(1)
        .items(Joi.string().lowercase())
        .required()
        .messages({
            "array.base": "Technical skills must be an array.",
            "array.min": "At least one technical skill is required.",
            "any.required": "Technical skills are required.",
        }),

    mislaneiousSkills: Joi
        .array()
        .allow('')
        .items(Joi.string().lowercase())
        .optional()
        .messages({
            "array.base": "Miscellaneous skills must be an array.",
        }),

    // Validate status field
    status: Joi
        .string()
        .required()
        .valid(...Object.values(CompanyJobStatusEnum))
        .messages({
            "any.required": "Status is required.",
            "any.only": `Status must be one of the allowed values  i.e. ${Object.values(CompanyJobStatusEnum).join(", ")} `,
        }),
});


/**
 * updateCompanyJobApiDtoValidation
 * 
 * Validation schema for updating a company job.
 * 
 * @see {CompanyJobEmploymentTypeEnum} employmentType - The employment type.
 * @see {CompanyJobStatusEnum} status - The status of the job.
 * @see {CompanyJobWorkModeEnum} workMode - The work mode.
 */
export const updateCompanyJobApiDtoValidation = Joi.object({
    companyId: Joi
        .string()
        .required()
        .messages({
            'any.required': 'Company ID is required.',
            'string.uuid': 'Invalid company ID format. It must be a valid UUID.',
        }),

    status: Joi
        .string()
        .required()
        .valid(...Object.values(CompanyJobStatusEnum))
        .messages({
            "any.required": "Status is required.",
            "any.only": `Status must be one of the allowed values  i.e. ${Object.values(CompanyJobStatusEnum).join(", ")} `,
        }),

    jobTitle: Joi
        .string()
        .min(1)
        .lowercase()
        .optional()
        .messages({
            'string.min': 'Job title must not be empty.',
        }),

    jobDescription: Joi
        .string()
        .min(1)
        .optional()
        .messages({
            'string.min': 'Job description must not be empty.',
        }),

    otherRequirements: Joi
        .string()
        .allow('')
        .optional(),

    // Validate experienceRange field
    experienceRange: Joi.object({
        min: Joi.number()
            .integer()
            .min(0)
            .optional()
            .messages({
                'number.base': 'Minimum experience must be a number.',
                'number.min': 'Minimum experience must be a positive integer.'
            }),
        max: Joi.number()
            .integer()
            .min(Joi.ref('min')) // Ensure max is greater than or equal to min
            .optional()
            .messages({
                'number.base': 'Maximum experience must be a number.',
                'number.min': 'Maximum experience cannot be less than minimum experience.'
            })
    }).optional(),


    noticePeriod: Joi
        .number()
        .integer()
        .min(0)
        .optional()
        .messages({
            'number.base': 'Notice period must be a number.',
            'number.min': 'Notice period must be a positive integer.',
        }),

    numOfOpenings: Joi
        .number()
        .integer()
        .min(1)
        .optional()
        .messages({
            'number.base': 'Number of openings must be a number.',
            'number.min': 'Number of openings must be a positive integer.',
        }),

    // Validate salaryRange field
    salaryRange: Joi.object({
        min: Joi.number()
            .min(0)
            .optional()
            .messages({
                "number.base": "Minimum salary must be a number.",
                "number.min": "Minimum salary cannot be negative.",
            }),
        max: Joi.number()
            .min(Joi.ref('min')) // Ensure max is greater than or equal to min
            .optional()
            .messages({
                "number.base": "Maximum salary must be a number.",
                "number.min": "Maximum salary cannot be less than minimum salary.",
            })
    }).optional(),

    department: Joi
        .string()
        .min(1)
        .lowercase()
        .optional()
        .messages({
            'string.min': 'Department must not be empty.',
        }),

    location: Joi
        .string()
        .lowercase()
        .optional()
        .messages({
            'string.empty': 'Location must not be empty.',
        }),

    workMode: Joi
        .string()
        .optional()
        .valid(...Object.values(CompanyJobWorkModeEnum))
        .messages({
            "any.only": `Work mode must be one of the allowed values i.e. ${Object.values(CompanyJobWorkModeEnum).join(", ")}.`,
        }),

    typeofEmployment: Joi
        .string()
        .optional()
        .valid(...Object.values(CompanyJobEmploymentTypeEnum))
        .messages({
            "any.only": `Type of employment must be one of the allowed values i.e. ${Object.values(CompanyJobEmploymentTypeEnum).join(", ")}`,
        }),

    coreSkills: Joi
        .array()
        .min(1)
        .items(Joi.string().lowercase())
        .optional()
        .messages({
            'array.min': 'At least one core skill is required.',
        }),

    softSkills: Joi
        .array()
        .min(1)
        .items(Joi.string().lowercase())
        .optional()
        .messages({
            'array.min': 'At least one soft skill is required.',
        }),

    technicalSkills: Joi
        .array()
        .min(1)
        .items(Joi.string().lowercase())
        .optional()
        .messages({
            'array.min': 'At least one technical skill is required.',
        }),

    mislaneiousSkills: Joi
        .array()
        .allow('')
        .items(Joi.string().lowercase())
        .optional()
        .messages({
            "array.base": "Miscellaneous skills must be an array.",
        }),

});

/**
 * CompanyJobFilterDtoValidation
 * 
 * Validation schema for filtering jobs.
 * 
 * Combines common schema with job-specific filters.
 * 
 * Utility function to create the validation schema
 * 
 * @param {string} userType - The type of user making the request.
 * 
 * @see {commonSchema} - Common validation rules shared across DTOs.
 * @see {CompanyJobStatusEnum} - Enum defining the allowed job status values.
 * @see {UserCompanyJobListingStatusEnum} - Enum defining the allowed job status values for users.
 */
export const CompanyJobFilterDtoValidation = (userType: string) => {
    // Status validation rules based on the provided user type
    const statusValidation = (userType === InternalUserRoleEnum.ADMIN)
        ? Joi
            .string()
            .optional()
            .valid(...Object.values(CompanyJobStatusEnum))
            .messages({
                "any.only": `Status must be one of the allowed values i.e. ${Object.values(CompanyJobStatusEnum).join(", ")}.`,
            })
        : Joi
            .string()
            .required()
            .valid(...Object.values(UserCompanyJobListingStatusEnum)) // Assuming this is the enum for users
            .messages({
                "any.required": "Status is required for users.",
                "any.only": `Status must be one of the allowed values i.e. ${Object.values(UserCompanyJobListingStatusEnum).join(", ")}.`,
            }); 

    return commonSchema.concat(
        Joi.object({
            companyId: anyTypeToArray,
            location: anyTypeToArray,
            department: anyTypeToArray,
            coreSkills: anyTypeToArray,
            softSkills: anyTypeToArray,
            technicalSkills: anyTypeToArray,
            workMode: anyTypeToArray,
            minExperience: Joi
                .number()
                .integer()
                .min(0)
                .optional()
                .messages({
                    'number.min': 'Minimum experience must be a positive integer.',
                }),
            maxExperience: Joi
                .number()
                .integer()
                .min(0)
                .optional()
                .messages({
                    'number.min': 'Maximum experience must be a positive integer.',
                }),
            minSalary: Joi
                .number()
                .integer()
                .min(0)
                .optional()
                .messages({
                    'number.min': 'Minimum salary must be a positive integer.',
                }),
            maxSalary: Joi
                .number()
                .integer()
                .min(0)
                .optional()
                .messages({
                    'number.min': 'Maximum salary must be a positive integer.',
                }),
            status: statusValidation, // Use the dynamically created validation here
        })
    );
};

/**
 * parsedJobDescriptionApiDtoValidation
 * 
 * validation schema for parsing job description
 */
export const parsedJobDescriptionApiDtoValidation = Joi.object({
    jobDescription: Joi
        .string()
        .required()
        .messages({
            "any.required": `"jobDescription" is required.`,
            "string.base": `"jobDescription" must be a string.`,
            "string.empty": `"jobDescription" cannot be empty.`,
        }),
});