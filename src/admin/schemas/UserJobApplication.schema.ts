// Import the Joi library
import Joi from "joi";

// import schemas
import { commonSchema } from "../../schemas/Common.schema";
import { JobApplicationStatus } from "../../enums/UserJobApplication.enum";

// Define validation schema for filtering job application requests
export const userJobApplicationFilterDtoValidation = commonSchema.concat(
  Joi.object({
    status: Joi.string()
      .optional() // allow `undefined` value
      .allow(null, "")
      .valid(...Object.values(JobApplicationStatus))
      .messages({
        "any.only": `Invalid Job application status. Please provide a valid value from
      ${Object.values(JobApplicationStatus).join(", ")}.`,
      }),
  })
);
