
// Import dtos
import { GcpFirestoreRecordListingFilterOptions, GcpFirestoreRecordListingFilterRequestDTO } from "./Common.gcp-firestore.dto";

// Import enums
import { CorporateSubscriptionEntityTypeEnum, CorporateSubscriptionPlanTypeEnum } from "../enums/Common.enum";

export interface CorporateSubscriptionPricingConfigCreateApiDto {
  entityType: CorporateSubscriptionEntityTypeEnum;
  planType: CorporateSubscriptionPlanTypeEnum;
  pricePerEntityPerMonth: number;
}

export interface CorporateSubscriptionPricingConfigListingFilterRequestDTO extends GcpFirestoreRecordListingFilterRequestDTO {

}

export interface CorporateSubscriptionPricingConfigListingFilterOptions extends GcpFirestoreRecordListingFilterOptions {

}
