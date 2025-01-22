// import dtos
import { MinMaxRange, RecordListingFilterOptions, RecordListingFilterRequestDTO } from "./Common.dto";

/**
 * CorporateBulkJdCreateApiDto
 * 
 * This dto is comes from the request api
 */
export interface CorporateBulkJdCreateApiDto {
  companyId: string;
  jobDescription: string;
  jobTitle: string;
  jobLocation?: string;
  mustHaveSkills?: string[];
  mustNotHaveSkills?: string[];
  goodToHaveSkills?: string[];
  experienceRange?: MinMaxRange;
}

/**
 * CorporateBulkJdCreateDto
 * 
 * This is an internal dto for backend logic 
 */
export interface CorporateBulkJdCreateDto extends CorporateBulkJdCreateApiDto {
  createdByUserId?: string;
  createdByCorporateUserId?: string;
}

/**
 * CorporateBulkJdFilterOptions
 *
 * It is similar to "CorporateBulkJdFilterRequestDTO" but `CorporateBulkJdFilterOptions` would be used in the backend to perform business logic.
 */
export interface CorporateBulkJdFilterOptions extends RecordListingFilterOptions {
  companyId?: string;
}

/**
 * CorporateBulkJdFilterRequestDTO
 * 
 * It is similar to "CorporateBulkJdFilterOptions" but `CorporateBulkJdFilterRequestDTO` will come from the request payload(From frontend)
 */
export interface CorporateBulkJdFilterRequestDTO extends RecordListingFilterRequestDTO {
  companyId?: string,
}

/**
 * CorporateBulkJdUpdateDto
 */
export interface CorporateBulkJdUpdateDto {
  resumesCount: number;
}