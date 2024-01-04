import Joi from "joi";

export const userEducationDTOValidation = Joi.object({
  collage: Joi.string().required().messages({
    "any.required": "Collage is a required field",
    "string.base": "Collage must be a string",
  }),
  degree: Joi.string().required().messages({
    "any.required": "Degree is a required field",
    "string.base": "Degree must be a string",
  }),
  startedYear: Joi.number().optional().integer().min(1900).messages({
    "number.base": "Started year must be a number",
    "number.integer": "Started year must be an integer",
    "number.min": "Started year must be greater than or equal to 1900",
  }),
  passingYear: Joi.number().required().integer().min(1900).messages({
    "any.required": "Passing year is a required field",
    "number.base": "Passing year must be a number",
    "number.integer": "Passing year must be an integer",
    "number.min": "Passing year must be greater than or equal to 1900",
  }),
  grade: Joi.string().optional().messages({
    "string.base": "Grade must be a string",
  }),
  field: Joi.string().optional().messages({
    "string.base": "Field must be a string",
  }),
});

export const userEducationDTOArrayValidation = Joi.array()
  .items(
    Joi.object({
      collage: Joi.string().required().messages({
        "any.required": "Collage is a required field",
        "string.base": "Collage must be a string",
      }),
      degree: Joi.string().required().messages({
        "any.required": "Degree is a required field",
        "string.base": "Degree must be a string",
      }),
      startedYear: Joi.number().optional().integer().min(1900).messages({
        "number.base": "Started year must be a number",
        "number.integer": "Started year must be an integer",
        "number.min": "Started year must be greater than or equal to 1900",
      }),
      passingYear: Joi.number().required().integer().min(1900).messages({
        "any.required": "Passing year is a required field",
        "number.base": "Passing year must be a number",
        "number.integer": "Passing year must be an integer",
        "number.min": "Passing year must be greater than or equal to 1900",
      }),
      grade: Joi.string().optional().messages({
        "string.base": "Grade must be a string",
      }),
      field: Joi.string().optional().messages({
        "string.base": "Field must be a string",
      }),
    })
  )
  .options({ stripUnknown: true });
