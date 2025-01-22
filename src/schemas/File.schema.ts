// Import npm packages
import Joi from "joi";

/**
 * FileGeneratePsuToUploadUserResumeDTOValidation
 *
 * Joi validation schema to validate the request data.
 */
export const FileGeneratePsuToUploadUserResumeDTOValidation = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": "The 'userId' field is required",
  }),
  resumeUserFileName: Joi.string().required().messages({
    "any.required": "The 'resumeUserFileName' field is required",
  }),
  resumeFileMimeType: Joi.string().required().messages({
    "any.required": "The 'resumeFileMimeType' field is required",
  }),
});

/**
 * FileGeneratePsuToUploadUserProfilePicDTOValidation
 *
 * Joi validation schema to validate the request data.
 */
export const FileGeneratePsuToUploadUserProfilePicDTOValidation = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": "The 'userId' field is required",
  }),
  profileUserFileName: Joi.string().required().messages({
    "any.required": "The 'profileUserFileName' field is required",
  }),
  profileFileMimeType: Joi.string().required().messages({
    "any.required": "The 'profileFileMimeType' field is required",
  }),
});

/**
 * FileGeneratePsuToUploadCareerResumeDTOValidation
 *
 * Joi validation schema to validate the request data.
 */
export const FileGeneratePsuToUploadCareerResumeDTOValidation = Joi.object({
  careerCVFileName: Joi.string().required().messages({
    "any.required": "The 'careerCVFileName' field is required",
  }),
  careerCVFileMimeType: Joi.string().required().messages({
    "any.required": "The 'careerCVFileMimeType' field is required",
  }),
});

/**
 * FileGeneratePsuToUploadCompanyJobDescriptionDTOValidation
 *
 * Joi validation schema to validate the request data for uploading a company job description.
 */
export const FileGeneratePsuToUploadCompanyJobDescriptionDTOValidation = Joi.object({
  companyId: Joi
    .string()
    .required()
    .messages({
      "any.required": "The 'Company Id' field is required.",
    }),
  companyJobDescriptionFileName: Joi
    .string()
    .required()
    .messages({
      "any.required": "The 'Job Description File Name' field is required.",
    }),
  companyJobDescriptionFileMimeType: Joi
    .string()
    .required()
    .messages({
      "any.required": "The 'Job Description File Mime Type' field is required.",
    }),
});

/**
 * FileGeneratePsuToViewBulkJdResumeDTOValidation
 */
export const FileGeneratePsuToViewBulkJdResumeDTOValidation = Joi.object({
  corporateBulkJdId: Joi
    .string()
    .required()
    .messages({
      "any.required": "Corporate Bulk Jd Id is required.",
      "string.empty": "Corporate Bulk Jd Id should not be empty.",
      "string.base": "Corporate Bulk Jd Id should be a string.",
    }),
})