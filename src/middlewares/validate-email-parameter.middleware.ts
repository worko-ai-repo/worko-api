// import the necessary npm packages
import { Request, Response, NextFunction } from "express";

// Import the schemas
import { validateEmailField } from "../schemas/User.schema";

// Import the utils
import { RequestValidationError } from "../utils/errors.util";

/**
 * ValidateEmailParamMiddleware
 *
 * Middleware to validate the email path parameter in the request url.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The function to pass control to the next middleware.
 * @throws {RequestValidationError} If the email parameter is invalid.
 */
export function validateEmailParamMiddleware(req: Request, res: Response, next: NextFunction) {
  // Log the action for debugging purposes
  global.logger.info("Validate email parameter [middleware]");

  // Extract email from request parameters
  const { emailId } = req.params;

  // Validate the email field using Joi schema and throw error if not valid
  const { error } = validateEmailField(emailId);
  if (error) {
    return next(new RequestValidationError(error));
  }

  // Pass the request to the next middleware if email is valid
  next();
}
