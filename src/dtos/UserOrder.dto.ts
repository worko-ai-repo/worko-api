// Load the DTOS
import { BillDeskConfigFrontendDTO, BillDeskOrderCreateResponsePlainDTO, BillDeskTransactionResponseEncryptedDTO, BillDeskTransactionResponseDecryptedDTO } from "./BillDesk.dto";
import { RazorPayConfigFrontendDTO, RazorpayOrderCreateResponsePlainDTO, RazorpayTransactionResponseEncryptedDTO, RazorpayTransactionResponseDecryptedDTO } from './RazorPay.dto';
import { UserOrderProductCreateRequestDTO } from "./UserOrderProduct.dto";

// Load the Enums 
import { UserOrderStatusEnum, UserOrderPaymentGatewayProviderEnum, UserOrderTypeEnum } from "../enums/UserOrder.enum";
import { BillDeskOrderStatusEnum, BillDeskTransactionAuthStatusEnum } from "../enums/BillDesk.enum";
import { RazorpayOrderStatusEnum, RazorpayTransactionStatusEnum } from "../enums/Razorpay.enum";

/**
 * UserOrderCreateRequestDTO
 * 
 * DTO to expect the request body for creating an order for user. (Request)
 */
export interface UserOrderCreateRequestDTO {
  orderId?: string; // Expect the orderId if payment for an order is retried by user in case of after payment failure.
  pgatewayProvider: UserOrderPaymentGatewayProviderEnum; // The payment gateway provider for the order.
  orderType: UserOrderTypeEnum; // The type of the user order.
  returnUrl: string;         // redirect url
  subTotalAmount: number; // The total amount of the products in the order.
  discountAmount: number; // The amount to be discounted from the total.
  gstAmount: number; // The calculation for GST is expected from FE. Whatever is received will be trusted and stored 
  ipAddress: string;  // user ip address. Note: This value is not epxected from the user, it will be populated by application after receiving the request.
  userAgent: string;  // browser client agent. Note: This value is not epxected from the user, it will be populated by application after receiving the request.
  products: UserOrderProductCreateRequestDTO[]; // Array of products in the order. (if orderId is present it is not expected otherwise it will mdntry)
}

/**
 * UserOrderCreateDTO
 * 
 * Data Transfer Object (DTO) for creating a user order. (Internal)
*/
export interface UserOrderCreateDTO {
  userId: string; // The unique identifier of the user placing the order.
  orderType: UserOrderTypeEnum; // The type of the user order.
  status: UserOrderStatusEnum; // The status of the order on the platform.
  pgatewayStatus?: string; // The status of the payment gateway. @todo this should be of type enum
  subTotalAmount: number; // The total amount of the products in the order.
  discountAmount: number; // The amount to be discounted from the total.
  gstAmount: number; //  GST amount on "subTotalAmount - discountAmount" amount.
  finalAmount: number; // Final amount to be charged to the user.
}

/**
 * UserOrderUpdateDTO
 * 
 * Data Transfer Object (DTO) for updating a user order. (Internal)
*/
export interface UserOrderUpdateDTO {
  status?: UserOrderStatusEnum; // The status of the order on the platform.
  pgatewayStatus?:
    | BillDeskOrderStatusEnum
    | RazorpayOrderStatusEnum
    | BillDeskTransactionAuthStatusEnum
    | RazorpayTransactionStatusEnum; // The status of the payment gateway. @todo this should be of type enum; @todo this should be only order status from them.
}

/**
 * UserOrderCreateResponseDTO
 * 
 * DTO to send the response for creating an order for user.
 */
export interface UserOrderCreateResponseDTO {
  pgatewayProvider: UserOrderPaymentGatewayProviderEnum;
  userEmail: string;
  orderId: string;
  orderType: string;
  orderTxnId: string;
  workoPgatewayOrderId: string;
  pgatewayOrderId: string;
  pgatewayConfig: BillDeskConfigFrontendDTO | RazorPayConfigFrontendDTO,
  pgatewayOrderResponse: BillDeskOrderCreateResponsePlainDTO | RazorpayOrderCreateResponsePlainDTO,
}

/**
 * UserOrderProcessGatewayTransactionRequestDTO
 * 
 * DTO for processing the gateway transaction request.
 */
export interface UserOrderProcessGatewayTransactionRequestDTO {
  userId: string; // The unique identifier of the user placing the order.
  orderType: UserOrderTypeEnum; // The type of the user order.
  orderId: string; // Unique identifier of the order.
  orderTxnId: string; // Transaction ID of the order.
  pgatewayProvider: UserOrderPaymentGatewayProviderEnum; // The payment gateway provider for the order.
  pgResponse: BillDeskTransactionResponseEncryptedDTO | RazorpayTransactionResponseEncryptedDTO; // Encrypted payment gateway response.
}

/**
 * UserOrderProcessGatewayTransactionResponseDTO
 * 
 * DTO for processing the gateway transaction response.
 */
export interface UserOrderProcessGatewayTransactionResponseDTO {
  userId: string; // The unique identifier of the user placing the order.
  orderId: string; // Unique identifier of the order.
  orderType: UserOrderTypeEnum; // The type of the user order.
  orderTxnId: string; // Transaction ID of the order.
  pgatewayProvider: UserOrderPaymentGatewayProviderEnum; // The payment gateway provider for the order.
  pgResponseDecrypted: BillDeskTransactionResponseDecryptedDTO | RazorpayTransactionResponseDecryptedDTO; // Decrypted payment gateway response.
}
