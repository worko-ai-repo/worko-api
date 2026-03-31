
import { CorporateSubscriptionEntityTypeEnum, CorporateSubscriptionPlanTypeEnum } from "../enums/Common.enum";

export interface CorporateSubscriptionPricingConfigCreateApiDto {
  entityType: CorporateSubscriptionEntityTypeEnum;
  planType: CorporateSubscriptionPlanTypeEnum;
  pricePerEntityPerMonth: number;
}