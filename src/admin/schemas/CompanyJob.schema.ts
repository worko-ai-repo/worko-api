// Import enums
import { CompanyJobEmploymentTypeEnum, CompanyJobStatusEnum, CompanyJobWorkModeEnum } from '../../enums/CompanyJob.enum';

// Import Joi
import Joi from 'joi';

// Import common schema
import { arrayFromString, commonSchema } from '../../schemas/Common.schema';

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
    companyId: Joi.string().required().messages({
        "any.required": "Company ID is required.",
        "string.empty": "Company ID should not be empty.",
    }),

    // Validate jobTitle field
    jobTitle: Joi.string().required().messages({
        "any.required": "Job title is required.",
        "string.empty": "Job title should not be empty.",
    }),

    // Validate jobDescription field
    jobDescription: Joi.string().required().messages({
        "any.required": "Job description is required.",
        "string.empty": "Job description should not be empty.",
    }),

    // Validate otherRequirements field
    otherRequirements: Joi.string().optional().messages({
        "string.empty": "Other requirements should not be empty.",
    }),

    // Validate experienceRange field
    experienceRange: Joi.number().integer().min(0).required().messages({
        "any.required": "Experience range is required.",
        "number.base": "Experience range must be a number.",
        "number.min": "Experience range cannot be negative.",
    }),

    // Validate noticePeriod field
    noticePeriod: Joi.number().integer().min(0).required().messages({
        "any.required": "Notice period is required.",
        "number.base": "Notice period must be a number.",
        "number.min": "Notice period cannot be negative.",
    }),

    // Validate numOfOpenings field
    numOfOpenings: Joi.number().integer().min(1).required().messages({
        "any.required": "Number of openings is required.",
        "number.base": "Number of openings must be a number.",
        "number.min": "There must be at least one opening.",
    }),

    // Validate salaryRange field
    salaryRange: Joi.number().min(0).required().messages({
        "any.required": "Salary range is required.",
        "number.base": "Salary range must be a number.",
        "number.min": "Salary range cannot be negative.",
    }),

    // Validate department field
    department: Joi.string().lowercase().required().messages({
        "any.required": "Department is required.",
        "string.empty": "Department should not be empty",
    }),

    location: Joi.string().lowercase().required().messages({
        "any.required": "Location is required.",
        "string.empty": "Location should not be empty",
    }),

    // Validate workMode field
    workMode: Joi.string().required().valid(...Object.values(CompanyJobWorkModeEnum)).messages({
        "any.required": "Work mode is required.",
        "any.only": `Work mode must be one of the allowed values i.e. ${Object.values(CompanyJobWorkModeEnum).join(", ")}.`,
    }),

    // Validate typeofEmployment field
    typeofEmployment: Joi.string().required().valid(...Object.values(CompanyJobEmploymentTypeEnum)).messages({
        "any.required": "Type of employment is required.",
        "any.only": `Type of employment must be one of the allowed values i.e. ${Object.values(CompanyJobEmploymentTypeEnum).join(", ")}`,
    }),

    //Validate coreSkills field
    coreSkills: Joi.array().min(1).required().messages({
        "array.base": "Core skills must be an array.",
        "array.min": "At least one core skill is required.",
        "any.required": "Core skills are required.",
    }),

    //Validate softSkills field
    softSkills: Joi.array().min(1).required().messages({
        "array.base": "Soft skills must be an array.",
        "array.min": "At least one soft skill is required.",
        "any.required": "Soft skills are required.",
    }),

    //Validate technicalSkills field
    technicalSkills: Joi.array().min(1).required().messages({
        "array.base": "Technical skills must be an array.",
        "array.min": "At least one technical skill is required.",
        "any.required": "Technical skills are required.",
    }),

    mislaneiousSkills: Joi.array().min(1).optional().messages({
        "array.base": "Miscellaneous skills must be an array.",
        "array.min": "At least one miscellaneous skill is required.",
    }),

    // Validate status field
    status: Joi.string().required().valid(...Object.values(CompanyJobStatusEnum)).messages({
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
    companyId: Joi.string().required()
        .messages({
            'any.required': 'Company ID is required.',
            'string.uuid': 'Invalid company ID format. It must be a valid UUID.',
        }),

    status: Joi.string().required().valid(...Object.values(CompanyJobStatusEnum)).messages({
        "any.required": "Status is required.",
        "any.only": `Status must be one of the allowed values  i.e. ${Object.values(CompanyJobStatusEnum).join(", ")} `,
    }),

    jobTitle: Joi.string().min(1).optional()
        .messages({
            'string.min': 'Job title must not be empty.',
        }),

    jobDescription: Joi.string().min(1).optional()
        .messages({
            'string.min': 'Job description must not be empty.',
        }),

    otherRequirements: Joi.string().optional().messages({
        "string.empty": "Other requirements should not be empty.",
    }),

    experienceRange: Joi.number().integer().min(0).optional()
        .messages({
            'number.min': 'Experience range must be a positive integer.',
        }),

    noticePeriod: Joi.number().integer().min(0).optional()
        .messages({
            'number.min': 'Notice period must be a positive integer.',
        }),

    numOfOpenings: Joi.number().integer().min(1).optional()
        .messages({
            'number.min': 'Number of openings must be at least 1.',
        }),

    salaryRange: Joi.number().min(0).optional()
        .messages({
            'number.min': 'Salary range must be a positive number.',
        }),

    department: Joi.string().lowercase().optional()
        .messages({
            'string.min': 'Department must not be empty.',
        }),

    location: Joi.string().lowercase().optional()
        .messages({
            'string.min': 'Location must not be empty.',
        }),

    workMode: Joi.string().optional().valid(...Object.values(CompanyJobWorkModeEnum)).messages({
        "any.only": `Work mode must be one of the allowed values i.e. ${Object.values(CompanyJobWorkModeEnum).join(", ")}.`,
    }),

    typeofEmployment: Joi.string().optional().valid(...Object.values(CompanyJobEmploymentTypeEnum)).messages({
        "any.only": `Type of employment must be one of the allowed values i.e. ${Object.values(CompanyJobEmploymentTypeEnum).join(", ")}`,
    }),

    coreSkills: Joi.array().min(1).optional()
        .messages({
            'array.min': 'At least one core skill is required.',
        }),

    softSkills: Joi.array().min(1).optional()
        .messages({
            'array.min': 'At least one soft skill is required.',
        }),

    technicalSkills: Joi.array().min(1).optional()
        .messages({
            'array.min': 'At least one technical skill is required.',
        }),

    mislaneiousSkills: Joi.array().min(1).optional().messages({
        "array.base": "Miscellaneous skills must be an array.",
        "array.min": "At least one miscellaneous skill is required.",
    }),

});

