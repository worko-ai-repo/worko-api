// Import the Joi library
import Joi from "joi";

export const masterServiceDTOValidation = Joi.object({
  name: Joi.string()
    .required()
    .min(3)
    .message("Name must be at least 3 characters")
    .max(50)
    .message("Name cannot exceed 50 characters"),

  isActive: Joi.boolean().required().messages({
    "any.required": "isActive is required",
  }),

  details: Joi.string()
    .allow("")
    .max(255)
    .message("Details must be a string with a maximum length of 255"),
});
