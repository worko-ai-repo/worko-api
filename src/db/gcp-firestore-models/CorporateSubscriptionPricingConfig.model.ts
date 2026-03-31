
// Import firestore packages
import { FieldValue } from "@google-cloud/firestore";

// Import enums
import { CorporateSubscriptionEntityTypeEnum, CorporateSubscriptionPlanTypeEnum } from "../../enums/Common.enum";

// Import models
import { BaseFirestoreModel } from "./Base.model";

interface DbCorporateSubscriptionPricingConfigDto extends BaseFirestoreModel {
  // document id example format: "RECRUITER#QUARTERLY"

  entityType: CorporateSubscriptionEntityTypeEnum;
  planType: CorporateSubscriptionPlanTypeEnum;

  /**
   * Price per entity per month (INR)
   * RECRUITER QUARTERLY → 2000
   * RECRUITER ANNUALLY  → 1500
   * EVALUATOR QUARTERLY → 666.6
   * EVALUATOR ANNUALLY  → 500
   */
  pricePerEntityPerMonth: FieldValue | number;

  /** 3 for QUARTERLY, 12 for ANNUALLY */
  durationMonths: FieldValue | number;
}

export { DbCorporateSubscriptionPricingConfigDto };
