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
 * FileGeneratePsuToUploadCompanyLogoDTOValidation
 *
 * Joi validation schema to validate the request data.
 */
export const FileGeneratePsuToUploadCompanyLogoDTOValidation = Joi.object({
  companyLogoFileName: Joi.string()
    .pattern(/^[^\/\\]+?\.[a-zA-Z0-9]+$/)
    .required()
    .messages({
      "any.required": "The 'companyLogoFileName' field is required.",
      "string.empty": "The 'companyLogoFileName' field should not be empty.",
      "string.base": "The 'companyLogoFileName' field should be a string.",
      "string.pattern.base":
        "The 'companyLogoFileName' must include a file extension (e.g., 'logo.png').",
    }),

  companyLogoFileMimeType: Joi.string().required().messages({
    "any.required": "The 'companyLogoFileMimeType' field is required.",
    "string.empty": "The 'companyLogoFileMimeType' field should not be empty.",
    "string.base": "The 'companyLogoFileMimeType' field should be a string.",
  }),
});

/**
 * FileGeneratePsuToUploadBlogCoverImageDTOValidation
 *
 * Joi validation schema to validate the request data.
 */
export const FileGeneratePsuToUploadBlogCoverImageDTOValidation = Joi.object({
  blogCoverImageFileName: Joi.string()
    .pattern(/^[^\/\\]+?\.[a-zA-Z0-9]+$/)
    .required()
    .messages({
      "any.required": "The 'blogCoverImageFileName' field is required.",
      "string.empty": "The 'blogCoverImageFileName' field should not be empty.",
      "string.base": "The 'blogCoverImageFileName' field should be a string.",
      "string.pattern.base":
        "The 'blogCoverImageFileName' must include a file extension (e.g., 'logo.png').",
    }),

  blogCoverImageFileMimeType: Joi.string().required().messages({
    "any.required": "The 'blogCoverImageFileMimeType' field is required.",
    "string.empty": "The 'blogCoverImageFileMimeType' field should not be empty.",
    "string.base": "The 'blogCoverImageFileMimeType' field should be a string.",
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
  companyId: Joi.string().required().messages({
    "any.required": "The 'Company Id' field is required.",
  }),
  companyJobDescriptionFileName: Joi.string().required().messages({
    "any.required": "The 'Job Description File Name' field is required.",
  }),
  companyJobDescriptionFileMimeType: Joi.string().required().messages({
    "any.required": "The 'Job Description File Mime Type' field is required.",
  }),
});

/**
 * FileGeneratePsuToViewBulkJdResumeDTOValidation
 */
export const FileGeneratePsuToViewBulkJdResumeDTOValidation = Joi.object({
  corporateBulkJdId: Joi.string().required().messages({
    "any.required": "Corporate Bulk Jd Id is required.",
    "string.empty": "Corporate Bulk Jd Id should not be empty.",
    "string.base": "Corporate Bulk Jd Id should be a string.",
  }),
});

/**
 * FileGeneratePsuToUploadInterviewRecordingDTOValidation
 *
 * Joi validation schema to validate the request data for uploading interview recording chunks.
 */
export const FileGeneratePsuToUploadInterviewRecordingDTOValidation = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": "The 'userId' field is required",
  }),
  interviewId: Joi.string().required().messages({
    "any.required": "The 'interviewId' field is required.",
    "string.empty": "The 'interviewId' field should not be empty.",
    "string.base": "The 'interviewId' field should be a string.",
  }),
  chunkFileName: Joi.string()
    .pattern(/^[^\/\\]+?\.[a-zA-Z0-9]+$/)
    .required()
    .messages({
      "any.required": "The 'chunkFileName' field is required.",
      "string.empty": "The 'chunkFileName' field should not be empty.",
      "string.base": "The 'chunkFileName' field should be a string.",
      "string.pattern.base":
        "The 'chunkFileName' must include a file extension (e.g., 'chunk_1.webm').",
    }),
  chunkFileMimeType: Joi.string().required().messages({
    "any.required": "The 'chunkFileMimeType' field is required.",
    "string.empty": "The 'chunkFileMimeType' field should not be empty.",
    "string.base": "The 'chunkFileMimeType' field should be a string.",
  }),
  chunkSequence: Joi.number().integer().min(1).optional().messages({
    "number.base": "The 'chunkSequence' field should be a number.",
    "number.integer": "The 'chunkSequence' field should be an integer.",
    "number.min": "The 'chunkSequence' field should be at least 1.",
  }),
});

/**
 * FileGeneratePsuToViewInterviewRecordingDTOValidation
 *
 * Joi validation schema to validate the request data for viewing interview recording chunks.
 */
export const FileGeneratePsuToViewInterviewRecordingDTOValidation = Joi.object({
  interviewId: Joi.string().required().messages({
    "any.required": "The 'interviewId' field is required.",
    "string.empty": "The 'interviewId' field should not be empty.",
    "string.base": "The 'interviewId' field should be a string.",
  }),
});

export const filePsuToUploadDtoValidation = Joi.object({
  fileName: Joi.string().required().messages({
    "any.required": "File name is required",
    "string.empty": "File name should not be empty",
    "string.base": "File name must be a string",
  }),

  fileMimeType: Joi.string().required().messages({
    "any.required": "File mime type is required",
    "string.empty": "File mime type should not be empty",
    "string.base": "File mime type must be a string",
  }),
});

export const bulkCvsPsuToUploadApiDtoValidation = filePsuToUploadDtoValidation.concat(
  Joi.object({
    companyId: Joi.string().required().messages({
      "string.empty": "Company id is required",
      "any.required": "Company id is required",
    }),
    corporateBulkJdId: Joi.string().required().messages({
      "string.empty": "Corporate bulk jd id is required",
      "any.required": "Corporate bulk jd id is required",
    }),
  })
)
