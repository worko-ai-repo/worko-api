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
   * @param {EmailTemplateCreateDtoApi} emailTemplate
   * @returns {Promise<DbEmailTemplateDto | null>}
   */
  async createEmailTemplate(emailTemplate: EmailTemplateCreateDtoApi): Promise<DbEmailTemplateDto | null> {
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
      bodyHtml: emailTemplate.bodyHtml,
      bodyText: emailTemplate.bodyText,
      placeholders: emailTemplate.placeholders,
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
   * @param {EmailTemplateUpdateDtoApi} emailTemplate
   * @returns {Promise<AWS.SES.Types.UpdateTemplateResponse> }
   */
  async updateEmailTemplate(emailTemplate: EmailTemplateUpdateDtoApi): Promise<AWS.SES.Types.UpdateTemplateResponse> {
    // == @todo update the email template details in the local database

    // == Update email template in AWS SES.
    // Email template data in AWS format
    let updateEmailTempData: AWS.SES.Types.UpdateTemplateRequest = {
      Template: {
        TemplateName: emailTemplate.templateName,
        SubjectPart: emailTemplate.subject,
        HtmlPart: emailTemplate.bodyHtml,
        TextPart: emailTemplate.bodyText
      },
    }

    // @todo here it should return the data from local database or AWS SES combined.
    // Update email template and return the response back
    return awsSesClientLibrary.updateEmailTemplate(updateEmailTempData);
  }
  
  /**
   * getEmailTemplateByTemplateName
   * 
   * Get existing email template details from the AWS SES service and local database
   *
   * @param {string} templateName
   * @returns {Promise<AWS.SES.Types.GetTemplateResponse> }
   */
  async getEmailTemplateByTemplateName(templateName: string): Promise<AWS.SES.Types.GetTemplateResponse> {
    // @todo get the details from local database or AWS SES combined.
    // Get email template details from AWS SES
    return awsSesClientLibrary.getEmailTemplateByTemplateName(templateName);
  }
}

// Export an instance of the EmailTemplateService class
const emailTemplateService = new EmailTemplateService()
export default emailTemplateService;