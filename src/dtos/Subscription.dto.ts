/**
 * Represents the data required from the API client to create a new subscription.
 * This is typically the minimal information needed to initiate a subscription,
 * with other details being derived or set by default on the server.
 */
export interface SubscriptionCreateRequestApiDTO {
  masterSubscriptionId: string;
  orderId: string;
}

/**
 * Represents the partial set of data needed to create a new subscription in the system.
 * This includes prtial fields that define a subscription's partial state
 */
export interface SubscriptionCreateRequestDTO {
  status: string;
  orderId: string;
  requestedReferrals: number;
  acceptedReferrals: number;
  completedReferrals: number;
}

/**
 * Represents the complete set of data needed to create a new subscription in the system.
 * This includes all the fields that define a subscription's state, such as its status,
 * various referral counts, and temporal information. Some of this data may be
 * auto-generated or pulled from the master subscription plan.
 */
export interface SubscriptionCreateDTO {
  status: string;
  name: string;
  orderId: string;
  creditedReferrals: number;
  availableReferrals: number;
  requestedReferrals: number;
  acceptedReferrals: number;
  completedReferrals: number;
  expiryDate: Date;
  purchaseDate: Date;
}

/**
 * Represents the subset of fields that can be updated for an existing subscription.
 * This is used when modifying a subscription's state, such as changing its status
 * or updating the counts of various types of referrals. All fields are optional,
 * allowing updates to any combination of these properties.
 */
export interface SubscriptionUpdateDTO {
  status?: string;
  availableReferrals?: number;
  requestedReferrals?: number;
  acceptedReferrals?: number;
  completedReferrals?: number;
}
