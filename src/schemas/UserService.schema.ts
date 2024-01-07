import Joi from "joi";

export const userServiceRequestDTOValidation = Joi.object({
  mentorLevel: Joi.number().integer().required().messages({
    "any.required": "Mentor level is required.",
    "number.base": "Mentor level must be a number.",
    "number.integer": "Mentor level must be an integer.",
  }),
  slot1: Joi.date().required().messages({
    "any.required": "Slot 1 is required.",
    "date.base": "Slot 1 must be a valid date.",
  }),
  slot2: Joi.date().required().messages({
    "any.required": "Slot 2 is required.",
    "date.base": "Slot 2 must be a valid date.",
  }),
  slot3: Joi.date().required().messages({
    "any.required": "Slot 3 is required.",
    "date.base": "Slot 3 must be a valid date.",
  }),
  details: Joi.string().allow("").optional().messages({
    "string.base": "Details must be a string.",
  }),
  masterServiceId: Joi.string().required().messages({
    "any.required": "Master service ID is required.",
    "string.base": "Master service ID must be a string.",
  }),
  companySK: Joi.string().required().messages({
    "any.required": "companySK is required",
  }),
});

export const userServiceInterviewGuidanceRequestDTOValidation = Joi.object({
  mentorLevel: Joi.number().integer().required().messages({
    "any.required": "Mentor level is required.",
    "number.base": "Mentor level must be a number.",
    "number.integer": "Mentor level must be an integer.",
  }),
  slot1: Joi.date().required().messages({
    "any.required": "Slot 1 is required.",
    "date.base": "Slot 1 must be a valid date.",
  }),
  details: Joi.string().allow("").optional().messages({
    "string.base": "Details must be a string.",
  }),
  masterServiceId: Joi.string().required().messages({
    "any.required": "Master service ID is required.",
    "string.base": "Master service ID must be a string.",
  }),
  companySK: Joi.string().required().messages({
    "any.required": "CompanySK is required",
  }),
  role: Joi.string().required().messages({
    "any.required": "Role is required.",
    "string.base": "Role must be a string.",
  }),
});
