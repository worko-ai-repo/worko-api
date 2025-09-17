// import dtos
import { RecordListingFilterOptions, RecordListingFilterRequestDTO } from "./Common.dto"
import { Status } from "./Company.dto";

/**
 * CompanyRequestListingFilterOptions
 *
 * It is similar to "CompanyRequestListingFilterRequestDTO" but it would be used in the backend to perform business logic.
 */
export interface CompanyRequestListingFilterOptions extends RecordListingFilterOptions {
  status?: Status;
}

/**
 * CompanyRequestListingFilterRequestDTO
 */
export interface CompanyRequestListingFilterRequestDTO extends RecordListingFilterRequestDTO {
  status?: Status;
}

/**
 * UpdateCompanyRequestDto
 */
export interface UpdateCompanyRequestDto {
  status: Status;
  isDeleted: boolean;
}