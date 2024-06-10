// Load the daos
import userOrderTransactionDao from "../daos/UserOrderTransaction.dao";

// Load the DTOs
import {
  UserOrderTransactionCreateDTO,
  UserOrderTransactionUpdateDTO,
} from "../dtos/UserOrderTransaction.dto";
import { DbUserOrderTransactionDto } from "../db/models/UserOrderTransaction.model";

/**
 * UserOrderTransactionService
 *
 * Service class for handling user order transactions.
 */
class UserOrderTransactionService {
  /**
   * createOrderTransaction
   *
   * Creates a new order transaction.
   *
   * @param {string} userEmail - The email of the user associated with the transaction.
   * @param {UserOrderTransactionCreateDTO} orderTransaction - The order transaction details.
   * @returns {Promise<DbUserOrderTransactionDto>} - A Promise containing the created order transaction details.
   */
  async createOrderTransaction(
    userEmail: string,
    orderTransaction: UserOrderTransactionCreateDTO
  ): Promise<DbUserOrderTransactionDto> {
    // Log the creation of the order transaction for debugging purposes
    global.logger.info("transaction id service create", orderTransaction);

    // Call the DAO to create the order transaction
    return userOrderTransactionDao.create(userEmail, orderTransaction);
  }

  /**
   * updateOrderTransaction
   *
   * Updates an order transaction.
   *
   * @param {string} email - The email of the user associated with the transaction.
   * @param {string} orderId - The ID of the order.
   * @param {string} orderTxnId - The ID of the order transaction.
   * @param {UserOrderTransactionUpdateDTO} updateOrderTransaction - The updated order transaction details.
   * @returns {Promise<DbUserOrderTransactionDto>} - A Promise containing the updated order transaction details.
   */
  async updateOrderTransaction(
    email: string,
    orderId: string,
    orderTxnId: string,
    updateOrderTransaction: UserOrderTransactionUpdateDTO
  ): Promise<DbUserOrderTransactionDto> {
    // Log the update of the order transaction for debugging purposes
    global.logger.info(
      "transaction id service update orderid and orderTxnId",
      orderId,
      orderTxnId,
      updateOrderTransaction
    );

    // Call the DAO to update the order transaction
    return userOrderTransactionDao.update(
      email,
      orderId,
      orderTxnId,
      updateOrderTransaction
    );
  }
}

// Export an instance of the UserOrderTransactionService
// This allows the service to be easily imported and used in other parts of the application.
export default new UserOrderTransactionService();