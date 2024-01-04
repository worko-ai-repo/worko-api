import Joi from "joi";

/* export const userSkillDTOValidation = Joi.object({
  softSkills: Joi.array()
    .items(
      Joi.object({
        skill: Joi.string().required().messages({
          "any.required": "Soft skill is required",
          "string.base": "Soft skill must be a string",
        }),
        years: Joi.string().required().messages({
          "any.required": "Years of experience is required for soft skill",
          "string.base": "Years of experience must be a string",
        }),
      })
    )
    .required()
    .messages({
      "any.required": "Soft skills are required",
    }),
  coreSkills: Joi.array()
    .items(
      Joi.string().required().messages({
        "any.required": "Core skill is required",
        "string.base": "Core skill must be a string",
      })
    )
    .required()
    .messages({
      "any.required": "Core skills are required",
    }),
  certifications: Joi.array()
    .items(
      Joi.string().required().messages({
        "any.required": "Certification is required",
        "string.base": "Certification must be a string",
      })
    )
    .required()
    .messages({
      "any.required": "Certifications are required",
    }),
}).options({ stripUnknown: true }); */

export const userSkillDTOValidation = Joi.object({
  coreSkills: Joi.array()
    .items(
      Joi.object({
        masterSkillId: Joi.string().optional().empty(""),
        otherSkillName: Joi.string().optional().empty(""),
        years: Joi.number().required().min(0),
        timestamps: Joi.object({
          createdAt: Joi.string().required(),
          updatedAt: Joi.string().required(),
        }).optional(),
      })
    )
    .optional(),
  softSkills: Joi.array()
    .items(
      Joi.object({
        masterSkillId: Joi.string().optional().empty(""),
        otherSkillName: Joi.string().optional().empty(""),
        timestamps: Joi.object({
          createdAt: Joi.string().required(),
        }).optional(),
      })
    )
    .optional(),
  certifications: Joi.array()
    .items(
      Joi.object({
        masterCertId: Joi.string().optional().empty(""),
        otherCertName: Joi.string().optional().empty(""),
        timestamps: Joi.object({
          createdAt: Joi.string().required(),
        }).optional(),
      })
    )
    .optional(),
}).options({ stripUnknown: true });
