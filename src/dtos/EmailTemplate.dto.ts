/**
 * EmailTemplateCreateDto
 * 
 * Structure for Create Email Template API action.
 */
interface EmailTemplateCreateDto {
  templateName: string,
  subject: string,
  bodyHtml: string,
  bodyText: string,
};

/**
 * EmailTemplateUpdateDto
 * 
 * Structure for Update Email Template API action.
 */
interface EmailTemplateUpdateDto {
  templateName: string,
  subject: string,
  bodyHtml: string,
  bodyText: string,
};

/**
 * EmailTemplateGetDto
 * 
 * Structure for Getting Email Template API action.
 */
interface EmailTemplateGetDto {
  templateName: string,
  subject?: string,
  bodyHtml?: string,
  bodyText?: string,
};