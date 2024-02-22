import Joi from "joi";

// Schema for validating a single user experience object
export const userExperienceDTOValidation = Joi.object({
  // Validation for user type, must be either "EMP" or "CAND"
  userType: Joi.string().valid("EMP", "CAND").required().messages({
    "any.required": "The User Type  is required.",
    "string.empty": "The User type should not be empty.",
  }),

  // Department field validation
  department: Joi.string().required().messages({
    "any.required": "Department is required.",
    "string.empty": "Department should not be empty.",
  }),

  // Designation field validation
  designation: Joi.string().required().messages({
    "any.required": "Designation is required.",
    "string.empty": "Designation should not be empty.",
  }),

  // Optional field for designation tag
  designationTag: Joi.number(),

  // Validation for startedMonth field
  startedMonth: Joi.number().integer().min(1).max(12),

  // Validation for endedMonth field
  endedMonth: Joi.number().integer().min(1).max(12),

  // Validation for startedYear field
  startedYear: Joi.number().integer().min(1900).max(new Date().getFullYear()),

  // Validation for endedYear field
  endedYear: Joi.number().integer().min(1900).max(new Date().getFullYear()),

  // Validation for experience in months, only required when userType is "EMP"
  experienceInMonths: Joi.when("userType", {
    is: "EMP",
    then: Joi.number().integer().min(1).required().messages({
      "any.required": "The Experience field is required.",
      "string.empty": "The Experience field should not be empty.",
    }),
    otherwise: Joi.forbidden(),
  }),

  // Validation for company name
  companyName: Joi.string().required().messages({
    "any.required": "Company Name is required.",
    "string.empty": "Company Name should not be empty.",
  }),

  // Validation for company SK
  companySK: Joi.string().required().messages({
    "any.required": "Company SK is required.",
    "string.empty": "Company SK should not be empty.",
  }),

  // Validation for email ID
  emailId: Joi.string().email().required().messages({
    "any.required": "Email ID is required.",
    "string.empty": "Email ID should not be empty.",
    "string.email": "Email ID must be a valid email address.",
  }),
});

// Schema for validating an array of user experience objects
export const userExperienceDTOArrayValidation = Joi.array().items(
  Joi.object({
    // Validation for user type, must be either "EMP" or "CAND"
    userType: Joi.string().valid("EMP", "CAND").required().messages({
      "any.required": "The User Type  is required.",
      "string.empty": "The User type should not be empty.",
    }),

    // Department field validation
    department: Joi.string().required().messages({
      "any.required": "Department is required.",
      "string.empty": "Department should not be empty.",
    }),

    // Designation field validation
    designation: Joi.string().required().messages({
      "any.required": "Designation is required.",
      "string.empty": "Designation should not be empty.",
    }),

    // Optional field for designation tag
    designationTag: Joi.number(),

    // Validation for startedMonth field
    startedMonth: Joi.number().integer().min(1).max(12),

    // Validation for endedMonth field
    endedMonth: Joi.number().integer().min(1).max(12),

    // Validation for startedYear field
    startedYear: Joi.number().integer().min(1900).max(new Date().getFullYear()),

    // Validation for endedYear field
    endedYear: Joi.number().integer().min(1900).max(new Date().getFullYear()),

    // Validation for experience in months, only required when userType is "EMP" ,
    experienceInMonths: Joi.when("userType", {
      is: "EMP",
      then: Joi.number().integer().min(1).required().messages({
        "any.required": "The Experience field is required.",
        "string.empty": "The Experience field should not be empty.",
      }),
      otherwise: Joi.forbidden(),
    }),

    // Validation for company name
    companyName: Joi.string().required().messages({
      "any.required": "Company Name is required.",
      "string.empty": "Company Name should not be empty.",
    }),

    // Validation for company SK
    companySK: Joi.string().required().messages({
      "any.required": "Company SK is required.",
      "string.empty": "Company SK should not be empty.",
    }),

    // Validation for email ID
    emailId: Joi.string().email().required().messages({
      "any.required": "Email ID is required.",
      "string.empty": "Email ID should not be empty.",
      "string.email": "Email ID must be a valid email address.",
    }),
  }).options({ stripUnknown: true })
);
