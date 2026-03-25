// Import required modules
import Razorpay from "razorpay"; // Razorpay Node.js SDK (https://razorpay.com/docs/payment-gateway/server-integration/nodejs/server/)
import crypto from "crypto"; // Node.js built-in crypto module for creating and verifying signatures

// Import enums and DTOs (Data Transfer Objects)
import { UserOrderPaymentGatewayProviderEnum } from "../enums/UserOrder.enum"; // Enum for payment gateway providers
import {
  UserOrderProcessGatewayTransactionResponseDTO,
  UserOrderCreateRequestDTO,
  UserOrderCreateResponseDTO,
  UserOrderProcessGatewayTransactionRequestDTO,
} from "../dtos/UserOrder.dto"; // DTOs for User Order
import { DbUserOrderTransactionDto } from "../db/models/UserOrderTransaction.model"; // Database model for User Order Transactions
import {
  RazorpayOrderCreatePlainDTO,
  RazorpayOrderCreateResponsePlainDTO,
  RazorpayTransactionResponseEncryptedDTO,
  RazorpayTransactionResponseDecryptedDTO,
} from "../dtos/RazorPay.dto"; // DTOs for Razorpay integration
import { DbUserOrderDto } from "../db/models/UserOrder.model"; // Database model for User Orders
import {
  RazorpayOrderCurrencyEnum,
  RazorpayPaymentMethodEnum,
  RazorpayTransactionStatusEnum,
} from "../enums/Razorpay.enum"; // Enums for Razorpay

/**
 * Integrate Node.js-based website with Razorpay SDK to start accepting payments using the Razorpay Payment Gateway.
 * @see https://razorpay.com/docs/payments/server-integration/nodejs/integration-steps/
 * 
 * Subscriptions APIs
 * @see https://razorpay.com/docs/api/payments/subscriptions/#plans
 * 
 * Integrate Razorpay Subscription in react.js and node.js
 * @see https://abhishek-gupta.medium.com/integrate-razorpay-subscription-in-react-js-and-node-js-9109e33bae1a
 */
class RazorpayLibrary {
  private razorpayInstance!: Razorpay;

  constructor() {
    // Initialize the Razorpay instance with the API key and secret from environment variables
    // https://razorpay.com/docs/payment-gateway/server-integration/nodejs/server/#11-initialize-razorpay-instance
    this.razorpayInstance = new Razorpay({
      key_id: process.env.APP_RAZORPAY_KEY_ID as string,
      key_secret: process.env.APP_RAZORPAY_KEY_SECRET as string,
    });
  }

  /**
   * Create a new order in Razorpay
   * @param userEmail - Email of the user placing the order
   * @param userOrderRequestBody - Order details from the user request
   * @param workoOrderDetails - Database record of the user order
   * @param workoOrderTransactionDetails - Database record of the user order transaction
   * @param returnUrl - URL to which the user will be redirected after payment
   * @returns A promise that resolves to an object containing user order response and Razorpay order request details
   *
   * This method creates a new order in Razorpay using the Razorpay Orders API
   * (https://razorpay.com/docs/api/orders/)
   */
  async createOrder(
    userEmail: string,
    userOrderRequestBody: UserOrderCreateRequestDTO,
    workoOrderDetails: DbUserOrderDto,
    workoOrderTransactionDetails: DbUserOrderTransactionDto,
    returnUrl: string
  ): Promise<{
    userOrderResponse: UserOrderCreateResponseDTO;
    gatewayOrderRequestPlainBody: RazorpayOrderCreatePlainDTO;
  }> {
    try {
      // Prepare the order details to create an order in Razorpay
      // https://razorpay.com/docs/api/orders/#create-order
      const orderCreateRequest: RazorpayOrderCreatePlainDTO = {
        amount:
          parseInt(workoOrderTransactionDetails.finalAmount.toFixed(2)) * 100, // Convert amount to paise
        currency: RazorpayOrderCurrencyEnum.INR, // Set currency to INR
        payment_capture: 1, // Auto capture payment
        notes: {
          userEmail: userEmail, // user email
          userId: workoOrderDetails.userId, // user id
          orderId: workoOrderDetails.id, // worko order id
          orderType: workoOrderDetails.orderType, // worko order type
          transactionId: workoOrderTransactionDetails.id, // worko order transaction id
        },
      };

      // Create an order in Razorpay
      const razorpayOrderResponse: RazorpayOrderCreateResponsePlainDTO =
        (await this.razorpayInstance.orders.create(
          orderCreateRequest
        )) as RazorpayOrderCreateResponsePlainDTO;
      console.log("razorpayOrderResponse is ", razorpayOrderResponse);

      // Prepare the response to be sent back to the user
      let userOrderResponse: UserOrderCreateResponseDTO = {
        pgatewayProvider: workoOrderTransactionDetails.pgatewayProvider,
        userEmail: userEmail,
        orderId: workoOrderDetails.id,
        orderType: workoOrderDetails.orderType,
        orderTxnId: workoOrderTransactionDetails.id,
        workoPgatewayOrderId: workoOrderTransactionDetails.workoPgatewayOrderId,
        pgatewayOrderId: razorpayOrderResponse.id,
        pgatewayConfig: {}, // @todo ensure to pass the needed credentials here, ask frotnend to use it, and rmeove the local hard code.
        pgatewayOrderResponse: razorpayOrderResponse,
      };
      return {
        userOrderResponse: userOrderResponse,
        gatewayOrderRequestPlainBody: orderCreateRequest,
      };
    } catch (error) {
      // Log the error and rethrow it
      global.logger.error("Error creating Razorpay order:", error);
      throw error;
    }
  }

