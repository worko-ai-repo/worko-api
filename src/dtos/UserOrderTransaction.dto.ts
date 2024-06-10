// Load the enums
import { BillDeskTransactionAuthStatusEnum } from "../enums/BillDesk.enum";
import { RazorpayTransactionStatusEnum } from "../enums/Razorpay.enum";
import { UserOrderPaymentGatewayProviderEnum } from "../enums/UserOrder.enum";

// Load the local DTOS
import {
  BillDeskOrderCreatePlainDTO,
  BillDeskOrderCreateResponsePlainDTO,
  BillDeskTransactionResponseDecryptedDTO,
} from "./BillDesk.dto";
import { RazorpayOrderCreatePlainDTO, RazorpayOrderCreateResponsePlainDTO, RazorpayTransactionResponseDecryptedDTO } from "./RazorPay.dto";

/**
 * UserOrderTransactionCreateDTO
 * 
 * DTO for creating a transaction for a user order.
 */
export interface UserOrderTransactionCreateDTO {
  orderId: string; // The Work Order ID for the transaction.
  pgatewayProvider: UserOrderPaymentGatewayProviderEnum; // The payment gateway provider for the order.
  subTotalAmount: number; // The total amount of the product.
  discountAmount: number; // The amount to be discounted.
  gstAmount: number; // GST amount on "subTotalAmount - discountAmount".
  finalAmount: number; // Final amount for which the user should be charged. (subTotalAmount - discountAmount + gstAmount)
  userIpAddress: string; // User's IP address.
  userAgent: string; // User's User Agent string.
}

/**
 * UserOrderTransactionUpdateDTO
 * 
 * DTO for updating a transaction for a user order.
 * @todo Update this with the fields which are being updated after processing the payment gateway response.
 */
export interface UserOrderTransactionUpdateDTO {
  pgatewayOrderId?: string; // The Order ID created at the payment gateway's end for the order & transaction.
  pgatewayOrderRequest?: BillDeskOrderCreatePlainDTO | RazorpayOrderCreatePlainDTO; // Request sent to the payment gateway.
  pgatewayOrderResponse?: BillDeskOrderCreateResponsePlainDTO | RazorpayOrderCreateResponsePlainDTO; // Response received from the payment gateway.
  pgatewayTxnResponse?: BillDeskTransactionResponseDecryptedDTO | RazorpayTransactionResponseDecryptedDTO; // Decrypted transaction response from the payment gateway.
  pgatewayTxnStatus?: BillDeskTransactionAuthStatusEnum | RazorpayTransactionStatusEnum;// Status of the transaction.
  pgatewayTxnId?: string; // Transaction ID assigned by the payment gateway.
  pgatewayTxnPaymentMethodType?: string; // Type of payment method used in the transaction.
  pgatewayTxnErrorType?: string; // Type of error occurred in the transaction.
  pgatewayTxnErrorCode?: string; // Error code returned by the payment gateway.
  pgatewayTxnErrorDesc?: string; // Description of the error occurred in the transaction.
}
