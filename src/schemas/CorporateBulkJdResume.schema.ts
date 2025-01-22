
// Import the Joi library
import Joi from "joi";

// import enums
import { CorporateBulkJdResumeProcessingStatusEnum } from "../enums/CorporateBulkJdResume.enum";

// Import schemas
import { commonSchema } from "./Common.schema";

// Define validation schema for Bulk Job Description resumes request api dto
export const corporateBulkJdResumeCreateApiDTOValidation = Joi.object({
  bulkCvs: Joi.array().items(
    Joi.object({
      fileName: Joi
          .string()
          .required()
          .messages({
            "any.required": "The File name field is required.",
            "any.type": "The File name field must be a string.",
            "string.empty": "The File name field should not be empty.",
          }),

      fileMimeType: Joi
          .string()
          .required()
          .messages({
            "any.required": "The File mime type field is required.",
            "any.type": "The File mime type field must be a string.",
            "string.empty": "The File mime type field should not be empty.",
          }),
      })
  ).min(1)
    .required()
    .messages({
    "array.min": "At least one CV file is required.",
    "array.base": "Bulk CVs should be an array of objects.",
    "any.required": "Bulk CVs are required.",
  })
});

// Define validation schema for filtering corporate bulk job description resume requests
export const corporateBulkJdResumeFilterDtoValidation = commonSchema.concat(
  Joi.object({
    status: Joi
      .string()
      .optional() // allow `undefined` value
      .allow(null, "")
      .valid(...Object.values(CorporateBulkJdResumeProcessingStatusEnum))
      .messages({
        "any.only": `Invalid Bulk job description resume status. Please provide a valid value from
      ${Object.values(CorporateBulkJdResumeProcessingStatusEnum).join(", ")}.`,
      }),

    corporateBulkJdId: Joi
      .string()
      .optional()
      .allow("",null)
      .messages({
        "any.type": "The Corporate Bulk Jd Id field must be a string.", 
      }),

    companyId: Joi
      .string()
      .optional()
      .allow("",null)
      .messages({
        "any.type": "The Company Id field must be a string.", 
        "any.required": "The Company Id field is required.",
        "string.empty": "The Company Id field should not be empty.",
      }),
  })
);