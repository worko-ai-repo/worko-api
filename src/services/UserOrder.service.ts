// Load the local Daos
import userOrderDao from "../daos/UserOrder.dao";
import userOrderTransactionDao from "../daos/UserOrderTransaction.dao";

// Load the local DTOs
import {
  UserOrderTransactionCreateDTO,
  UserOrderTransactionUpdateDTO,
} from "../dtos/UserOrderTransaction.dto";
import {
  UserOrderCreateDTO,
  UserOrderCreateRequestDTO,
  UserOrderCreateResponseDTO,
  UserOrderProcessGatewayTransactionRequestDTO,
  UserOrderProcessGatewayTransactionResponseDTO,
  UserOrderUpdateDTO,
} from "../dtos/UserOrder.dto";
import {
  BillDeskOrderCreatePlainDTO,
  BillDeskOrderCreateResponsePlainDTO,
  BillDeskTransactionResponseDecryptedDTO,
} from "../dtos/BillDesk.dto";
import {
  RazorpayOrderCreatePlainDTO,
  RazorpayOrderCreateResponsePlainDTO,
  RazorpayTransactionResponseDecryptedDTO,
} from "../dtos/RazorPay.dto";

// Load the enums
import {
  UserOrderPaymentGatewayProviderEnum,
  UserOrderStatusEnum,
} from "../enums/UserOrder.enum";
import {
  BillDeskOrderStatusEnum,
  BillDeskTransactionAuthStatusEnum,
} from "../enums/BillDesk.enum";
import {
  RazorpayOrderStatusEnum,
  RazorpayTransactionStatusEnum,
} from "../enums/Razorpay.enum";

// Load the services
import { userOrderProductServiceObj } from "./UserOrderProduct.service";
import UserOrderTransactionService from "./UserOrderTransaction.service";
import UserDetailService from "./UserDetail.service";

// Import libraries
import { workoPaymentLibrary } from "../libraries/WorkoPayment.library";

// Import Models
import { DbUserOrderDto } from "../db/models/UserOrder.model";
import { DbUserOrderTransactionDto } from "../db/models/UserOrderTransaction.model";
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

/**
 * UserOrderService
 *
 * Service class for handling user orders.
 * This class provides methods for creating, retrieving, and updating user orders,
 * as well as processing payment gateway transactions.
 */
