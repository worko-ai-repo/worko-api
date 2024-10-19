// import joi
import Joi from "joi";

// Define the email validation schema
export const scriptValidateEmailFieldSchema = Joi.object({
  oldEmail: Joi
  .string()
  .email()
  .required()
  .messages({
    "string.email": "Old email must be a valid email address",
    "string.empty": "Old email should not be empty",
    "any.required": "Old email is required",
  }),
  newEmail: Joi
    .string()
    .email()
    .required()
    .custom((value, helpers) => {
      const { oldEmail } = helpers.state.ancestors[0]; // Get the oldEmail value
      if (value === oldEmail) {
        return helpers.error("any.invalid", {
          message: "New email must be different from the old email",
        });
      }
      return value.toLowerCase(); // Convert to lowercase after the checking the oldEmail and newEmail values are different
    })
    .messages({
      "string.email": "New email must be a valid email address",
      "string.empty": "New email should not be empty",
      "any.required": "New email is required",
    }),
});
