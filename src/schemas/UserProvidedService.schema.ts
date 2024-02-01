//Local loads
import { ProvidedServiceStatus } from "../enums/User.enum";

//Load npm packages
import Joi from "joi";

export const userProvidedServiceDTOValidation = Joi.object({
  masterServiceId: Joi.string().required().messages({
    "any.required": "Master service ID is required",
    "string.empty": "Master service ID should not be empty.",
  }),

  status: Joi.string()
    .valid(...Object.values(ProvidedServiceStatus))
    .required()
    .messages({
      "string.valid": "Status must be 'active'",
      "any.required": "Status is required.",
      "string.empty": "Status should not be empty.",
    }),

  serviceScope: Joi.array().items(Joi.string()).required().messages({
    "array.includesRequiredUnknowns":
      "Each item in the array must be a valid string",
    "any.required": "Service scope is required.",
    "array.empty": "Service scope should not be empty.",
  }),

  description: Joi.string().max(256).required().messages({
    "string.max": "Description must be at most 256 characters",
    "any.required": "Description is required.",
    "string.empty": "Description should not be empty.",
  }),

  durationAndPrices: Joi.object({
    priceId: Joi.string().required().messages({
      "any.required": "Price ID is required",
      "string.empty": "Price ID should not be empty.",
    }),
    durationInMinutes: Joi.number().required().messages({
      "any.required": "Duration in minutes is required",
      "number.base": "Duration in minutes must be a number",
    }),
    rate: Joi.number().required().messages({
      "any.required": "Rate is required",
      "number.base": "Rate must be a number",
    }),
    createdAt: Joi.date(),
    updatedAt: Joi.date(),
  }).required(),

  views: Joi.array().items(
    Joi.object({
      id: Joi.string().required().messages({
        "any.required": "View ID is required",
        "string.empty": "View ID should not be empty.",
      }),
      viewerUserId: Joi.string().required().messages({
        "any.required": "Viewer user ID is required",
        "string.empty": "Viewer user ID should not be empty.",
      }),
      ipAddress: Joi.string().required().messages({
        "any.required": "IP address is required",
        "string.empty": "IP address should not be empty.",
      }),
      createdAt: Joi.date(),
    })
  ),
});

export const userProvidedServiceDTOArrayValidation = Joi.array()
  .items(userProvidedServiceDTOValidation)
  .options({ stripUnknown: true });
