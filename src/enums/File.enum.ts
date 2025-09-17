/**
 * FileResourceKey
 * 
 * The possible resource keys for which the file operations possible would be performed.
 */
export enum FileResourceKey {
  /**
   * User related resource keys
   */
  USER_RESUME = "USER_RESUME",
  USER_PROFILE_PIC = "USER_PROFILE_PIC",

  /**
   * Company related recorce keys
   */
  COMPANY_LOGO = "COMPANY_LOGO",

  /**
   * Company Job description related resource keys
   */
  COMPANY_JOB_DESCRIPTION = "COMPANY_JOB_DESCRIPTION",

  /**
   * career related resource keys
   */
  CAREER_RESUME = "CAREER_RESUME",

  /**
   * Bulk CVs related resource keys
   */
  BULK_CVS = "BULK_CVS",

  /**
   * Blog related resource keys
   */
  BLOG_COVER_IMAGE = "BLOG_COVER_IMAGE",
}