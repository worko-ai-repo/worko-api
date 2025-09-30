
// Import joi
import Joi from "joi";

// Import luxon
import { DateTime } from "luxon";

// Import enums
import { UserGuidanceRequestTypeEnum, UserJobApplicationAllowedToCandidateUpdateStatusEnum, UserJobApplicationAllowedToMentorUpdateStatusEnum, UserJobApplicationAllowedToWorkoAdminUpdateStatusEnum } from "../enums/UserGuidanceRequest.enum";
import { AdminRoleEnum } from "../enums/Common.enum";
import { UserType } from "../enums/User.enum";

// Import schemas
import { commonSchema, validateOptionalFutureDate } from "./Common.schema";

/**
 * userGuidanceRequestCreateApiDTOValidation
 */
export const userGuidanceRequestCreateApiDTOValidation = Joi.object({
  guidanceRequestType: Joi.string()
    .valid(...Object.values(UserGuidanceRequestTypeEnum)) // Ensure it matches the enum values
    .required()
    .messages({
      "any.required": "The Guidance request type field is required.",
      "string.valid": `The Guidance request type field must be one of: ${Object.values(
        UserGuidanceRequestTypeEnum
      ).join(", ")}.`,
    }),

  guidanceRequestDeadline: Joi.string()
    .isoDate() // Ensures the string is in ISO 8601 date format
    .required()
    .custom((value, helpers) => {
      const inputDate: DateTime<true> | DateTime<false> = DateTime.fromISO(value, { zone: "utc" });
      const today: DateTime<true> = DateTime.utc().startOf("day"); // Get today's date (00:00:00 UTC)

      if (!inputDate.isValid) {
        return helpers.error("string.isoDate");
      }

      if (inputDate < today) {
        return helpers.error("date.min", { min: today.toISO() });
      }

      return value;
    })
    .messages({
      "string.isoDate":
        "Please provide a valid ISO 8601 date (e.g., 2025-01-27T11:26:06.458Z).",
      "any.required": "The Guidance request deadline field is required.",
      "date.min":
        "The guidance request deadline field must be today or a future date.",
    }),

  companyName: Joi.string().trim().uppercase().required().messages({
    "any.required": "The Company name field is required.",
    "string.empty": "The Company name field is required.",
    "any.type": "The Company name field must be a string.",
  }),

  companyId: Joi
    .string()
    .trim()
    .optional()
    .messages({
      "any.type": "The Company ID field must be a string.",
    }),

  jobUrl: Joi.string()
    .uri() // Ensures it is a valid URL
    .required()
    .messages({
      "string.uri": "Please provide a valid job URL.",
      "any.required": "The Job URL field is required.",
      "string.empty": "The Job URL field cannot be empty.",
      "any.type": "The Job URL field must be a string.",
    }),

  guidanceRequestDescription: Joi.string().trim().required().messages({
    "any.required": "The Guidance request description field is required.",
    "string.empty": "The Guidance request description field is required.",
    "any.type": "The Guidance request description field must be a string.",
  }),
});

export const userGuidanceRequestFilterDtoValidation = commonSchema.concat(
  Joi.object({
    actionByUserType: Joi.string()
      .valid(...Object.values(AdminRoleEnum), ...Object.values(UserType))
      .required()
      .messages({
        "any.required": "The Action by User type field is required.",
        "string.valid": `The Action by User type field`,
      }),
    email: Joi.string().optional().email().messages({
      "string.email": "Please provide a valid email address.",
    }),
    companyName: Joi.string().optional().email().messages({
      "any.type": "The Company name field must be a string.",
    }),
    guidanceRequestType: Joi.string()
      .optional()
      .valid(...Object.values(UserGuidanceRequestTypeEnum))
      .messages({
        "any.only": `Invalid guidance request type. Please provide a valid value from
      ${Object.values(UserGuidanceRequestTypeEnum).join(", ")}.`,
      }),

    mentorId: Joi.string().optional().messages({
      "any.type": "The Mentor ID field must be a string.",
    }),
  })
);