  /**
   * Process the response from the payment gateway after a transaction
   * @param userEmail - Email of the user who placed the order
   * @param orderDetails - Database record of the user order
   * @param orderTxnDetails - Database record of the user order transaction
   * @param workoOrderTransactionDetails - Transaction details from the payment gateway response
   * @returns A promise that resolves to the user order transaction response
   *
   * This method processes the response from the payment gateway after a transaction
   * and verifies the payment signature using the Razorpay Payment Signature Validation API
   * (https://razorpay.com/docs/api/payments/#payment-signature-validation)
   */
  async processGatewayTransactionResponse(
    userEmail: string,
    orderDetails: DbUserOrderDto,
    orderTxnDetails: DbUserOrderTransactionDto,
    workoOrderTransactionDetails: UserOrderProcessGatewayTransactionRequestDTO
  ): Promise<any> {
    // Log the start of the process
    global.logger.info("[RazorpayLibrary] processGatewayTransactionResponse");

    const { orderId, orderTxnId, pgResponse } = workoOrderTransactionDetails;
    const razorpayRequestBody =
      pgResponse as RazorpayTransactionResponseEncryptedDTO;

    // Verify the payment signature
    const isSignatureValid = this.verifyPaymentSignature(
      razorpayRequestBody.razorpay_order_id,
      razorpayRequestBody.razorpay_payment_id,
      razorpayRequestBody.razorpay_signature,
      process.env.APP_RAZORPAY_KEY_SECRET as string
    );
    console.log("isSignatureValid", isSignatureValid);

    if (isSignatureValid) {
      // Log that the payment signature is valid and fetch payment details
      global.logger.info(
        "[Payment Signature Valid] [Fetching Payment Details]"
      );

      // Fetch payment details from Razorpay
      // https://razorpay.com/docs/api/payments/#fetch-payment
      const paymentDetails = (await this.razorpayInstance.payments.fetch(
        razorpayRequestBody.razorpay_payment_id
      )) as RazorpayTransactionResponseDecryptedDTO;

      // Map the payment details to the response DTO to be sent to the frontend
      let userOrderTransactionResponse: UserOrderProcessGatewayTransactionResponseDTO =
        {
          userId: orderDetails.userId,
          orderId: orderDetails.id,
          orderType: orderDetails.orderType,
          orderTxnId: orderTxnDetails.id,
          pgatewayProvider: workoOrderTransactionDetails.pgatewayProvider,
          pgResponseDecrypted: {
            ...paymentDetails,
            status: paymentDetails.status as RazorpayTransactionStatusEnum,
            method: paymentDetails.method as RazorpayPaymentMethodEnum,
          },
        };
      return userOrderTransactionResponse;
    } else {
      throw new Error("Invalid payment signature");
    }
  }

  /**
   * Verify the payment signature sent by Razorpay
   * @param orderId - The order ID sent by Razorpay
   * @param paymentId - The payment ID sent by Razorpay
   * @param signature - The signature sent by Razorpay
   * @param secret - The secret key used to verify the signature
   * @returns A boolean indicating whether the signature is valid or not
   *
   * This method verifies the payment signature using the Razorpay Payment Signature Validation API
   * (https://razorpay.com/docs/api/payments/#payment-signature-validation)
   */
  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string,
    secret: string
  ): boolean {
    const data = `${orderId}|${paymentId}`; // Concatenate order ID and payment ID
    const hmac = crypto.createHmac("sha256", secret); // Create HMAC using sha256 and secret key
    hmac.update(data); // Update HMAC with the data
    const digest = hmac.digest("hex"); // Generate the HMAC digest
    return digest === signature; // Compare the generated digest with the provided signature
  }
}

// Export an instance of the RazorpayLibrary class
export default new RazorpayLibrary();
