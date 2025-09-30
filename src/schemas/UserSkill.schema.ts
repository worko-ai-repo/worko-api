import Joi from "joi";

export const userSkillDTOValidation = Joi.object({
  coreSkills: Joi.array()
    .items(
      Joi.object({
        skillName: Joi.string().required().empty("").lowercase(),
        years: Joi.number().required().min(0),
        timestamps: Joi.object({
          createdAt: Joi.string().required(),
          updatedAt: Joi.string().required(),
        }).optional(),
      })
    )
    .optional(),
  technicalSkills: Joi.array()
    .items(
      Joi.object({
        skillName: Joi.string().required().empty("").lowercase(),
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
        skillName: Joi.string().required().empty("").lowercase(),
        timestamps: Joi.object({
          createdAt: Joi.string().required(),
        }).optional(),
      })
    )
    .optional(),
  certifications: Joi.array()
    .items(
      Joi.object({
        certName: Joi.string().required().empty("").lowercase(),
        issuedInstitution: Joi.string().required().empty("").lowercase(),
        completionDate: Joi.string().isoDate().required(),
        timestamps: Joi.object({
          createdAt: Joi.string().required(),
        }).optional(),
      })
    )
    .optional(),
}).options({ stripUnknown: true });
