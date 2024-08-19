// import dtos
import { RecordListingFilterOptions, RecordListingFilterRequestDTO } from "../../dtos/Common.dto";

// import enums
import { UserSubscriptionStatus } from "../../enums/UserSubscription.enum";

/**
 * SubscriptionListingFilterOptions
 *
 * It is similar to "SubscriptionListingFilterRequestDTO" but it would be used in the backend to perform business logic.
 */
export interface SubscriptionListingFilterOptions extends RecordListingFilterOptions {
  // Represents the filter options for querying subscriptions.
  // Should be used when filtering subscription records.
  status?: UserSubscriptionStatus;
}

/**
 * SubscriptionListingFilterRequestDTO
 */
export interface SubscriptionListingFilterRequestDTO extends RecordListingFilterRequestDTO {
  // Represents the filter request DTO for querying subscriptions.
  // Should be used when requesting to filter subscription records.
  status?: UserSubscriptionStatus;
}