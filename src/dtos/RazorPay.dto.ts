// Import enums
import {
  RazorpayOrderCurrencyEnum,
  RazorpayOrderStatusEnum,
  RazorpayPaymentMethodEnum,
  RazorpayRefundStatusEnum,
  RazorpayTransactionStatusEnum,
} from "../enums/Razorpay.enum";

/**
 * Interface for Razorpay configuration on the frontend.
 * @todo Add key ID and request frontend to use it to trigger the SDK.
 * @see https://razorpay.com/docs/payments/server-integration/nodejs/payment-gateway/build-integration/#step-2-create-an-order-on-the-server
 */
export interface RazorPayConfigFrontendDTO {
  // @todo add key id and request frontend to use it to trigger the SDK.
}

/**
 * Interface for creating a Razorpay order.
 * @see https://razorpay.com/docs/api/orders/#create-an-order
 */
export interface RazorpayOrderCreatePlainDTO {
  amount: number; // The amount to be paid in the smallest currency unit (e.g., paise for INR).
  currency: RazorpayOrderCurrencyEnum; // The currency of the order.
  receipt?: string; // A unique identifier for the order.
  payment_capture?: number; // Indicates whether the payment should be captured automatically (1) or not (0).
  notes?: { [key: string]: string }; // Key-value pair that can be used to store additional information about the order.
}

/**
 * Interface for the response received when creating a Razorpay order.
 * @see https://razorpay.com/docs/api/orders/#create-an-order
 */
export interface RazorpayOrderCreateResponsePlainDTO {
  id: string; // The unique identifier of the order.
  entity: string; // The type of the entity (usually "order").
  amount: number; // The amount of the order in the smallest currency unit.
  amount_paid: number; // The amount paid against the order in the smallest currency unit.
  amount_due: number; // The amount due against the order in the smallest currency unit.
  currency: RazorpayOrderCurrencyEnum; // The currency of the order.
  receipt: string; // A unique identifier for the order provided by the merchant.
  offer_id: string; // The unique identifier of the offer linked to the order (if any).
  status: RazorpayOrderStatusEnum; // The status of the order.
  attempts: number; // The number of payment attempts made on the order.
  notes: { [key: string]: string }; // Key-value pair that can be used to store additional information about the order.
  created_at: number; // The timestamp when the order was created.
}

/**
 * Interface for the encrypted transaction response received from Razorpay.
 * @see https://razorpay.com/docs/payment-gateway/web-integration/standard/#step-4-handle-the-response
 */
export interface RazorpayTransactionResponseEncryptedDTO {
  razorpay_order_id: string; // The unique identifier of the order.
  razorpay_payment_id: string; // The unique identifier of the payment.
  razorpay_signature: string; // The signature to be used for verification.
  status_code: number; // The status retruned by razorpay on transction response
}

/**
 * Interface for the decrypted transaction response received from Razorpay.
 * @see https://razorpay.com/docs/api/payments/#payment-entity
 */
export interface RazorpayTransactionResponseDecryptedDTO {
  id: string; // The unique identifier of the payment.
  entity: string; // The type of the entity (usually "payment").
  amount: number; // The amount paid in the smallest currency unit (e.g., paise for INR).
  currency: RazorpayOrderCurrencyEnum; // The currency of the payment.
  status: RazorpayTransactionStatusEnum; // The status of the payment (e.g., "created", "authorized", "captured", "failed", etc.).
  order_id: string; // The unique identifier of the order associated with the payment.
  invoice_id: string; // The unique identifier of the invoice associated with the payment (if any).
  international: boolean; // Whether the payment was made internationally.
  method: RazorpayPaymentMethodEnum; // The payment method used (e.g., "card", "netbanking", "wallet", etc.).
  amount_refunded: number; // The amount refunded to the customer (if any).
  refund_status: RazorpayRefundStatusEnum; // The status of the refund (if any).
  captured: boolean; // Whether the payment has been captured or not.
  description: string; // The description of the payment.
  card_id: string; // The unique identifier of the card used for the payment (if any).
  bank: string; // The name of the bank associated with the payment (if any).
  wallet: string; // The name of the wallet used for the payment (if any).
  vpa: string; // The Virtual Payment Address used for the payment (if any).
  email: string; // The email address of the customer.
  contact: string; // The contact number of the customer.
  notes: { [key: string]: string }; // Additional notes associated with the payment.
  fee: number; // The fee charged by Razorpay for the payment (if any).
  tax: number; // The tax amount charged for the payment (if any).
  error_code: string; // The error code associated with the payment (if any).
  error_description: string; // The error description associated with the payment (if any).
  error_source: string; // The error source associated with the payment (if any).
  error_step: string; // The error step associated with the payment (if any).
  error_reason: string; // The error reason associated with the payment (if any).
  acquirer_data: AcquirerDataDTO; // Acquirer data related to the payment.
  created_at: number; // The timestamp when the payment was created.
}

/**
 * Interface for the acquirer data related to a payment.
 * @see https://razorpay.com/docs/api/payments/#acquirer-data
 */
export interface AcquirerDataDTO {
  bank_transaction_id: string; // The bank transaction ID.
}
