// Import necessary packages
import Joi from "joi"; // Joi package for validation

// Import enums
import { UserSubscriptionStatus } from "../../enums/UserSubscription.enum";

// Import common schema
import { commonSchema } from "../../schemas/Common.schema";

// Define validation schema for get all signup users filter DTO
export const subscriptionFilterDtoValidation = commonSchema.concat(
  Joi.object({
    status: Joi.string()
      .optional()
      .valid(...Object.values(UserSubscriptionStatus))
      .messages({
        "any.only": `Invalid subscription status. Please provide a valid value from
      ${Object.values(UserSubscriptionStatus).join(", ")}.`,
      })
  })
);