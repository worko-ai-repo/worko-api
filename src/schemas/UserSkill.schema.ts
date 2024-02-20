import Joi from "joi";

export const userSkillDTOValidation = Joi.object({
  coreSkills: Joi.array()
    .items(
      Joi.object({
        skillName: Joi.string().required().empty(""),
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
        skillName: Joi.string().required().empty(""),
        timestamps: Joi.object({
          createdAt: Joi.string().required(),
        }).optional(),
      })
    )
    .optional(),
  certifications: Joi.array()
    .items(
      Joi.object({
        certName: Joi.string().required().empty(""),
        issuedInstitution: Joi.string().required().empty(""),
        completionDate: Joi.date().iso().required(),
        timestamps: Joi.object({
          createdAt: Joi.string().required(),
        }).optional(),
      })
    )
    .optional(),
}).options({ stripUnknown: true });
