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
