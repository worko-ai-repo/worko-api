// Import npm packages
import Joi from "joi";

/**
 * FileGeneratePsuToUploadUserResumeDTOValidation
 * 
 * Join validation schema to validate the request data.
 */
export const FileGeneratePsuToUploadUserResumeDTOValidation = Joi.object({
  userId: Joi
    .string()
    .required()
    .messages({
      "any.required": "The 'userId' field is required",
    }),
  resumeUserFileName: Joi
    .string()
    .required()
    .messages({
      "any.required": "The 'resumeUserFileName' field is required",
    }),
  resumeFileMimeType: Joi
    .string()
    .required()
    .messages({
      "any.required": "The 'resumeFileMimeType' field is required",
    }),
});