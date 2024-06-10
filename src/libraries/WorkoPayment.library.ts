// Import  models 
import { DbUserOrderDto } from "../db/models/UserOrder.model";
import { DbUserOrderTransactionDto } from "../db/models/UserOrderTransaction.model";

// Import Data Transfer Objects (DTOs) 
import {
  BillDeskOrderCreatePlainDTO,
  BillDeskTransactionResponseDecryptedDTO,
} from "../dtos/BillDesk.dto";
import { RazorpayOrderCreatePlainDTO } from "../dtos/RazorPay.dto";

// Import DTOs 
import {
  UserOrderProcessGatewayTransactionResponseDTO,
  UserOrderCreateRequestDTO,
  UserOrderCreateResponseDTO,
  UserOrderProcessGatewayTransactionRequestDTO,
} from "../dtos/UserOrder.dto";

// Import enums 
import { UserOrderPaymentGatewayProviderEnum } from "../enums/UserOrder.enum";

// Import Billdesk and Razorpay library classes
import BilldeskLibrary from "./BillDeskPayment.library";
import RazorpayLibrary from "./RazorpayPayment.library";

class WorkoPaymentLibrary {
  /**
   * createOrder
   * Creates an order in the specified payment gateway (BillDesk or Razorpay)
   * @param userEmail - Email of the user placing the order
   * @param userOrderRequestBody - Order details from the user request
   * @param workoOrderDetails - Database record of the user order
   * @param workoOrderTransactionDetails - Database record of the user order transaction
   * @param returnUrl - URL to which the user will be redirected after payment
   * @returns A promise that resolves to an object containing user order response and payment gateway order request details
   */
  createOrder = async (
    userEmail: string,
    userOrderRequestBody: UserOrderCreateRequestDTO,
    workoOrderDetails: DbUserOrderDto,
    workoOrderTransactionDetails: DbUserOrderTransactionDto,
    returnUrl: string
  ): Promise<{
    userOrderResponse: UserOrderCreateResponseDTO;
    gatewayOrderRequestPlainBody:
    | BillDeskOrderCreatePlainDTO
    | RazorpayOrderCreatePlainDTO;
  }> => {
    if (
      workoOrderTransactionDetails.pgatewayProvider ===
      UserOrderPaymentGatewayProviderEnum.BILL_DESK
    ) {
      // Create order using BillDesk payment gateway
      return BilldeskLibrary.createOrder(
        userEmail,
        userOrderRequestBody,
        workoOrderDetails,
        workoOrderTransactionDetails,
        returnUrl
      );
    } else if (
      workoOrderTransactionDetails.pgatewayProvider ===
      UserOrderPaymentGatewayProviderEnum.RAZORPAY
    ) {
      // Create order using Razorpay payment gateway
      return RazorpayLibrary.createOrder(
        userEmail,
        userOrderRequestBody,
        workoOrderDetails,
        workoOrderTransactionDetails,
        returnUrl
      );
    } else {
      // Throw error if payment gateway provider is invalid
      throw new Error("Invalid payment gateway provider");
    }
  };

  /**
   * processGatewayTransactionResponse
   * 
   * Processes the response from the payment gateway after a transaction
   * @param userEmail - Email of the user who placed the order
   * @param orderDetails - Database record of the user order
   * @param orderTxnDetails - Database record of the user order transaction
   * @param workoOrderTransactionDetails - Transaction details from the payment gateway response
   * @returns A promise that resolves to the user order transaction response
   */
  processGatewayTransactionResponse = async (
    userEmail: string,
    orderDetails: DbUserOrderDto,
    orderTxnDetails: DbUserOrderTransactionDto,
    workoOrderTransactionDetails: UserOrderProcessGatewayTransactionRequestDTO
  ): Promise<UserOrderProcessGatewayTransactionResponseDTO> => {
    if (
      workoOrderTransactionDetails.pgatewayProvider ===
      UserOrderPaymentGatewayProviderEnum.BILL_DESK
    ) {
      // Log and process the BillDesk transaction response
      global.logger.info("Processing BillDesk response");
      return BilldeskLibrary.processGatewayTransactionResponse(
        userEmail,
        orderDetails,
        orderTxnDetails,
        workoOrderTransactionDetails
      );
    } else if (
      workoOrderTransactionDetails.pgatewayProvider ===
      UserOrderPaymentGatewayProviderEnum.RAZORPAY
    ) {
      // Log and process the Razorpay transaction response
      global.logger.info("Processing RAZORPAY response");
      return RazorpayLibrary.processGatewayTransactionResponse(
        userEmail,
        orderDetails,
        orderTxnDetails,
        workoOrderTransactionDetails
      );
    } else {
      // Throw error if payment gateway provider is invalid
      throw new Error("Invalid payment gateway provider");
    }
  };
}

// Export an instance of the WorkoPaymentLibrary class
const workoPaymentLibrary = new WorkoPaymentLibrary();
export { workoPaymentLibrary, WorkoPaymentLibrary };
