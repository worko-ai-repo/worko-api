import Joi from "joi";

const emailFieldValidation = Joi.string()
  .email()
  .required()
  .trim()
  .messages({
    "any.required": "Email is required.",
    "string.email": "Please provide a valid email address.",
    "string.empty": "Email cannot be empty.",
  });

/**
 * Validates the request body for associating or updating a user's iCal URL.
 */
export const saveIcalUrlDtoValidation = Joi.object({
  icalUrl: Joi.string().required().trim().messages({
    "any.required": "icalUrl is required.",
    "string.empty": "icalUrl cannot be empty.",
  }),
  email: Joi.string().email().optional().trim().allow("").messages({
    "string.email": "Please provide a valid email address.",
  }),
}).options({ stripUnknown: true });

/**
 * A single attendee in a batch free-busy query (userId is not accepted).
 */
export const freeBusyAttendeeDtoValidation = Joi.object({
  userEmail: emailFieldValidation,
  userName: Joi.string().optional().allow("").trim().messages({
    "string.base": "userName must be a string.",
  }),
}).options({ stripUnknown: true });

/**
 * Batch free-busy query body: an array of email strings or attendee objects.
 */
export const freeBusyBatchQueryDtoValidation = Joi.array()
  .items(
    Joi.alternatives().try(
      Joi.string().email().required().trim().messages({
        "string.email": "Please provide a valid email address.",
        "string.empty": "Email strings in the payload must not be empty.",
      }),
      freeBusyAttendeeDtoValidation
    )
  )
  .min(1)
  .required()
  .messages({
    "array.base": "Request body must be an array.",
    "array.min": "At least one attendee is required.",
    "any.required": "Request body must be an array.",
  });

/**
 * Query params for fetching a single user's free-busy slots by email.
 */
export const getSingleUserFreeBusyQueryValidation = Joi.object({
  email: emailFieldValidation,
}).options({ stripUnknown: true });
