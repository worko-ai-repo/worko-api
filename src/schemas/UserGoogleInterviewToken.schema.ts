// Import npm packages
import Joi from "joi";

export const userGoogleInterviewTokenDetailsApiDtoValidation = Joi.object({
  code: Joi.string().required().messages({
    "any.required": "Google GIS authorization code is required.",
    "string.empty": "Google GIS authorization code should not be empty.",
    "string.base": "Google GIS authorization code should be a string.",
  }),
});

