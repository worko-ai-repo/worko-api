// Import the Joi library
import Joi from "joi";

// import enums
import { JobApplicationStatus } from "../enums/UserJobApplication.enum";
import { CorporateUserTypeEnum } from "../enums/CorporateUser.enum";
import { UserType } from "../enums/User.enum";
import { AdminRoleEnum } from "../enums/Common.enum";

// import schemas
import { commonSchema } from "./Common.schema";

// Define validation schema for creating job application dto
export const UserCreateJobApplicationDTOValidation = Joi.object({
  companyId: Joi
   .string()
   .required()
   .messages({
    "any.required": "companyId is required",
    "any.type": "companyId must be a string",
    "string.empty": "companyId should not be empty",
   }),

  companyName: Joi
   .string()
   .required()
   .messages({
    "any.required": "companyName is required",
    "any.type": "companyName must be a string",
    "string.empty": "companyName should not be empty",
   }),

  jobUrl: Joi
   .string()
   .required()
   .messages({
    "any.required": "jobUrl is required",
    "any.type": "jobUrl must be a string",
    "string.empty": "jobUrl should not be empty",
   }),

   jobTitle: Joi
   .string()
   .required()
   .messages({
    "any.required": "jobTitile is required",
    "any.type": "jobTitile must be a string",
    "string.empty": "jobTitile should not be empty",
   }),

  jdExtracted: Joi
   .string()
   .required()
   .messages({
    "any.required": "jdExtracted is required",
    "any.type": "jdExtracted must be a string",
    "string.empty": "jdExtracted should not be empty",
   }),

  jobId: Joi
   .string()
   .required()
   .messages({
    "any.required": "jobId is required",
    "any.type": "jobId must be a string",
    "string.empty": "jobId should not be empty",
   }),

  jobPortal: Joi
   .string()
   .allow("")
   .optional()
   .messages({
    "any.type": "jobPoratal must be a string",
   }),
});

// Define validation schema for filtering job application requests
export const userJobApplicationFilterDtoValidation = commonSchema.concat(
  Joi.object({
    status: Joi.string()
      .optional() // allow `undefined` value
      .allow(null, "")
      .valid(...Object.values(JobApplicationStatus))
      .messages({
        "any.only": `Invalid Job application status. Please provide a valid value from
      ${Object.values(JobApplicationStatus).join(", ")}.`,
      }),

    jobId: Joi.string().optional().allow("", null).messages({
      "any.type": "jobId must be a string",
    }),

    companyId: Joi.string().optional().allow("", null).messages({
      "any.type": "companyId must be a string",
    }),

    userEmail: Joi.string().email().optional().allow("", null).messages({
      "string.email": "User email must be a valid email address.",
      "string.empty": "User email should not be empty.",
    }),

    userType: Joi.string()
      .required()
      .valid(
        ...Object.values(CorporateUserTypeEnum),
        ...Object.values(UserType),
        ...Object.values(AdminRoleEnum)
      )
      .messages({
        "any.only": `Invalid user type. Please provide a valid value from
      ${Object.values(CorporateUserTypeEnum).join(", ")}
      ${Object.values(UserType).join(", ")}
      ${Object.values(AdminRoleEnum).join(", ")}.`,
        "any.required": "User type is required",
        "string.empty": "User type should not be empty",
      }),
  })
); 

// Define validation schema for updating job application
export const userJobApplicationUpdateValidation = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": "User ID is required",
  }),

  status: Joi.string()
    .valid(...Object.values(JobApplicationStatus))
    .required()
    .messages({
      "string.valid": `Status must be one of: ${Object.values(
        JobApplicationStatus
      ).join(", ")}`,
      "any.required": "Status is required",
      "string.empty": "Status should not be empty",
    }),

  emailId: Joi.string().email().required().messages({
    "any.required": "Email is required.",
    "string.email": "Please provide a valid email address.",
    "string.empty": "Email cannot be empty.",
  }),

  // Additional fields for the Reject status
  reason: Joi.when("status", {
    is: JobApplicationStatus.REJECTED,
    then: Joi.string().required().messages({
      "any.required": "Reason is required for rejection",
    }),
    otherwise: Joi.optional().allow(""),
  }),

  userComment: Joi.string().allow("").optional(),

  userType: Joi.string()
    .required()
    .valid(...Object.values(CorporateUserTypeEnum), ...Object.values(AdminRoleEnum))
    .messages({
      "string.valid": `User type must be one of: ${Object.values(
        CorporateUserTypeEnum
      ).join(", ")}, ${Object.values(AdminRoleEnum).join(", ")}.`,
      "any.required": "User type is required",
      "string.empty": "User type should not be empty",
    }),
});

// Define validation schema for requesting job application
export const userJobApplicationRequestFeedbackValidation = Joi.object({
  applicationDate: Joi.string().isoDate().required().messages({
    "any.required": "Application date is required",
    "string.empty": "Application date should not be empty",
    "string.isoDate": "Application date must be a valid date in ISO format",
  }),
});