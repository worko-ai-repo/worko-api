/**
 * Enum for user order status.
 *
 * This enum represents the different statuses that a user order can have throughout its lifecycle.
 * The order status is updated based on the progress of the order and the responses received from
 * the payment gateway.
 */
export enum UserOrderStatusEnum {
  PLACED = "PLACED", // Order is initially placed by the user
  INITIATED = "INITIATED", // Order is initiated with the payment gateway after the initial request
  PENDING = "PENDING", // Order is pending payment confirmation from the payment gateway
  COMPLETED = "COMPLETED", // Order is successfully completed after receiving payment confirmation
  FAILED = "FAILED", // Order failed due to an error or payment failure
}

/**
 * Enum for user order type.
 *
 * This enum represents the different types of orders that a user can place.
 */
export enum UserOrderTypeEnum {
  SUBSCRIPTION = "SUBS", // Order is for a subscription-based service
  SERVICE = "SRVC", // Order is for a one-time service
}

/**
 * Enum for user order payment gateway provider.
 *
 * This enum represents the different payment gateway providers that can be used for processing
 * user orders.
 */
export enum UserOrderPaymentGatewayProviderEnum {
  BILL_DESK = "BILL_DESK", // BillDesk payment gateway provider
  RAZORPAY = "RAZORPAY", // Razorpay payment gateway provider
}