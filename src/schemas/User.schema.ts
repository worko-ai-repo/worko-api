// Import the Joi library
import Joi from "joi";

// Define a schema named CreateCandidateSchema to validate candidate data.
const CreateCandidateSchema = Joi.object({
  // Validate the 'name' field:
  name: Joi.string().max(10).required().messages({
    "string.max": "Name must not exceed 10 characters",
    "any.required": "Name is required",
  }),

  // Validate the 'email' field:
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required",
  }),

  // Validate the 'password' field:
  password: Joi.string()
    .min(8)
    .max(15)
    .pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/, "password")
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.max": "Password must not exceed 15 characters",
      "string.pattern.base":
        "Password must contain at least one lowercase letter, one uppercase letter, and one digit",
      "any.required": "Password is required",
    }),
});

// Export the CreateCandidateSchema for use in other parts of the application.
export { CreateCandidateSchema };
