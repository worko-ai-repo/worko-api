import Joi from "joi";

export const userSocialProfileDTOValidation = Joi.object({
  twitter: Joi.array()
    .items(
      Joi.string().regex(
        /^https:\/\/twitter\.com\/[a-zA-Z0-9_]{1,15}\/?$/,
        "Twitter URL is not valid"
      )
    )
    .default([]),

  github: Joi.array()
    .items(
      Joi.string().regex(
        /^https:\/\/github\.com\/[a-zA-Z0-9_\-]+\/?$/,
        "GitHub URL is not valid"
      )
    )
    .default([]),

  linkedin: Joi.array()
    .items(
      Joi.string().regex(
        /^https:\/\/linkedin\.com\/in\/[a-zA-Z0-9_\-]+\/?$/,
        "LinkedIn URL is not valid"
      )
    )
    .default([]),
}).options({ stripUnknown: true });
