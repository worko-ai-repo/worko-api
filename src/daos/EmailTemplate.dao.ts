// Load the base dao
import BaseDao from "./Base.dao";

// Load the local models
import { DbEmailTemplateDto, EmailTemplateModel } from "../db/models/EmailTemplate.model";

// Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";

// DAO class for handling "Master Email Templates"
class EmailTemplateDao implements BaseDao {
  // Properties related to database
  modelName = "EmailTemplate"; // Model name for "Master Email Templates"
  partitianKey = "NOTIF#TEMP"; // Partition key for "Master Email Templates"
  sortKeys = {
    SK_INIT: "EMAIL#{templateName}"
  }; // Sort keys for "Master Email Templates"
  GSI1PK = "NOTIF#TEMP#EMAIL";
  GSI1SK = "EMAIL#{templateName}";

  /**
   * getEmailTemplate
   * 
   * Get master email templates
   * 
   * @returns {}
   */
  /* async getEmailTemplate() {
    return EmailTemplateModel.query("PK")
      .eq(this.partitianKey)
      .exec();
  } */

  /**
   * getEmailTemplateByTemplateName
   * 
   * Get a master email template by the provided template name
   * 
   * @param {string} templateName
   * @returns {}
   */
  /* async getEmailTemplateByTemplateName(templateName: string) {
    return EmailTemplateModel.query("PK")
      .eq(this.partitianKey)
      .where("templateName")
      .eq(templateName)
      .exec();
  } */

  /**
   * createEmailTemplate
   * 
   * Create Email Template in local database
   * 
   * @param {EmailTemplateCreateDto} template 
   * @returns {Promise<DbEmailTemplateDto>}
   */
  async createEmailTemplate(template: EmailTemplateCreateDto): Promise<DbEmailTemplateDto> {
    // Email template id
    let id: string = UlidService.getUlidId()

    // Prepare the email template details to create entry in the database    
    const templateDbDetails = {
      PK: this.partitianKey,
      SK: this.sortKeys.SK_INIT.strtr({
        "{templateName}": template.templateName
      }),
      GSI1PK: this.GSI1PK,
      GSI1SK: this.GSI1SK.strtr({
        "{templateName}": template.templateName
      }),
      id: id,
      templateName: template.templateName,
      placeholders: template.placeholders.map(ph => `{${ph}}`), // Wrap the placeholders in "{}".
      createdByUserId: "1", // @todo fix this by using user's read id
    };

    // Logger message
    global.logger.info("Creating master email template in local db (request).", {
      filePath: __filename,
      methodName: this.createEmailTemplate.name,
      templateParamDetails: template,
      templateDbDetails: templateDbDetails,
    });

    // Create a new master email template local db entry
    return EmailTemplateModel.create(templateDbDetails);
  }
}

// Export an instance of the EmailTemplateDao class
const emailTemplateDao = new EmailTemplateDao();
export default emailTemplateDao;