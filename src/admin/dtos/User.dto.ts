// import dtos
import {
  RecordListingFilterOptions,
  RecordListingFilterRequestDTO,
} from "../../dtos/Common.dto";

// import enums
import { UserType } from "../../enums/User.enum"

/**
 * UsersListingFilterOptions
 *
 * It is similar to "UsersListingFilterRequestDTO" but it would be used in the backend to perform business logic.
 */
export interface UsersListingFilterOptions extends RecordListingFilterOptions {
  // Represents the filter options for querying users.
  // Should be used when filtering users records.
  userType?: UserType;
}

/**
 * UsersListingFilterRequestDTO
 */
export interface UsersListingFilterRequestDTO extends RecordListingFilterRequestDTO {
  // Represents the filter request DTO for querying users.
  // Should be used when requesting to filter users records.
  userType?: UserType;
}
