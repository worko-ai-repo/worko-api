// Load the npm packages
import * as dynamoose from "dynamoose";
import { ModelType } from "dynamoose/dist/General";
import { Schema } from "dynamoose/dist/Schema";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// import Enums
import { BlogStatusEnum } from "../../enums/Blog.enum";

// Define the structure for Blog Database Data Transfer Object (DTO)
class DbBlogDto extends BaseDbDto {
  // Id
  id!: string;

  /**
   * createdByUserId
   *
   * @reference `id` attribute of `UserDetail.model.ts`
   */
  createdByUserId!: string;

  /**
   * updatedByUserId
   *
   * @reference `id` attribute of `UserDetail.model.ts`
   */
  updatedByUserId?: string;

  /**
   * title
   *
   * @description The title of the blog
   * @example `Some text content`
   */
  title!: string;

  /**
   * status
   *
   * @description The status of the blog
   * @example `PUBLISHED`
   */
  status!: BlogStatusEnum;

  /**
   * basicDescription
   *
   * @description
   *  1. The basic description of the blog
   *
   * @example `Some text content`
   */
  basicDescription!: string;

  /**
   * detailedDescription
   *
   * @description
   *  1. The detailed description of the blog
   *  2. This attribute will be used for searching the blog
   *
   * @example `Some text content`
   */
  detailedDescription!: string;

  /**
   * htmlDetailedDescription
   *
   * @description
   *  1. The HTML detailed description of the blog
   *  2. This attribute will be used for displaying the blog in UI
   *
   * @example `<p>Some HTML content</p>`
   */
  htmlDetailedDescription!: string;

  /**
   * cloudBlogName
   *
   * @description The name of the blog image which is stored in `aws s3` bucket
   * @example `01JEP2QCMEX23YPSNBDW0QK8CY.jpg`
   */
  cloudBlogCoverImageName?: string;

  /**
   * tags
   *
   * @NOTE:
   *  1. As of now this attribute is not in use, but it maybe used in the future.
   *
   * @description Tags associated with the blog (useful for search/filtering)
   * @example ['technology', 'javascript', 'aws']
   */
  tags?: string[];

  /**
   * likesCount
   *
   * @NOTE:
   *  1. As of now this attribute is not in use, but it maybe used in the future.
   *
   * @description Number of likes/upvotes for this blog
   * @example 50
   */
  likesCount?: number;
}

// Define the schema for the Blog
const BlogSchema: Schema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    id: {
      type: String,
      required: true,
    },
    createdByUserId: {
      type: String,
      required: true,
    },
    updatedByUserId: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BlogStatusEnum),
      required: true,
    },
    basicDescription: {
      type: String,
      required: true,
    },
    detailedDescription: {
      type: String,
      required: true,
    },
    htmlDetailedDescription: {
      type: String,
      required: true,
    },
    cloudBlogCoverImageName: {
      type: String,
      required: false,
    },
    tags: {
      type: Array,
      schema: String,
      required: false,
    },
    likesCount: {
      type: Number,
      required: false,
    },
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Create the BlogModel using the defined schema
const BlogModel: ModelType<DbBlogDto> =
  dynamoose.model<DbBlogDto>(
    "Blog",
    BlogSchema
  );

// Export the BlogModel and DbBlogDto
export { BlogModel, DbBlogDto };