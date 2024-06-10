/**
 * Enum for BillDesk order status.
 * Represents the status of an order in the BillDesk system.
 * Use case: Tracking the status of an order.
 */
export enum BillDeskOrderStatusEnum {
    ACTIVE = "ACTIVE", // Order is active and ready for payment processing
    FAILED = "FAILED" // Order creation failed
}

/**
 * Enum for BillDesk order currency.
 * Represents the currency used for an order.
 * Use case: Specifying the currency for an order.
 */
export enum BillDeskOrderCurrencyEnum {
    INR = 356, // Indian Rupee
}

/**
 * Enum for BillDesk order item code.
 * Represents the item code for an order.
 * Use case: Specifying the item code for an order.
 */
export enum BillDeskOrderItemCodeEnum {
    DIRECT = "DIRECT", // Direct item code
}

/**
 * Enum for BillDesk transaction authorization status.
 * Represents the authorization status of a transaction.
 * Use case: Tracking the authorization status of a transaction.
 */
export enum BillDeskTransactionAuthStatusEnum {
    SUCCESSFUL = "0300", // Transaction authorization successful
    PENDING = "0002", // Transaction authorization pending
    FAILED = "0399", // Transaction authorization failed
}

/**
 * Enum for BillDesk transaction error type.
 * Represents the type of error encountered during a transaction.
 * Use case: Identifying the type of error that occurred during a transaction.
 */
export enum BillDeskTransactionErrorTypeEnum {
    SUCCESS = "success", // Transaction successful
    FAILED = "failed", // Transaction failed
    INVALID_DATA_ERROR = "invalid_data_error", // Invalid data provided
    API_VALIDATION_ERROR = "api_validation_error", // API validation error
    API_PROCESSING_ERROR = "api_processing_error", // API processing error
    API_CONNECTION_ERROR = "api_connection_error", // API connection error
}

/**
 * Enum for BillDesk refund status.
 * Represents the status of a refund.
 * Use case: Tracking the status of a refund.
 */
export enum BillDeskRefundStatusEnum {
    REFUNDED = "0799", // Refund successful
    CANCELLED = "0699", // Refund cancelled
}

/**
 * Enum for BillDesk payment category.
 * Represents the category of payment used for a transaction.
 * Use case: Identifying the payment category used for a transaction.
 */
export enum BillDeskPaymentCategoryEnum {
    NETBANKING = "01", // Netbanking payment
    CREDIT_CARD = "02", // Credit card payment
    DEBIT_CARD = "03", // Debit card payment
    CASHCARD = "04", // Cashcard payment
    WALLET = "05", // Wallet payment
    REWARD_POINTS = "07", // Reward points payment
    UPI_BANK_ACCOUNT = "10", // UPI bank account payment
    BHARAT_QR = "11", // BharatQR payment
    LOAN_EMI = "12", // Loan EMI payment
    NEFT = "13", // NEFT payment
    UPI_CREDIT_CARD = "18", // UPI credit card payment
    NACH = "19", // NACH payment
    CBDC = "20", // CBDC (Central Bank Digital Currency) payment
    UPI_PREPAID_WALLET = "21", // UPI prepaid wallet payment
}