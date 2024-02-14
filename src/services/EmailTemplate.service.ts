// Import configurations
import { awsSesClientLibrary } from "../configs/aws-sdk.config";

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
   * @returns {Promise<AWS.SES.Types.CreateTemplateResponse>}
   */
  async createEmailTemplate(emailTemplate: EmailTemplateCreateDto): Promise<AWS.SES.Types.CreateTemplateResponse> {
    // == @todo create the email template details in the local database

    // == Create email template in AWS SES.
    // Email template data required for AWS SES create
    let createEmailTempData: AWS.SES.Types.CreateTemplateRequest = {
      Template: {
        TemplateName: emailTemplate.templateName,
        SubjectPart: emailTemplate.subject,
        HtmlPart: emailTemplate.bodyHtml,
        TextPart: emailTemplate.bodyText
      },
    }

    // @todo here it should return the data from local database or AWS SES combined.
    // Create email template and return the response back
    return awsSesClientLibrary.createEmailTemplate(createEmailTempData);
  }

  /**
   * updateEmailTemplate
   * 
   * Update existing email template in the AWS SES service and do required updates in the local database.
   *
   * @param {EmailTemplateUpdateDto} emailTemplate
   * @returns {Promise<AWS.SES.Types.UpdateTemplateResponse> }
   */
  async updateEmailTemplate(emailTemplate: EmailTemplateUpdateDto): Promise<AWS.SES.Types.UpdateTemplateResponse> {
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