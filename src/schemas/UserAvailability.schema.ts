import Joi from "joi";

export const UserAvailabilityDTOValidation = Joi.object({
  bookingPeriod: Joi.number().positive().required().messages({
    "number.base": "Booking period must be a number",
    "number.positive": "Booking period must be a positive number",
    "any.required": "Booking period is required",
  }),
  noticePeriod: Joi.object({
    value: Joi.number().positive().required().messages({
      "number.base": "Notice period value must be a number",
      "number.positive": "Notice period value must be a positive number",
      "any.required": "Notice period value is required",
    }),
    unit: Joi.string().valid("HOURS").required().messages({
      "string.base": "Notice period unit must be a string",
      "any.only": 'Notice period unit must be either "days" or "hours"',
      "any.required": "Notice period unit is required",
    }),
  }),
  pauseAvailability: Joi.boolean().required().messages({
    "boolean.base": "Pause availability must be a boolean",
    "any.required": "Pause availability is required",
  }),
  availability: Joi.array()
    .items(
      Joi.object({
        dayCode: Joi.number().integer().min(1).max(7).required().messages({
          "number.base": "Day code must be a number",
          "number.integer": "Day code must be an integer",
          "number.min": "Day code must be at least 1",
          "number.max": "Day code must be at most 7",
          "any.required": "Day code is required",
        }),
        dayEnabled: Joi.boolean().required().messages({
          "boolean.base": "Day enabled must be a boolean",
          "any.required": "Day enabled is required",
        }),
        times: Joi.array()
          .items(
            Joi.object({
              startTime: Joi.string().isoDate().required().messages({
                "string.base": "Start time must be a string",
                "string.isoDate": "Invalid ISO date format for start time",
                "any.required": "Start time is required",
              }),
              endTime: Joi.string().isoDate().required().messages({
                "string.base": "End time must be a string",
                "string.isoDate": "Invalid ISO date format for end time",
                "any.required": "End time is required",
              }),
            })
          )
          .required()
          .messages({
            "array.base": "Times must be an array",
            "any.required": "Times are required",
          }),
      })
    )
    .length(7)
    .required()
    .messages({
      "array.base": "Availability must be an array",
      "any.required": "Availability is required",
    }),
}).options({ stripUnknown: true });