export const userGuidanceRequestUpdateByWorkoAdminApiDtoValidation = Joi.object({
  newStatus: Joi.string()
    .valid(
      ...Object.values(UserJobApplicationAllowedToWorkoAdminUpdateStatusEnum)
    )
    .required()
    .messages({
      "any.required": "The new status field is required.",
      "string.valid": `Status must be one of: ${Object.values(
        UserJobApplicationAllowedToWorkoAdminUpdateStatusEnum
      ).join(", ")}`,
    }),

  actionByUserId: Joi.string().required().messages({
    "any.required": "The Action by User ID field is required.",
    "string.empty": "The Action by User ID field cannot be empty.",
    "any.type": "The Action by User ID field must be a string.",
  }),

  actionByUserType: Joi.string()
    .valid(...Object.values(AdminRoleEnum))
    .required()
    .messages({
      "any.required": "The Action by User type field is required.",
      "string.valid": `The Action by User type field must be one of: ${Object.values(
        AdminRoleEnum
      ).join(", ")}.`,
    }),

  rejectionReason: Joi.string().trim().optional().messages({
    "any.type": "The Rejection reason field must be a string.",
  }),

  mentorDetails: Joi.object({
    userId: Joi.string().required().messages({
      "any.required": "The Mentor ID field is required.",
      "string.empty": "The Mentor ID field cannot be empty.",
      "any.type": "The Mentor ID field must be a string.",
    }),
    userEmail: Joi.string().required().messages({
      "any.required": "The Mentor name field is required.",
      "string.empty": "The Mentor name field cannot be empty.",
      "any.type": "The Mentor name field must be a string.",
    }),
    name: Joi.string().required().lowercase().messages({
      "any.required": "The Mentor name field is required.",
      "string.empty": "The Mentor name field cannot be empty.",
      "any.type": "The Mentor name field must be a string.",
    }),
  })
    .optional()
    .messages({
      "any.type": "The Mentor details field must be an object.",
    }),

  scheduleMeetingDetails: Joi.object({
    date: Joi.string().isoDate().required().messages({
      "any.required": "The Meeting date field is required.",
      "string.empty": "The Meeting date field cannot be empty.",
      "any.type": "The Meeting date field must be a string.",
      "string.isoDate":
        "Please provide a valid ISO 8601 date (e.g., 2025-01-27T11:26:06.458Z).",
    }),
    time: Joi.string().required().messages({
      "any.required": "The Meeting time field is required.",
      "string.empty": "The Meeting time field cannot be empty.",
      "any.type": "The Meeting time field must be a string.",
    }),
    duration: Joi.string().required().messages({
      "any.required": "The Meeting duration field is required.",
      "string.empty": "The Meeting duration field cannot be empty.",
      "any.type": "The Meeting duration field must be a string.",
    }),
  })
    .optional()
    .messages({
      "any.type": "The Meeting details field must be an object.",
    }),

  mentorAssignedRemarks: Joi.string().trim().optional().messages({
    "any.type": "The Mentor assigned remarks field must be a string.",
  }),

  currency: Joi.string().optional().uppercase().messages({
    "any.type": "The Currency field must be a string.",
  }),

  totalAmount: Joi.number().optional().messages({
    "any.type": "The Total amount field must be a number.",
  }),

  linkForPayment: Joi.string().optional().messages({
    "any.type": "The Link for payment field must be a string.",
  }),

  uniqueTransactionReference: Joi.string().optional().messages({
    "any.type": "The Unique transaction reference field must be a string.",
  }),

  meetingLink: Joi.string().optional().messages({
    "any.type": "The Meeting link field must be a string.",
  }),
});

export const userGuidanceRequestUpdateByCandidateApiDtoValidation = Joi.object({
  newStatus: Joi.string()
    .valid(
      ...Object.values(UserJobApplicationAllowedToCandidateUpdateStatusEnum)
    )
    .required()
    .messages({
      "any.required": "The new status field is required.",
      "string.valid": `Status must be one of: ${Object.values(
        UserJobApplicationAllowedToCandidateUpdateStatusEnum
      ).join(", ")}`,
    }),

  actionByUserId: Joi.string().required().messages({
    "any.required": "The Action by User ID field is required.",
    "string.empty": "The Action by User ID field cannot be empty.",
    "any.type": "The Action by User ID field must be a string.",
  }),

  actionByUserType: Joi.string()
    .valid(UserType.CAND)
    .required()
    .messages({
      "any.required": "The Action by User type field is required.",
      "string.valid": `The Action by User type field must be one of: ${Object.values(
        UserType.CAND
      ).join(", ")}.`,
    }),

  cancelReason: Joi.string().trim().optional().messages({
    "any.type": "The Cancel reason field must be a string.",
  }),

  reScheduleRequestDate: validateOptionalFutureDate,

  reScheduleRequestTime: Joi.string().optional().messages({
    "any.type": "The Re-schedule request time field must be a string.",
  }),
});

export const userGuidanceRequestUpdateByMentorApiDtoValidation = Joi.object({
  newStatus: Joi.string()
    .valid(
      ...Object.values(UserJobApplicationAllowedToMentorUpdateStatusEnum)
    )
    .required()
    .messages({
      "any.required": "The new status field is required.",
      "string.valid": `Status must be one of: ${Object.values(
        UserJobApplicationAllowedToMentorUpdateStatusEnum
      ).join(", ")}`,
    }),

  actionByUserId: Joi.string().required().messages({
    "any.required": "The Action by User ID field is required.",
    "string.empty": "The Action by User ID field cannot be empty.",
    "any.type": "The Action by User ID field must be a string.",
  }),

  actionByUserType: Joi.string()
    .valid(UserType.EMP)
    .required()
    .messages({
      "any.required": "The Action by User type field is required.",
      "string.valid": `The Action by User type field must be one of: ${Object.values(
        UserType.EMP
      ).join(", ")}.`,
    }),

  reScheduleRequestDate: validateOptionalFutureDate,

  reScheduleRequestTime: Joi.string().optional().messages({
    "any.type": "The Re-schedule request time field must be a string.",
  }),
});