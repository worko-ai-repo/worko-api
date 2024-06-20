// Load npm packages
import { Request, Response, NextFunction } from "express";

// Import Joi Validation Schema 
import { EmailTemplateCreateValidation, EmailTemplateUpdateValidation } from "../schemas/EmailTemplate.schema";

// Import services
import emailTemplateService from "../services/EmailTemplate.service";

// Import Utils
import { BaseError, RequestValidationError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 * EmailTemplateController
 *
 * Class to perform related/relevent action/activities related to the "EmailTemplate"
 */
class EmailTemplateController {
  /**
   * createEmailTemplate
   *
   * Create email template in the AWS SES service and do required updates in the local database.
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  createEmailTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Read the "userId" of the user from the token
      const tokenUserId = res.locals.userId;

      // Extract email template data from the request body
      const requestBody: EmailTemplateCreateDtoApi = req.body;

      // Logger message
      global.logger.info("Request received to create an email template.", {
        filePath: __filename,
        methodName: this.createEmailTemplate.name
      });

      // Validate the incoming data using the defined validation schema in "EmailTemplateCreateValidation"
      const { error } = EmailTemplateCreateValidation.validate(requestBody, {
        abortEarly: false,
      });

      // Check if validation resulted in errors
      if (error) {
        // Logger message
        global.logger.info("Request data validation failed.", {
          filePath: __filename,
          methodName: this.createEmailTemplate.name
        });

        throw new RequestValidationError(error);
      }

      // Create email template
      const emailTemplateCreateDto: EmailTemplateCreateDto = {
        ...requestBody,
        createdByUserId: tokenUserId,
      }
      const createdEmailTemplateRes = await emailTemplateService.createEmailTemplate(emailTemplateCreateDto);

      // Logger message
      global.logger.info("Email Template created successfully.", {
        filePath: __filename,
        methodName: this.createEmailTemplate.name
      });

      // Send successful response with the created email template data
      res.status(HttpStatusCode.CREATED_201).json(createdEmailTemplateRes);
    } catch (error) {
      // Pass the error to the next error handler
      next(error);
    }
  };

  /**
   * updateEmailTemplate
   *
   * Update email template in the AWS SES service and do required updates in the local database.
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  updateEmailTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Read the "userId" of the user from the token
      const tokenUserId = res.locals.userId;

      // Get mail template name
      const templateName: string = req.params["templateName"];

      // Extract email template data from the request body
      const requestBody: EmailTemplateUpdateDtoApi = req.body;

      // Logger message
      global.logger.info("Request received to update an existing email template.", {
        filePath: __filename,
        methodName: this.updateEmailTemplate.name,
        templateName: templateName,
      });

      // Validate the incoming data using the defined validation schema in "EmailTemplateUpdateValidation"
      const { error } = EmailTemplateUpdateValidation.validate(requestBody, {
        abortEarly: false,
      });

      // Check if validation resulted in errors
      if (error) {
        // Logger message
        global.logger.info("Request data validation failed.", {
          filePath: __filename,
          methodName: this.updateEmailTemplate.name
        });

        throw new RequestValidationError(error);
      }

      // Update email template
      const emailTemplateUpdateDto: EmailTemplateUpdateDto = {
        ...requestBody,
        updatedByUserId: tokenUserId,
      }
      const updateEmailTemplateRes = await emailTemplateService.updateEmailTemplate(emailTemplateUpdateDto);

      // Logger message
      global.logger.info("Email Template update successfully.", {
        filePath: __filename,
        methodName: this.updateEmailTemplate.name
      });

      // Send successful response with the update email template data
      res.status(HttpStatusCode.OK_200).json(updateEmailTemplateRes);
    } catch (error) {
      // Pass the error to the next error handler
      next(error);
    }
  };

  /**
   * getEmailTemplateByTemplateName
   *
   * Get existing email template details from the AWS SES service and local database for the provided "templateName".
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  getEmailTemplateByTemplateName = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get mail template name
      const templateName: string = req.params["templateName"];

      // Logger message
      global.logger.info(`Request received to get an "${templateName}" existing email template details.`, {
        filePath: __filename,
        methodName: this.getEmailTemplateByTemplateName.name
      });

      // Check if value is not present
      if (!templateName) {
        // Logger message
        global.logger.error("Request data validation failed.", {
          filePath: __filename,
          methodName: this.getEmailTemplateByTemplateName.name,
          templateName: templateName,
        });

        throw new BaseError("Template name is required.", HttpStatusCode.BAD_REQUEST_400);
      }

      // Get email template details from AWS SES and local db
      const emailTemplateDetailsRes = await emailTemplateService.getEmailTemplateByTemplateName(templateName);

      // Logger message
      // @todo if template found or not found based on that log the message.
      global.logger.info("Email Template found.", {
        filePath: __filename,
        methodName: this.getEmailTemplateByTemplateName.name
      });

      // Send successful response with the email template data
      res.status(HttpStatusCode.OK_200).json(emailTemplateDetailsRes);
    } catch (error) {
      // Pass the error to the next error handler
      next(error);
    }
  };

  /**
   * deleteEmailTemplateByName
   *
   * Delete the already created email template from AWS SES and local database.
   * 
   * Note: The delete should not be allowed usually.
   * If you really want to delete the template then know that once it is deleted it cannot be used or recovered.
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  deleteEmailTemplateByName = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get mail template name
      const templateName: string = req.params["templateName"];

      // Logger message
      global.logger.info(`Request received to delete "${templateName}" master email template.`, {
        filePath: __filename,
        methodName: this.deleteEmailTemplateByName.name
      });

      // Check if value is not present
      if (!templateName) {
        // Logger message
        global.logger.error("Request data validation failed.", {
          filePath: __filename,
          methodName: this.deleteEmailTemplateByName.name,
          templateName: templateName,
        });

        throw new BaseError("Template name is required.", HttpStatusCode.BAD_REQUEST_400);
      }

      // Delete the email template from AWS SES and local db
      const deleteTemplateRes = await emailTemplateService.deleteEmailTemplateByName(templateName);

      // Send response with with the status
      res.status(HttpStatusCode.OK_200).json(deleteTemplateRes);
    } catch (error) {
      // Pass the error to the next error handler
      next(error);
    }
  };
}

export default EmailTemplateController;