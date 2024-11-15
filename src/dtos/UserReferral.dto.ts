// import dtos
import {
  RecordListingFilterOptions,
  RecordListingFilterRequestDTO,
} from "../dtos/Common.dto";

// import enums
import { ReferralStatus } from "../enums/UserReferral.enum";

// @todo : Differentiate below api dtos
export interface UserReferralDTO {
  status: string;
  companyId: string;
  jobUrl: string;
  jdExtracted?: string;
  matchingScore: number;
  userSubscriptionId: string;
  passedByUserIds?: Array<{ userId: string; actionDate: Date }>;
  rejectedByUserIds?: Array<{ userId: string; actionDate: Date; reason: string; userComment: string }>;
  acceptedByUserId?: string;
  doneByUserId?: string;
  acceptedAtByUser?: Date;
  doneByEmployee?: Date;
  doneByCandidate?: Date;
  withdrawnByUser?: UserReferralStatusChangeByCandDTO;
  GSI1PK: string;
  GSI1SK: string;
}

// Dto for WithdrawnByUser
export interface UserReferralStatusChangeByCandDTO {
  actionDate: Date;
  reason: string;
  userComment?: string;
}

/**
 * ReferralStatusListingFilterOptions
 *
 * It is similar to "ReferralStatusListingFilterRequestDTO" but it would be used in the backend to perform business logic.
 */
export interface ReferralStatusListingFilterOptions extends RecordListingFilterOptions {
  // Represents the filter options for querying referrals.
  // Should be used when filtering referrals records.
  status?: ReferralStatus;
}

/**
 * ReferralStatusListingFilterRequestDTO
 * 
 * It is similar to "ReferralStatusListingFilterOptions" but it will come from the request payload(From frontend)
 */
export interface ReferralStatusListingFilterRequestDTO extends RecordListingFilterRequestDTO {
  // Represents the filter request DTO for querying referrals.
  // Should be used when requesting to filter referrals records.
  status?: ReferralStatus;
}

/**
 * EmpReferralListingFilterOptions
 *
 * It is similar to "EmpReferralListingFilterRequestDTO" but it would be used in the backend to perform business logic.
 */
export interface EmpReferralListingFilterOptions extends RecordListingFilterOptions {
  // Represents the filter options for querying referrals.
  // Should be used when filtering referrals records.
  status: ReferralStatus;
  companyId: string;
}

/**
 * EmpReferralListingFilterRequestDTO
 * 
 * It is similar to "EmpReferralListingFilterOptions" but it will come from the request payload(From frontend)
 */
export interface EmpReferralListingFilterRequestDTO extends RecordListingFilterRequestDTO {
  // Represents the filter request DTO for querying referrals.
  // Should be used when requesting to filter referrals records.
  status: ReferralStatus;
  companyId: string;
}
