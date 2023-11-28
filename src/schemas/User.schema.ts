// // Import the Joi library
import Joi from "joi";

export const UserLinkedinSignUpDTOValidation = Joi.object({
  // Assuming WorkoDTO has its own validation or properties
  // ...

  firstName: Joi.string().required().messages({
    "any.required": "First name is required",
  }),

  lastName: Joi.string().required().messages({
    "any.required": "Last name is required",
  }),

  emailList: Joi.object()
    .pattern(/.*/, Joi.string().email().required())
    .required()
    .messages({
      "object.base": "Email list must be an object",
      "object.pattern.any": "Invalid email format in the email list",
      "any.required": "Email list is required",
    }),
});
