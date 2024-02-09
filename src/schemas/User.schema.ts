import Joi from "joi";

export const UserSignUpDTOValidation = Joi.object({
  name: Joi.string()
    .regex(/^[a-zA-Z]+$/)
    .required()
    .messages({
      "any.required": "Name is required",
      "string.pattern.base": "Name must contain only alphabetic characters",
    }),
  email: Joi.string().email().required().messages({
    "any.required": "Email is required.",
    "string.email": "Please provide a valid email address.",
    "string.empty": "Email cannot be empty.",
  }),
  number: Joi.number()
    .integer()
    .required()
    .min(1000000000)
    .max(9999999999)
    .messages({
      "number.base": "Number must be a valid number",
      "number.integer": "Number must be an integer",
      "number.min": "Number must be a 10-digit phone number",
      "number.max": "Number must be a 10-digit phone number",
      "any.required": "Number is required",
    }),

  linkedinUrl: Joi.string()
    .regex(
      /^(https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_\-]+\/?)$/,
      "LinkedIn URL is not valid"
    )
    .messages({
      "string.pattern.base": "Please Provide Valid URL",
    }),
  ECTC: Joi.number().min(0).options({ convert: false }).required().messages({
    "any.required": "ECTC is required",
    "number.base": "ECTC should be a valid number",
    "number.min": "Number must be greater than or equal to 0",
  }),
  YOE: Joi.number().min(0).options({ convert: false }).required().messages({
    "any.required": "YOE is required",
    "number.base": "YOE should be a valid number",
    "number.min": "Number must be greater than or equal to 0",
  }),
  CV: Joi.string().optional().messages({
    "any.required": "CV is required",
  }),
  userId: Joi.string().required().messages({
    "any.required": "User ID is required",
  }),
}).options({ stripUnknown: true });

export const userEmployeeSignUpDTOValidation = Joi.object({
  name: Joi.string()
    .regex(/^[a-zA-Z]+$/)
    .required()
    .messages({
      "any.required": "Name is required",
      "string.pattern.base": "Name must contain only alphabetic characters",
    }),
  email: Joi.string().email().required().messages({
    "any.required": "Email is required.",
    "string.email": "Please provide a valid email address.",
    "string.empty": "Email cannot be empty.",
  }),
  number: Joi.number()
    .options({ convert: false })
    .min(1000000000)
    .max(9999999999)
    .required()
    .messages({
      "any.required": "Number is required.",
      "number.base": "Number must be a valid number.",
      "number.max": "Number must be equal to 10.",
    }),
  linkedinUrl: Joi.string().regex(
    /^(https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_\-]+\/?)$/,
    "LinkedIn URL is not valid"
  ),
  YOE: Joi.number().options({ convert: false }).integer().required().messages({
    "any.required": "Years of Experience (YOE) is required.",
    "number.base": "YOE must be a valid number.",
    "number.integer": "YOE must be an integer.",
  }),
  companyName: Joi.string().required().messages({
    "any.required": "Company Name is required.",
    "string.empty": "Company Name cannot be empty.",
  }),
  companySK: Joi.string().required().messages({
    "any.required": "Company SK is required.",
    "string.empty": "Company SK should not be empty.",
  }),
  companyEmailId: Joi.string().email().required().messages({
    "any.required": "Company Email ID is required.",
    "string.email": "Please provide a valid company email address.",
    "string.empty": "Company Email ID cannot be empty.",
  }),
  department: Joi.string().required().messages({
    "any.required": "Department is required.",
    "string.empty": "Department cannot be empty.",
  }),
  designation: Joi.string().required().messages({
    "any.required": "Designation is required.",
    "string.empty": "Designation cannot be empty.",
  }),
  designationTag: Joi.number()
    .options({ convert: false })
    .integer()
    .required()
    .messages({
      "any.required": "designationTag is required.",
      "number.base": "designationTag must be a valid number.",
      "number.integer": "designationTag must be an integer.",
    }),
  userId: Joi.string().required().messages({
    "any.required": "User ID is required",
  }),
});

export const validateEmailField = (email: string) => {
  const Email = Joi.string().email().required().messages({
    "any.required": "Email is required.",
    "string.email": "Please provide a valid email address.",
    "string.empty": "Email cannot be empty.",
  });

  return Email.validate(email);
};
