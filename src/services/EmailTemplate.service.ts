// Import installed packages
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import configurations
import { awsSesClientLibrary } from "../configs/aws-sdk.config";

// Import DAOs
import emailTemplateDao from "../daos/EmailTemplate.dao";

// Import models
import { DbEmailTemplateDto } from "../db/models/EmailTemplate.model";

/**
 * EmailTemplateService 
 * 
 * Class responsible for managing Email Template related operations.
 */
class EmailTemplateService {
  /**
   * constructor
   */
  constructor() {

  }

  /**
   * createEmailTemplate
   * 
   * Create email template in the AWS SES service and do required updates in the local database.
   *
   * @param {EmailTemplateCreateDto} emailTemplate
   * @returns {Promise<DbEmailTemplateDto | null>}
   */
  async createEmailTemplate(emailTemplate: EmailTemplateCreateDto): Promise<DbEmailTemplateDto | null> {
    // == Create email template in AWS SES.
    // Email template data required for AWS SES create
    let createEmailTempSesData: AWS.SES.Types.CreateTemplateRequest = {
      Template: {
        TemplateName: emailTemplate.templateName,
        SubjectPart: emailTemplate.subject,
        HtmlPart: emailTemplate.bodyHtml,
        TextPart: emailTemplate.bodyText
      },
    }

    // Create email template in AWS SES
    let createEmailTempSesResponse: any = await awsSesClientLibrary.createEmailTemplate(createEmailTempSesData);

    // Logger message
    global.logger.info("Creating master email template in AES SES (response).", {
      filePath: __filename,
      methodName: this.createEmailTemplate.name,
      createEmailTempSesResponse: createEmailTempSesResponse,
    });

    // Check if the Email Template was not created in the AWS SES
    if (!createEmailTempSesResponse?.ResponseMetadata?.RequestId) {
      return null;
    }

    // == Create email template in Local DB.
    // Create the email template details in the local database
    let createEmailTempDbResponse = await emailTemplateDao.createEmailTemplate({
      templateName: emailTemplate.templateName,
      subject: emailTemplate.subject,
      title: emailTemplate.title,
      bodyHtml: emailTemplate.bodyHtml,
      bodyText: emailTemplate.bodyText,
      placeholders: emailTemplate.placeholders,
      description: emailTemplate.description,
      createdByUserId: emailTemplate.createdByUserId,
    });

    // Logger message
    global.logger.info("Creating master email template in local db (response).", {
      filePath: __filename,
      methodName: this.createEmailTemplate.name,
      createEmailTempDbResponse: createEmailTempDbResponse,
    });

    return createEmailTempDbResponse;
  }

  /**
   * updateEmailTemplate
   * 
   * Update existing email template in the AWS SES service and do required updates in the local database.
   *
   * @param {EmailTemplateUpdateDto} emailTemplate
   * @returns {Promise<DbEmailTemplateDto | null>}
   */
  async updateEmailTemplate(emailTemplate: EmailTemplateUpdateDto): Promise<DbEmailTemplateDto | null> {
    // == Update email template in AWS SES.
    // Email template data required for AWS SES update
    let updateEmailTempData: AWS.SES.Types.UpdateTemplateRequest = {
      Template: {
        TemplateName: emailTemplate.templateName,
        SubjectPart: emailTemplate.subject,
        HtmlPart: emailTemplate.bodyHtml,
        TextPart: emailTemplate.bodyText
      },
    }
    
    // Update email template in AWS SES
    let updateEmailTempSesResponse: any = await awsSesClientLibrary.updateEmailTemplate(updateEmailTempData);

    // Logger message
    global.logger.info("Updating master email template in AES SES (response).", {
      filePath: __filename,
      methodName: this.updateEmailTemplate.name,
      createEmailTempSesResponse: updateEmailTempSesResponse,
    });

    // Check if the Email Template was not updated in the AWS SES
    if (!updateEmailTempSesResponse?.ResponseMetadata?.RequestId) {
      return null;
    }

    // == Update email template in Local DB.
    // Update the email template details in the local database
    let updateEmailTempDbResponse = await emailTemplateDao.updateEmailTemplate({
      templateName: emailTemplate.templateName,
      status: emailTemplate.status,
      subject: emailTemplate.subject,
      title: emailTemplate.title,
      bodyHtml: emailTemplate.bodyHtml,
      bodyText: emailTemplate.bodyText,
      placeholders: emailTemplate.placeholders,
      description: emailTemplate.description,
      updatedByUserId: emailTemplate.updatedByUserId,
    });

    // Logger message
    global.logger.info("Updating master email template in local db (response).", {
      filePath: __filename,
      methodName: this.updateEmailTemplate.name,
      updateEmailTempDbResponse: updateEmailTempDbResponse,
    });

    return updateEmailTempDbResponse;
  }
  
  /**
   * getEmailTemplateByTemplateName
   * 
   * Get existing email template details from the local database
   *
   * @param {string} templateName
   * @returns {Promise<QueryResponse<DbEmailTemplateDto>>}
   */
  async getEmailTemplateByTemplateName(templateName: string): Promise<QueryResponse<DbEmailTemplateDto>> {
    return emailTemplateDao.getEmailTemplateByTemplateName(templateName);
  }
}

// Export an instance of the EmailTemplateService class
const emailTemplateService = new EmailTemplateService()
export default emailTemplateService;