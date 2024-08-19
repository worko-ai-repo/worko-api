// import dtos
import {
  RecordListingFilterOptions,
  RecordListingFilterRequestDTO,
} from "../../dtos/Common.dto";

// import enums
import { ReferralStatus } from "../../enums/UserReferral.enum";

/**
 * ReferralListingFilterOptions
 *
 * It is similar to "ReferralListingFilterRequestDTO" but it would be used in the backend to perform business logic.
 */
export interface ReferralListingFilterOptions extends RecordListingFilterOptions {
  // Represents the filter options for querying referrals.
  // Should be used when filtering referrals records.
  status?: ReferralStatus;
}

/**
 * ReferralListingFilterRequestDTO
 */
export interface ReferralListingFilterRequestDTO extends RecordListingFilterRequestDTO {
  // Represents the filter request DTO for querying referrals.
  // Should be used when requesting to filter referrals records.
  status?: ReferralStatus;
}