class UserOrderService {
  /**
   * createOrder
   *
   * This function creates a new order for the given user.
   *
   * @param {string} userId - The unique identifier of the user creating the order.
   * @param {UserOrderCreateRequestDTO} userOrderRequestBody - The request body containing order details.
   * @returns {Promise<{userOrderResponse: UserOrderCreateResponseDTO, gatewayOrderRequestPlainBody: BillDeskOrderCreatePlainDTO | RazorpayOrderCreatePlainDTO}>} - A Promise containing the created order response and the plain request body for the payment gateway.
   */
  async createOrder(
    userId: string,
    userOrderRequestBody: UserOrderCreateRequestDTO
  ): Promise<{
    userOrderResponse: UserOrderCreateResponseDTO;
    gatewayOrderRequestPlainBody:
    | BillDeskOrderCreatePlainDTO
    | RazorpayOrderCreatePlainDTO;
  }> {
    // ===========================================================================================
    //  Create Order and Order Products in the Worko Database
    // ===========================================================================================

    // Prepare the DTO for creating the order in the Worko database
    const createOrderBody: UserOrderCreateDTO = {
      userId: userId,
      orderType: userOrderRequestBody.orderType,
      status: UserOrderStatusEnum.PLACED,
      subTotalAmount: userOrderRequestBody.subTotalAmount,
      discountAmount: userOrderRequestBody.discountAmount,
      gstAmount: userOrderRequestBody.gstAmount,
      finalAmount:
        userOrderRequestBody.subTotalAmount -
        userOrderRequestBody.discountAmount +
        userOrderRequestBody.gstAmount, // Calculate the order final amount
    };

    // Retrieve user's details using userId to ensure the user exists
    const userDetails = await UserDetailService.getUserById(userId);
    if (!userDetails.count) {
      throw new Error(`User not found with userId: ${userId}`);
    }

    // Prepare the userEmail from userDetails
    let userEmail = userDetails[0].emailList.primary;

    // Order details to hold the created or retrieved order details
    let orderDetails: DbUserOrderDto;

    // If the order is present, retrieve the order details for the given "orderId"
    if (userOrderRequestBody.orderId) {
      orderDetails = await this.getOrderByOrderId(
        userEmail,
        userOrderRequestBody.orderType,
        userOrderRequestBody.orderId
      );
    }
    // Otherwise, create a new order and order products in the Worko database
    else {
      // Create the Order in the Worko Database
      orderDetails = await userOrderDao.create(userEmail, createOrderBody);
      global.logger.info("OrderCreated", orderDetails);

      // Create Order Products in the Worko Database
      await userOrderProductServiceObj.createOrderProducts(
        userEmail,
        orderDetails.id,
        userOrderRequestBody.products
      );
    }

    // ===========================================================================================
    // Create Order Transaction in the Worko Database and Payment Gateway
    // ===========================================================================================

    // Prepare Order Transaction Details to create an entry in the Worko Database
    const orderTransactionBody: UserOrderTransactionCreateDTO = {
      orderId: orderDetails.id,
      pgatewayProvider: userOrderRequestBody.pgatewayProvider,
      subTotalAmount: orderDetails.subTotalAmount,
      discountAmount: orderDetails.discountAmount,
      gstAmount: orderDetails.gstAmount,
      finalAmount: orderDetails.finalAmount,
      userIpAddress: userOrderRequestBody.ipAddress,
      userAgent: userOrderRequestBody.userAgent,
    };

    // Create Order Transaction in the Worko Database
    const orderTransactionDetails =
      await UserOrderTransactionService.createOrderTransaction(
        userEmail,
        orderTransactionBody
      );
    global.logger.info("Order transaction", orderTransactionDetails);

    // Create Order Transaction in the Payment Gateway
    let workoPaymentOrderDetails = await workoPaymentLibrary.createOrder(
      userEmail,
      userOrderRequestBody,
      orderDetails,
      orderTransactionDetails,
      userOrderRequestBody.returnUrl
    );
    global.logger.info("workoPaymentOrderDetails", workoPaymentOrderDetails);

    // Update the order transaction with the payment gateway response
    const updatedOrderTransaction: UserOrderTransactionUpdateDTO = {
      pgatewayOrderId:
        workoPaymentOrderDetails.userOrderResponse.pgatewayOrderId,
      pgatewayOrderRequest:
        workoPaymentOrderDetails.gatewayOrderRequestPlainBody,
      pgatewayOrderResponse:
        workoPaymentOrderDetails.userOrderResponse.pgatewayOrderResponse,
    };
    global.logger.info("updatedOrderTransaction", updatedOrderTransaction);

    // Update the order transaction with the payment gateway response
    let orderTransactionResponse =
      await UserOrderTransactionService.updateOrderTransaction(
        userEmail,
        orderDetails.id,
        orderTransactionDetails.id,
        updatedOrderTransaction
      );
    global.logger.info("orderTransactionResponse", orderTransactionResponse);

    // Update the order status based on the gateway's order creation response
    const updatedOrder =
      await this.updateOrderStatusBasedOnGatewayOrderCreation(
        userEmail,
        orderDetails,
        workoPaymentOrderDetails.userOrderResponse.pgatewayOrderResponse,
        workoPaymentOrderDetails.userOrderResponse.pgatewayProvider
      );
    global.logger.info("updatedOrder", updatedOrder);

    // Return the results
    return workoPaymentOrderDetails;
  }

