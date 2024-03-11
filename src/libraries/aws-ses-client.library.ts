// NPM packages
import AWS from "aws-sdk";

/**
 * AwsSesClientLibrary
 *
 * This library is a wrapper library for AWS SES service that has regularly used method.
 * Feel free to enhance this as needed.
 */
class AwsSesClientLibrary {
  /**
   * ses
   *
   * AWS SES object to perform SES related operations.
   */
  private ses: AWS.SES;

  /**
   * constructor
   *
   * @param {AWS.SES.ClientConfiguration} config
   */
  constructor(private config: AWS.SES.ClientConfiguration) {
    this.ses = new AWS.SES(this.config);

    // Log message
    console.log(`The '${AwsSesClientLibrary.name}' is initialised."`, {
      filePath: __filename,
    });
  }

  /**
   * updateConfig
   *
   * Update the AWS SES configuration
   *
   * @param {AWS.SES.ClientConfiguration} config
   * @returns {void}
   */
  updateConfig(config: AWS.SES.ClientConfiguration): void {
    this.config = config;
    this.ses = new AWS.SES(config);
  }

  /**
   * createEmailTemplate
   * 
   * Create a new email template in AWS SES based on the data provided
   * 
   * @param {AWS.SES.Types.CreateTemplateRequest} emailTemplate 
   * @returns {Promise<AWS.SES.Types.CreateTemplateResponse>}
   */
  async createEmailTemplate(emailTemplate: AWS.SES.Types.CreateTemplateRequest): Promise<AWS.SES.Types.CreateTemplateResponse> {
    // Logger message
    global.logger.info("Creating master email template in AWS SES (data).", {
      filePath: __filename,
      methodName: this.createEmailTemplate.name,
      emailTemplate: emailTemplate,
    });

    // Creae the email template in AWS SES
    return this.ses.createTemplate(emailTemplate).promise();
  }

  /**
   * updateEmailTemplate
   * 
   * Update existing email template in AWS SES based on the data provided
   * 
   * @param {AWS.SES.Types.UpdateTemplateRequest} emailTemplate 
   * @returns {Promise<AWS.SES.Types.UpdateTemplateResponse>}
   */
  async updateEmailTemplate(emailTemplate: AWS.SES.Types.UpdateTemplateRequest): Promise<AWS.SES.Types.UpdateTemplateResponse> {
    return this.ses.updateTemplate(emailTemplate).promise();
  }
  
  /**
   * getEmailTemplateByTemplateName
   * 
   * Get existing email template from AWS SES for the provided Template name
   * 
   * @param {string} emailTemplate 
   * @returns {Promise<AWS.SES.Types.GetTemplateResponse>}
   */
  async getEmailTemplateByTemplateName(emailTemplate: string): Promise<AWS.SES.Types.GetTemplateResponse> {
    return this.ses.getTemplate({ TemplateName: emailTemplate }).promise();
  }
}

export { AwsSesClientLibrary }