
/**
 * BlogStatusEnum
 * 
 * Enum representing the status of a blog.
 */
export enum BlogStatusEnum {
  // Blog IS NOT CREATED YET AND SAVED IN DRAFT
  DRAFT = "DRAFT",

  // Blog IS ARCHIVED WHERE ADMIN WANT TO HIDE THE Blog
  ARCHIVED = "ARCHIVED",

  // Blog IS CREATED AND ACTIVE
  PUBLISHED = "PUBLISHED",

  // Blog IS CLOSED
  CLOSED = "CLOSED",
}