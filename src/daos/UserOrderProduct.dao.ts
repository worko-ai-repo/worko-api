// Load the base DAO
import BaseDao from "./Base.dao";

// Load the local model
import { DbUserOrderProductDto, UserOrderProductModel } from "../db/models/UserOrderProduct.model";

// Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";

// Load DTOs and other packages
import { UserOrderProductCreateDTO } from "../dtos/UserOrderProduct.dto";
import { ObjectType } from "dynamoose/dist/General";
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// UserOrderProductDao class implementing the BaseDao interface
class UserOrderProductDao implements BaseDao {
    // Define properties for table and index keys
    modelName = "userOrder";
    partitianKey = "USR#EML#{primaryEmail}";
    sortKeys = {
        SK_ID: "ORDER#{orderId}#PRDCT#{id}"
    };
    GSI1PK: string = "ORDER#PRDCT";
    GSI1SK = "ID#{id}";

    /**
     * create
     *
     * Creates a new order product.
     *
     * @param {string} userEmail - The email address of the user associated with the order.
     * @param {UserOrderProductCreateDTO} createOrderProduct - The details of the order product to be created.
     * @returns {Promise<DbUserOrderProductDto>} - A Promise that resolves to the created order product.
     * @throws {Error} - If an error occurs during the creation process, it will be thrown.
     */
    async create(userEmail: string, createOrderProduct: UserOrderProductCreateDTO): Promise<DbUserOrderProductDto> {
        // Log the creation process for debugging purposes
        global.logger.info("Create user order product [DAO]");

        // Generate a unique ID for the order product
        const id = UlidService.getUlidId();

        // Prepare the details for creating the order product
        const createOrderDetails = {
            ...createOrderProduct,
            id: id,
            PK: this.partitianKey.strtr({ "{primaryEmail}": userEmail }),
            SK: this.sortKeys.SK_ID.strtr({ "{orderId}": createOrderProduct.orderId, "{id}": id }),
            GSI1PK: this.GSI1PK,
            GSI1SK: this.GSI1SK.strtr({ "{id}": id }),
        };

        // Create the order product 
        return UserOrderProductModel.create(createOrderDetails);
    }

    /**
     * createBatch
     *
     * Creates multiple order products in batch.
     *
     * @param {string} userEmail - The email address of the user associated with the order products.
     * @param {UserOrderProductCreateDTO[]} productsRequestBody - The details of the order products to be created.
     * @returns {Promise<{ unprocessedItems: ObjectType[]; }>} - A Promise that resolves to an object containing any unprocessed items.
     */
    async createBatch(
        userEmail: string,
        productsRequestBody: UserOrderProductCreateDTO[]
    ): Promise<{ unprocessedItems: ObjectType[]; }> {
        // Log the creation process for debugging purposes
        global.logger.info("Create user order products in batch [DAO]");

        // Prepare the product details as needed to create entries in the database
        let productsBody = productsRequestBody.map((product: UserOrderProductCreateDTO) => {
            // Generate a unique ID for the order product
            const productId = UlidService.getUlidId();

            // Prepare the product details as needed to create entries in the database
            return {
                ...product,
                id: productId,
                PK: this.partitianKey.strtr({
                    "{primaryEmail}": userEmail
                }),
                SK: this.sortKeys.SK_ID.strtr({
                    "{orderId}": product.orderId,
                    "{id}": productId
                }),
                GSI1PK: this.GSI1PK,
                GSI1SK: this.GSI1SK.strtr({
                    "{id}": productId
                }),
            }
        });

    // Create the order products
    return UserOrderProductModel.batchPut(productsBody);
  }
  
  /**
   * Retrieves a user order product based on the provided user email and order ID.
   * 
   * @param {string} userEmail - The email address of the user associated with the order.
   * @param {string} orderId - The ID of the order.
   * @return {Promise<QueryResponse<DbUserOrderProductDto>>} A Promise that resolves to the query response containing the user order product.
   */
  async getUserOrderProducts(
    userEmail: string,
    orderId: string
  ): Promise<QueryResponse<DbUserOrderProductDto>> {
    global.logger.info("Get user order product [DAO]");

    // Prepare PK 
    let PK = this.partitianKey.strtr({ "{primaryEmail}": userEmail });

    // Retrieve the user order product
    return UserOrderProductModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith(`ORDER#${orderId}#PRDCT#`)
      .exec();
  }
}

// Create an instance of UserOrderProductDao
const userOrderProductDao = new UserOrderProductDao();

// Export the instance for use in other modules
export default userOrderProductDao;
