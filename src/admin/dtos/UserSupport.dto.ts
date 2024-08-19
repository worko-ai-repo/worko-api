// import dtos
import {RecordListingFilterOptions,RecordListingFilterRequestDTO} from "../../dtos/Common.dto";

// import enums
import { UserSupportContextTypeEnum, UserSupportStatusEnum } from "../../enums/User.enum";

/**
 * ReferralListingFilterOptions
 *
 * It is similar to "UserSupportListingFilterRequestDTO" but it would be used in the backend to perform business logic.
 */
export interface UserSupportListingFilterOptions extends RecordListingFilterOptions {
  // Represents the filter options for querying user support requests..
  // Should be used when filtering user support requests records.
  status?: UserSupportStatusEnum;
  userEmail?: string;
  userSupportType?: string;
  contextType?: UserSupportContextTypeEnum;
  contextId?: string;
  assignedToUserId?: string;
  resolvedbyUserId?: string;
}

/**
 * UserSupportListingFilterRequestDTO
 */
export interface UserSupportListingFilterRequestDTO
  extends RecordListingFilterRequestDTO {
  // Represents the filter request DTO for querying user support requests.
  // Should be used when requesting to filter user support requests records.
  status?: UserSupportStatusEnum;
  userEmail?: string;
  userSupportType?: string;
  contextType?: UserSupportContextTypeEnum;
  contextId?: string;
  assignedToUserId?: string;
  resolvedbyUserId?: string;
}