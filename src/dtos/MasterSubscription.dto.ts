// Define a common interface for shared properties
export interface SubscriptionBaseDTO {
  name: string;
  amount: number;
  duration: number;
  referralCount: number;
  isActive: boolean;
  details: string;
}

// Extend the common interface in MasterSubscriptionDTO
export interface MasterSubscriptionDTO extends SubscriptionBaseDTO {}

// Extend the common interface in SubscriptionPlanResponseDTO
export interface SubscriptionPlanResponseDTO extends SubscriptionBaseDTO {
  SK: string;
}

export interface SubscriptionPlanDetailDTO {
  duration: number;
  referralCount: number;
  amount: number;
}
