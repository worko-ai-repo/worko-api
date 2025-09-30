import Joi from "joi";

export const userSocialProfileDTOValidation = Joi.object({
  twitter: Joi.array()
    .items(
      Joi.string()
    )
    .default([]),

  github: Joi.array()
    .items(
      Joi.string()
    )
    .default([]),

    linkedin: Joi.array()
    .items(
      Joi.string()
    )
    .required(),

    otherSocialPlatForms: Joi.object().default({}).optional().messages({
      "object.base": "Other social platforms must be an object",
    }),

    PK: Joi
      .string()
      .optional()
      .allow("",null),

    SK: Joi
      .string()
      .optional()
      .allow("",null),
      
  }).options({ stripUnknown: true });