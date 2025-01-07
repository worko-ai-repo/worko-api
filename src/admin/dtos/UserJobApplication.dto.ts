
// import dtos
import { RecordListingFilterOptions, RecordListingFilterRequestDTO } from "../../dtos/Common.dto";

// import enums
import { JobApplicationStatus } from "../../enums/UserJobApplication.enum";

/**
 * UserJobApplicationListingFilterOptions
 *
 * It is similar to "UserJobApplicationListingFilterRequestDTO" but `UserJobApplicationListingFilterOptions` would be used in the backend to perform business logic.
 */
export interface UserJobApplicationListingFilterOptions extends RecordListingFilterOptions {
  status?: JobApplicationStatus,
}

/**
 * UserJobApplicationListingFilterRequestDTO
 * 
 * It is similar to "UserJobApplicationListingFilterOptions" but `UserJobApplicationListingFilterRequestDTO` will come from the request payload(From frontend)
 */
export interface UserJobApplicationListingFilterRequestDTO extends RecordListingFilterRequestDTO {
  status?: JobApplicationStatus,
}
