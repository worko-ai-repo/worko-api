/**
 * UserSubscriptionStatus
 *
 * Description: Enum representing the status of a user Subscription.
 *
 * @dynamoDBAttribute "User . Detail . Status"
 */
export enum UserSubscriptionStatus {
  // User UserSubscription related status
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  USED = "USED",
}
