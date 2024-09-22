// Import Joi for validation
import Joi from "joi";

/**
 * whatsappTemplateCreateRequestDtoValidation
 * 
 * Defines the validation schema for the WhatsApp template request DTO.
 * This schema validates the structure and content of the request body when creating a WhatsApp template.
 *
 * @returns {Joi.ObjectSchema} - The Joi validation schema for validating WhatsApp template creation requests.
 */
export const whatsappTemplateCreateRequestDtoValidation = Joi.object({
  /**
   * Validates the `whatsappTemplateName` field.
   * - Must be a string.
   * - This field is required.
   * - An error message is provided if the field is empty or not provided.
   */
  whatsappTemplateName: Joi.string().required().messages({
    "any.required": "WhatsApp template name is required.",
    "string.empty": "WhatsApp template name should not be empty.",
  }),

  /**
   * Validates the `templatePlaceholders` field.
   * - Must be an object.
   * - This field is required.
   * - An error message is provided if the field is not provided or is not a valid object.
   */
  templatePlaceholders: Joi.object().required().messages({
    "any.required": "Template placeholders are required.",
    "object.base": "Template placeholders should be a valid object.",
  }),
});
