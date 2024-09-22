// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load local services
import { whatsappTemplateServiceObj } from "../services/WhatsappTemplate.service";

// Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError, RequestValidationError } from "../utils/errors.util";

// Load local DTOs
import {
  WhatsappTemplateCreateDto,
  WhatsappTemplateRequestDtoApi,
} from "../dtos/WhatsappTemplate.dto";

// Load Schemas
import { whatsappTemplateCreateRequestDtoValidation } from "../schemas/WhatsappTemplate.schema";

// Load local Enums
import { WhatsappTemplateStatusEnum } from "../enums/WhatsappTemplate.enum";

/**
 * WhatsappTemplateController
 *
 * Controller for handling WhatsApp template operations including creation,
 * retrieval, and message sending.
 * 
 * NOTE : The functions for actions like update and delete are not created ,
 * if required please create to use it.
 */
class WhatsappTemplateController {
  /**
   * createWhatsappTemplate
   *
   * Creates a new WhatsApp template with the provided request body.
   *
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function
   */
  createWhatsappTemplate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Extract user ID from the request's locals
      const tokenUserId = res.locals.userId;

      // Extract the request body as WhatsappTemplateRequestDtoApi
      const requestBody: WhatsappTemplateRequestDtoApi = req.body;

      // Log the received request information
      global.logger.info("Request received to create a WhatsApp template.", {
        filePath: __filename,
        methodName: this.createWhatsappTemplate.name,
      });

      // Validate the user input and throw a validation error if necessary
      let { error, value: whatsappTemplateBody } = whatsappTemplateCreateRequestDtoValidation
        .validate(requestBody, { abortEarly: false });
      if (error) {
        throw new RequestValidationError(error);
      }
      
      // Prepare the DTO for the WhatsApp template creation
      const whatsappTemplateCreateDto: WhatsappTemplateCreateDto = {
        ...whatsappTemplateBody,
        status: WhatsappTemplateStatusEnum.ENABLED,
        createdByUserId: tokenUserId ?? "0",
      };

      // Log the creation information
      global.logger.info("Creating WhatsApp template in the service.", {
        filePath: __filename,
        methodName: this.createWhatsappTemplate.name,
        whatsappTemplateCreateDto,
      });

      // Call the service method to create the WhatsApp template
      const createdWhatsappTemplateRes =
        await whatsappTemplateServiceObj.createWhatsappTemplate(
          whatsappTemplateCreateDto
        );

      // Log success message for template creation
      global.logger.info("WhatsApp Template created successfully.", {
        filePath: __filename,
        methodName: this.createWhatsappTemplate.name,
      });

      // Send response with the created WhatsApp template
      res.status(HttpStatusCode.CREATED_201).json(createdWhatsappTemplateRes);
    } catch (error) {
      // Pass errors to the error handling middleware
      next(error);
    }
  };

  /**
   * getWhatsappTemplateByName
   *
   * Retrieves a WhatsApp template by its name.
   *
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function
   */
  getWhatsappTemplateByName = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Extract the template name from request parameters
      let templateName = req.params.templateName;

      // Log the request information
      global.logger.info(
        "Request received to get a WhatsApp template by name.",
        templateName
      );

      // Call the service method to retrieve the WhatsApp template by name
      const whatsappTemplateLocalDetails = await whatsappTemplateServiceObj.getWhatsappTemplateByName(templateName);

      // Check if the template is found in the local database
      if (!whatsappTemplateLocalDetails) {
        throw new BaseError(
          `The WhatsApp template is not found in the local database with the name ${templateName}`,
          HttpStatusCode.NOT_FOUND_404
        );
      }

      // Log success message for retrieving the template
      global.logger.info("WhatsApp Template retrieved successfully.", {
        filePath: __filename,
        methodName: this.getWhatsappTemplateByName.name,
      });

      // Send response with the retrieved WhatsApp template
      res.status(HttpStatusCode.OK_200).json(whatsappTemplateLocalDetails);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retrieves all WhatsApp templates.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {NextFunction} next - The next middleware function.
   */
  getAllWhatsappTemplates = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Log the request information
      global.logger.info("Retriving all temapltes.");

      // Call the service method to retrieve the WhatsApp template by name
      const whatsappTemplate = await whatsappTemplateServiceObj.getAllWhatsappTemplates();

      // Log success message for retrieving the template
      global.logger.info("WhatsApp Template retrieved successfully.", {
        filePath: __filename,
        methodName: this.getWhatsappTemplateByName.name,
      });

      // Send response with the retrieved WhatsApp template
      res.status(HttpStatusCode.OK_200).json(whatsappTemplate);
    } catch (error) {
      // Pass errors to the error handling middleware
      next(error);
    }
  };
}

export default WhatsappTemplateController;