  /**
   * Retrieves an order by its ID.
   *
   * @param {string} userEmail - The email of the user who placed the order.
   * @param {string}orderType - The type of the order.
   * @param {string} orderId - The ID of the order to retrieve.
   * @returns {Promise<DbUserOrderDto>} - A promise that resolves to the user order details.
   */
  async getOrderByOrderId(
    userEmail: string,
    orderType: string,
    orderId: string
  ): Promise<DbUserOrderDto> {
    return userOrderDao.getOrderByOrderId(userEmail, orderType, orderId);
  }

  /**
   * Updates the order status based on the order creation response from the payment gateway.
   *
   * @param {string} userEmail - The email of the user who placed the order.
   * @param {DbUserOrderDto} orderDetails - The current order details.
   * @param {BillDeskOrderCreateResponsePlainDTO | RazorpayOrderCreateResponsePlainDTO} pgatewayOrderResponse - The order creation response from the payment gateway.
   * @param {UserOrderPaymentGatewayProviderEnum} pgatewayProvider - The payment gateway provider.
   * @returns {Promise<DbUserOrderDto>} - A promise that resolves to the updated order details.
   */
  async updateOrderStatusBasedOnGatewayOrderCreation(
    userEmail: string,
    orderDetails: DbUserOrderDto,
    pgatewayOrderResponse:
      | BillDeskOrderCreateResponsePlainDTO
      | RazorpayOrderCreateResponsePlainDTO,
    pgatewayProvider: UserOrderPaymentGatewayProviderEnum
  ): Promise<DbUserOrderDto> {
    let updatedOrderStatus: UserOrderStatusEnum;

    // Check order status and based on the latest status from pgateway chnage the worko order statuses
    if (
      (pgatewayProvider === UserOrderPaymentGatewayProviderEnum.BILL_DESK &&
        (pgatewayOrderResponse as BillDeskOrderCreateResponsePlainDTO)
          .status === BillDeskOrderStatusEnum.ACTIVE) ||
      (pgatewayProvider === UserOrderPaymentGatewayProviderEnum.RAZORPAY &&
        (pgatewayOrderResponse as RazorpayOrderCreateResponsePlainDTO)
          .status === RazorpayOrderStatusEnum.CREATED)
    ) {
      updatedOrderStatus = UserOrderStatusEnum.INITIATED;
    } else {
      // For any other status, keep the order status as PLACED
      updatedOrderStatus = UserOrderStatusEnum.PLACED;
    }

    // Update the order in the database with the new status
    const updatedOrderDetails: UserOrderUpdateDTO = {
      status: updatedOrderStatus,
      pgatewayStatus: pgatewayOrderResponse.status,
    };

    // Update the order in the database and return the updated order
    return userOrderDao.update(
      userEmail,
      orderDetails.id,
      orderDetails.orderType,
      updatedOrderDetails
    );
  }

  /**
   * Updates the order status based on the transaction status from the payment gateway.
   *
   * @param {string} userEmail - The email of the user who placed the order.
   * @param {DbUserOrderDto} orderDetails - The current order details.
   * @param {DbUserOrderTransactionDto} orderTransactionResponse - The transaction response from the payment gateway.
   * @returns {Promise<DbUserOrderDto>} - A promise that resolves to the updated order details.
   */
  async updateOrderStatusBasedOnTransaction(
    userEmail: string,
    orderDetails: DbUserOrderDto,
    orderTransactionResponse: DbUserOrderTransactionDto
  ): Promise<DbUserOrderDto> {
    let updatedOrderStatus: UserOrderStatusEnum;

    // Determine the new order status based on the transaction status
    if (
      orderTransactionResponse.pgatewayTxnStatus ===
      BillDeskTransactionAuthStatusEnum.SUCCESSFUL ||
      orderTransactionResponse.pgatewayTxnStatus ===
      RazorpayTransactionStatusEnum.CAPTURED ||
      orderTransactionResponse.pgatewayTxnStatus ===
      RazorpayTransactionStatusEnum.AUTHORIZED
    ) {
      updatedOrderStatus = UserOrderStatusEnum.COMPLETED;
    } else if (
      orderTransactionResponse.pgatewayTxnStatus ===
      BillDeskTransactionAuthStatusEnum.PENDING ||
      orderTransactionResponse.pgatewayTxnStatus ===
      RazorpayTransactionStatusEnum.CREATED
    ) {
      updatedOrderStatus = UserOrderStatusEnum.PENDING;
    } else {
      // For any other status, including BillDeskTransactionAuthStatusEnum.FAILED, RazorpayTransactionStatusEnum.FAILED,
      // or any unknown status
      updatedOrderStatus = UserOrderStatusEnum.FAILED;
    }

    // Update the order in the database with the new status
    const updatedOrderDetails: UserOrderUpdateDTO = {
      status: updatedOrderStatus,
      pgatewayStatus: orderTransactionResponse.pgatewayTxnStatus,
    };

    // Update the order in the database and return the updated order
    return await userOrderDao.update(
      userEmail,
      orderDetails.id,
      orderDetails.orderType,
      updatedOrderDetails
    );
  }

