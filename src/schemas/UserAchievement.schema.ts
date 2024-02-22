import Joi from "joi";

/* export const userAchievementDTOValidation = Joi.object({
  achievements: Joi.array().items(
    Joi.object({
      title: Joi.string().required().messages({
        "any.required": "title is required",
        "string.base": "title must be a string",
      }),
      date: Joi.date().iso().required().messages({
        "any.required": "date is required",
        "string.base": "date must be a string",
      }),
    })
  ),
}).options({ stripUnknown: true }); */

export const userAchievementDTOValidation = Joi.object({
  achievements: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().required().messages({
          "string.base": "Title must be a string",
          "any.required": "Title is required",
        }),
        acquiredFrom: Joi.string().required().messages({
          "string.base": "acquiredFrom must be a string",
          "any.required": "acquiredFrom is required",
        }),
        achievDate: Joi.date().required().messages({
          "date.base": "Achievement date must be a valid date",
          "any.required": "Achievement date is required",
        }),
        timestamps: Joi.object({
          createdAt: Joi.string().required().messages({
            "string.base": "Created at must be a string",
            "any.required": "Created at timestamp is required",
          }),
          updatedAt: Joi.string().required().messages({
            "string.base": "Updated at must be a string",
            "any.required": "Updated at timestamp is required",
          }),
        }).optional(),
      })
    )
    .messages({
      "array.base": "Achievements should be an array",
    }),
})
  .messages({
    "object.unknown": "Invalid field in user achievement data",
  })
  .options({ stripUnknown: true });
