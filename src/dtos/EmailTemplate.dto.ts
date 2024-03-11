/**
 * EmailTemplateCreateDtoApi
 * 
 * Structure for Create Email Template API action.
 */
interface EmailTemplateCreateDtoApi {
  templateName: string,
  subject: string,
  bodyHtml: string,
  bodyText: string,
  placeholders: string[],
};

/**
 * EmailTemplateCreateDto
 * 
 * Structure for Create Email Template in local database.
 */
interface EmailTemplateCreateDto {
  templateName: string,
  subject: string,
  bodyHtml: string,
  bodyText: string,
  placeholders: string[],
};

/**
 * EmailTemplateUpdateDtoApi
 * 
 * Structure for Update Email Template API action.
 */
interface EmailTemplateUpdateDtoApi {
  templateName: string,
  subject: string,
  bodyHtml: string,
  bodyText: string,
};

/**
 * EmailTemplateUpdateDto
 * 
 * Structure for Update Email Template in local database.
 */
interface EmailTemplateUpdateDto {
  templateName: string,
  subject: string,
  bodyHtml: string,
  bodyText: string,
};

/**
 * EmailTemplateGetDtoApi
 * 
 * Structure for Getting Email Template API action.
 */
interface EmailTemplateGetDtoApi {
  templateName: string,
  subject?: string,
  bodyHtml?: string,
  bodyText?: string,
};