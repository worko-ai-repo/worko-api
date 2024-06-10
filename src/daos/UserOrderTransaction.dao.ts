// Load the base DAO
import BaseDao from "./Base.dao";

// Load the local model
import {
  DbUserOrderTransactionDto,
  UserOrderTransactionModel,
} from "../db/models/UserOrderTransaction.model"; // Updated model import

// Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";

// Load DTOs and other packages
import {
  UserOrderTransactionCreateDTO,
  UserOrderTransactionUpdateDTO,
} from "../dtos/UserOrderTransaction.dto"; // Updated DTO import

/**
 * UserOrderTransactionDao
 *
 * UserOrderTransactionDao class implementing the BaseDao interface
 */
class UserOrderTransactionDao implements BaseDao {
  // Define the model name for the DAO
  modelName = "UserOrderTransaction";

  // Define the partition key template
  partitianKey = "USR#EML#{primaryEmail}";

  // Define sort key templates
  sortKeys = {
    SK_ID: "ORDER#{orderId}#TXN#{id}",
  };

  // Define Global Secondary Index (GSI) keys
  GSI1PK: string = "ORDER#TXN";
  GSI1SK = "ID#{id}";

  // Define the syntax for the Worko payment gateway order ID
  workoPgatewayOrderIdSyntax = "{workoOrderId}w{workoTxnId}";

  /**
   * create
   *
   * Creates a new order transaction.
   *
   * @param {string} userEmail - Email of the user
   * @param {UserOrderTransactionCreateDTO} createOrderTransaction - Order transaction details
   * @returns {Promise<DbUserOrderTransactionDto>} - Promise containing the created order transaction details
   */
  async create(
    userEmail: string,
    createOrderTransaction: UserOrderTransactionCreateDTO
  ): Promise<DbUserOrderTransactionDto> {
    // Log the start of the create operation
    global.logger.info("Create user order transaction [DAO]");

    // Generate a unique ID using ULID
    const id = UlidService.getUlidId();

    // Prepare the data for creating the order transaction
    const createOrderDetails = {
      ...createOrderTransaction,
      id: id,
      PK: this.partitianKey.strtr({
        "{primaryEmail}": userEmail,
      }),
      SK: this.sortKeys.SK_ID.strtr({
        "{orderId}": createOrderTransaction.orderId,
        "{id}": id,
      }),
      GSI1PK: this.GSI1PK,
      GSI1SK: this.GSI1SK.strtr({
        "{id}": id,
      }),
      workoPgatewayOrderId: this.workoPgatewayOrderIdSyntax.strtr({
        "{workoOrderId}": createOrderTransaction.orderId,
        "{workoTxnId}": id,
      }),
    };

    // Create the order transaction in the database using the model
    return UserOrderTransactionModel.create(createOrderDetails);
  }

  /**
   * get
   *
   * Retrieves the details of an order transaction.
   * 
   * @rename this to "getUserOrderTransactionByTxnId"
   *
   * @param {string} userEmail - Email of the user
   * @param {string} orderId - Order ID
   * @param {string} orderTxnId - Order transaction ID
   * @returns {Promise<DbUserOrderTransactionDto>} - Promise containing the order transaction details
   */
  async get(
    userEmail: string,
    orderId: string,
    orderTxnId: string
  ): Promise<DbUserOrderTransactionDto> {
    // Log the start of the get operation
    global.logger.info(
      "Retrieving the details from get order transaction [DAO]"
    );

    // Prepare the keys for the query
    const keys = {
      PK: this.partitianKey.strtr({
        "{primaryEmail}": userEmail,
      }),
      SK: this.sortKeys.SK_ID.strtr({
        "{orderId}": orderId,
        "{id}": orderTxnId,
      }),
    };

    // Log the keys used for the query
    global.logger.info("PK:", keys.PK);
    global.logger.info("SK:", keys.SK);

    // Retrieve the order transaction from the database using the model
    return UserOrderTransactionModel.get(keys);
  }

  /**
   * update
   *
   * Updates an existing order transaction.
   *
   * @param {string} email - Email of the user
   * @param {string} orderId - Order ID
   * @param {string} orderTxnId - Order transaction ID
   * @param {UserOrderTransactionUpdateDTO} orderTxnDetails - Updated order transaction details
   * @returns {Promise<DbUserOrderTransactionDto>} - Promise containing the updated order transaction details
   */
  async update(
    email: string,
    orderId: string,
    orderTxnId: string,
    orderTxnDetails: UserOrderTransactionUpdateDTO
  ): Promise<DbUserOrderTransactionDto> {
    // Log the start of the update operation
    global.logger.info(
      "Updating the details from User order transaction [DAO]"
    );
    // Prepare the keys for the update
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    const SK = this.sortKeys.SK_ID.strtr({
      "{orderId}": orderId,
      "{id}": orderTxnId,
    });

    // Update the order transaction in the database using the model
    return UserOrderTransactionModel.update(
      { PK: PK, SK: SK },
      orderTxnDetails
    );
  }
}

// Create an instance of UserOrderTransactionDao
const userOrderTransactionDao = new UserOrderTransactionDao();

// Export the instance for use in other parts of the application
export default userOrderTransactionDao;