  /**
   * processPgResponse
   *
   * This function processes the payment gateway response for a user order transaction.
   *
   * @param {string} userId - The unique identifier of the user.
   * @param {UserOrderProcessGatewayTransactionRequestDTO} gatewayResponseDto - The DTO containing the payment gateway response details.
   * @returns {Promise<{ orderTxn: DbUserOrderTransactionDto, processRes: UserOrderProcessGatewayTransactionResponseDTO }>} - A Promise containing the updated order transaction and the processed response.
   */
  async processPgResponse(
    userId: string,
    gatewayResponseDto: UserOrderProcessGatewayTransactionRequestDTO
  ): Promise<{
    orderTxn: DbUserOrderTransactionDto;
    processRes: UserOrderProcessGatewayTransactionResponseDTO;
  }> {
    // ===========================================================================================
    //  Retrieve user, order, and order transaction details
    // ===========================================================================================

    // Retrieve user's details using userId to ensure the user exists
    const userDetails = await UserDetailService.getUserById(userId);
    if (!userDetails.count) {
      throw new Error(`User not found with userId: ${userId}`);
    }

    // Prepare the userEmail from userDetails
    let userEmail = userDetails[0].emailList.primary;

    // Retrieve order details using userEmail, orderType, and orderId
    let orderDetails = await userOrderDao.getOrderByOrderId(
      userEmail,
      gatewayResponseDto.orderType,
      gatewayResponseDto.orderId
    );
    global.logger.info("orderDetails", orderDetails);

    // Retrieve order transaction details using userEmail, orderId, and orderTxnId
    let orderTxnDetails = await userOrderTransactionDao.get(
      userEmail,
      orderDetails.id,
      gatewayResponseDto.orderTxnId
    );
    global.logger.info("Order transaction details`", orderTxnDetails);

    // ===========================================================================================
    //  Process the payment gateway transaction response
    // ===========================================================================================

    // Process the payment gateway transaction response
    const processedResponse =
      await workoPaymentLibrary.processGatewayTransactionResponse(
        userEmail,
        orderDetails,
        orderTxnDetails,
        gatewayResponseDto
      );
    global.logger.info(
      "ProcessResponseDone",
      processedResponse.pgResponseDecrypted
    );

    //  ===========================================================================================
    //  Update the order transaction and return the response
    // ===========================================================================================

    // Prepare the updated order transaction details
    let updatedOrderTransaction: UserOrderTransactionUpdateDTO;
    if (
      processedResponse.pgatewayProvider ==
      UserOrderPaymentGatewayProviderEnum.BILL_DESK
    ) {
      // Prepare the updated order transaction details
      let billdeskTxnResponseDecrypted: BillDeskTransactionResponseDecryptedDTO =
        processedResponse.pgResponseDecrypted as BillDeskTransactionResponseDecryptedDTO;
      updatedOrderTransaction = {
        pgatewayTxnResponse: processedResponse.pgResponseDecrypted,
        pgatewayTxnId: billdeskTxnResponseDecrypted.transactionid,
        pgatewayTxnPaymentMethodType:
          billdeskTxnResponseDecrypted.payment_method_type,
        pgatewayTxnErrorType:
          billdeskTxnResponseDecrypted.transaction_error_type,
        pgatewayTxnErrorCode:
          billdeskTxnResponseDecrypted.transaction_error_code,
        pgatewayTxnErrorDesc:
          billdeskTxnResponseDecrypted.transaction_error_desc,
        pgatewayTxnStatus: billdeskTxnResponseDecrypted.auth_status,
      };

      // ===========================================================================================
      //  Update the order transaction
      // ===========================================================================================

      // Update the order transaction and log the response
      let orderTransactionResponse =
        await UserOrderTransactionService.updateOrderTransaction(
          userEmail,
          orderTxnDetails.orderId,
          orderTxnDetails.id,
          updatedOrderTransaction
        );
      global.logger.info("Order transaction", orderTransactionResponse);

      // ===========================================================================================
      //  Update the order and return the response
      // ===========================================================================================

      // Update the order status based on the transaction response
      const updatedOrder = await this.updateOrderStatusBasedOnTransaction(
        userEmail,
        orderDetails,
        orderTransactionResponse
      );
      global.logger.info("updatedOrder", updatedOrder);

      // Return the processed response
      return {
        orderTxn: orderTransactionResponse as DbUserOrderTransactionDto,
        processRes: processedResponse,
      };
    } else if (
      processedResponse.pgatewayProvider ==
      UserOrderPaymentGatewayProviderEnum.RAZORPAY
    ) {
      // Prepare the updated order transaction details
      let razorpayTxnResponseDecrypted: RazorpayTransactionResponseDecryptedDTO =
        processedResponse.pgResponseDecrypted as RazorpayTransactionResponseDecryptedDTO;
      updatedOrderTransaction = {
        pgatewayTxnResponse: processedResponse.pgResponseDecrypted,
        pgatewayTxnId: razorpayTxnResponseDecrypted.id,
        pgatewayTxnPaymentMethodType: razorpayTxnResponseDecrypted.method,
        pgatewayTxnErrorType: razorpayTxnResponseDecrypted.error_reason || "", // @todo review this and make sure appropriate value is being stored
        pgatewayTxnErrorCode: razorpayTxnResponseDecrypted.error_code || "",
        pgatewayTxnErrorDesc:
          razorpayTxnResponseDecrypted.error_description || "",
        pgatewayTxnStatus: razorpayTxnResponseDecrypted.status, // @todo review this and make sure appropriate value is being stored
      };

      // ===========================================================================================
      //  Update the order transaction
      // ===========================================================================================

      // Update the order transaction and log the response
      let orderTransactionResponse =
        await UserOrderTransactionService.updateOrderTransaction(
          userEmail,
          orderTxnDetails.orderId,
          orderTxnDetails.id,
          updatedOrderTransaction
        );
      global.logger.info("Order transaction", orderTransactionResponse);

      // ===========================================================================================
      //  Update the order and return the response
      // ===========================================================================================

      // Update the order status based on the transaction response
      const updatedOrder = await this.updateOrderStatusBasedOnTransaction(
        userEmail,
        orderDetails,
        orderTransactionResponse
      );
      global.logger.info("updatedOrder", updatedOrder);

      // Return the processed response
      return {
        orderTxn: orderTransactionResponse as DbUserOrderTransactionDto,
        processRes: processedResponse,
      };
    }
    // ===========================================================================================
    //  Handle unsupported payment gateway provider
    // ===========================================================================================

    // If the payment gateway provider is not handled, throw an error
    throw new Error("Unsupported payment gateway provider");
  }

  /**
   * Retrieves user orders based on the provided user email.
   *
   * @param {string} userEmail - The email address of the user.
   * @return {Promise<QueryResponse<DbUserOrderDto>>} A promise that resolves to an array of user orders.
   */
  async get(userEmail: string): Promise<QueryResponse<DbUserOrderDto>> {
    global.logger.info("Getting user orders", userEmail);
    return userOrderDao.get(userEmail);
  }
}

// Export defaults
export default new UserOrderService();