/**
 * Validation schema for filtering jobs.
 * 
 * Combines common schema with job-specific filters.
 * 
 * @type {Joi.ObjectSchema}
 * 
 * @see {commonSchema} - Common validation rules shared across DTOs.
 * @see {CompanyJobStatusEnum} - Enum defining the allowed job status values.
 */
export const jobsFilterDtoValidation = commonSchema.concat(
    Joi.object({
        companyId: arrayFromString,
        location: arrayFromString,
        department: arrayFromString,
        coreSkills: arrayFromString,
        softSkills: arrayFromString,
        workMode: arrayFromString,
        minExperience: Joi.number().integer().min(0).optional().messages({
            'number.min': 'Minimum experience must be a positive integer.',
        }),
        maxExperience: Joi.number().integer().min(0).optional().messages({
            'number.min': 'Maximum experience must be a positive integer.',
        }),
        minSalary: Joi.number().integer().min(0).optional().messages({
            'number.min': 'Minimum experience must be a positive integer.',
        }),
        maxSalary: Joi.number().integer().min(0).optional().messages({
            'number.min': 'Maximum experience must be a positive integer.',
        }),
        status: Joi.string().required().valid(...Object.values(CompanyJobStatusEnum)).messages({
            "any.required": "status is required.",
            "any.only": `Status must be one of the allowed values  i.e. ${Object.values(CompanyJobStatusEnum).join(", ")} `,
        }),
    })
)