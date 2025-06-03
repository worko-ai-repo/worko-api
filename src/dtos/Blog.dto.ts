// import dtos
import {
  RecordListingFilterOptions,
  RecordListingFilterRequestDTO,
} from "./Common.dto";

// Import enums
import { BlogStatusEnum } from "../enums/Blog.enum";

/**
 * BlogCreateApiDto
 */
export interface BlogCreateApiDto {
  title: string;
  basicDescription: string;
  detailedDescription: string;
  htmlDetailedDescription: string;
  status: BlogStatusEnum;
  tags?: string[];
}

/**
 * BlogCreateDto
 */
export interface BlogCreateDto extends BlogCreateApiDto {
  createdByUserId: string;
}

/**
 * BlogFilterOptions
 */
export interface BlogFilterOptions extends RecordListingFilterOptions {
  title?: string;
  status?: BlogStatusEnum;
}

/**
 * BlogListingFilterRequestDTO
 */
export interface BlogListingFilterRequestDTO extends RecordListingFilterRequestDTO {
  title?: string;
  status?: BlogStatusEnum;
}

/**
 * BlogUpdateApiDto
 */
export interface BlogUpdateApiDto {
  title?: string;
  basicDescription?: string;
  detailedDescription?: string;
  htmlDetailedDescription?: string;
  status?: BlogStatusEnum;
  tags?: string[];

  /**
   * cloudBlogName
   *
   * @description The name of the blog image which is stored in `aws s3` bucket
   * @example `01JEP2QCMEX23YPSNBDW0QK8CY.jpg`
   */
  cloudBlogCoverImageName?: string;
}

/**
 * BlogUpdateDto
 */
export interface BlogUpdateDto extends BlogUpdateApiDto {
  updatedByUserId: string;
}