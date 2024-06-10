/**
 * Enum for Razorpay order status.
 * @see https://razorpay.com/docs/api/orders/#order-status
 */
export enum RazorpayOrderStatusEnum {
  CREATED = "created", // The order has been created but payment is not initiated.
  ATTEMPTED = "attempted", // Payment has been attempted but not completed.
  PAID = "paid", // The order has been successfully paid.
  FAILED = "failed", // Payment for the order has failed.
}

/**
 * Enum for Razorpay order currency.
 * @see https://razorpay.com/docs/api/payments/#currency-support
 */
export enum RazorpayOrderCurrencyEnum {
  INR = "INR", // Indian Rupee.
}

/**
 * Enum for Razorpay payment method.
 * @see https://razorpay.com/docs/api/payments/#payment-methods
 */
export enum RazorpayPaymentMethodEnum {
  CARD = "card", // Payment made using a credit or debit card.
  NB = "nb", // Payment made using netbanking.
  UPI = "upi", // Payment made using Unified Payments Interface (UPI).
  WALLET = "wallet", // Payment made using a digital wallet.
  EMI = "emi", // Payment made using Equated Monthly Installments (EMI).
  PAYLATER = "paylater", // Payment made using the Pay Later option.
  NETBANKING = "netbanking", // Payment made using netbanking (same as NB).
  QRCODE = "qrcode", // Payment made using a QR code.
  UPI_QR = "upi_qr", // Payment made using a UPI QR code.
}

/**
 * Enum for Razorpay transaction status.
 * @see https://razorpay.com/docs/api/payments/#payment-status
 */
export enum RazorpayTransactionStatusEnum {
  CREATED = "created", // The payment has been created but not completed.
  AUTHORIZED = "authorized", // The payment has been authorized but not captured.
  CAPTURED = "captured", // The payment has been successfully captured.
  FAILED = "failed", // The payment has failed.
}

/**
 * Enum for Razorpay refund status.
 * @see https://razorpay.com/docs/api/refunds/#refund-status
 */
export enum RazorpayRefundStatusEnum {
  FULL = "full", // The refund amount is equal to the payment amount.
  PARTIAL = "partial", // The refund amount is less than the payment amount.
}

/**
 * Enum for Razorpay refund creation status.
 * @see https://razorpay.com/docs/api/refunds/#create-refund
 */
export enum RazorpayCreateRefundStatusEnum {
  PENDING = "pending", // The refund is pending and not yet processed.
  PROCESSED = "processed", // The refund has been successfully processed.
  FAILED = "failed", // The refund has failed.
}
