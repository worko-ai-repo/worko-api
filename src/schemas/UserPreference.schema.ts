
// import joi
import Joi from "joi";

export const userPreferenceCreateOrUpdateApiDtoValidation: Joi.ObjectSchema<any> = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Email is required.",
    "string.email": "Please provide a valid email address.",
    "string.empty": "Email cannot be empty.",
  }),
   
  userPreferredDepartments: Joi.array().items(Joi.string().lowercase()).min(1).optional().messages({
    "array.base": "Departments must be an array.",
    "array.empty": "Departments cannot be empty.",
  }),

  userPreferredIndustries: Joi.array().items(Joi.string().lowercase()).min(1).optional().messages({
    "array.base": "Industries must be an array.",
    "array.empty": "Industries cannot be empty.",
  }),

  userPreferredlocations: Joi.array().items(Joi.string().lowercase()).min(1).optional().messages({
    "array.base": "Locations must be an array.",
    "array.empty": "Locations cannot be empty.",
  }),

  userPreferredRoles: Joi.array().items(Joi.string().lowercase()).min(1).optional().messages({
    "array.base": "Roles must be an array.",
    "array.empty": "Roles cannot be empty.",
  }),
});