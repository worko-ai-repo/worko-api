// Import Dynamoose types
import { ObjectType } from 'dynamoose/dist/General';

// Load the local Daos 
import userOrderProductDao from '../daos/UserOrderProduct.dao';

// Load the local Dtos and models
import {  UserOrderProductCreateRequestDTO } from '../dtos/UserOrderProduct.dto';

// Load the local models
import { DbUserOrderProductDto } from '../db/models/UserOrderProduct.model';
import { QueryResponse } from 'dynamoose/dist/ItemRetriever';

/**
 * UserOrderProductService
 *
 * Service class for handling user order products.
 */
class UserOrderProductService {
  /**
   * createOrderProducts
   *
   * This function is responsible for creating new order products.
   * It takes in the product details, orderId, and userEmail as parameters.
   * It then constructs an array of objects containing product details and orderId,
   * calls the userOrderProductDao.createBatch method to insert the new order products into the database,
   * and returns an object containing any unprocessed items.
   *
   * @param {string} userEmail - The email of the user associated with the order.
   * @param {string} orderId - The ID of the order to which the products belong.
   * @param {UserOrderProductCreateRequestDTO[]} productsRequestBody - The details of the order products to be created.
   * @returns {Promise<{ unprocessedItems: ObjectType[]; }>} - A Promise that resolves to an object containing unprocessed items, if any.
   * @throws {Error} - If an error occurs during the creation process, it will be thrown.
   */
  async createOrderProducts(
    userEmail: string,
    orderId: string,
    productsRequestBody: UserOrderProductCreateRequestDTO[]
  ): Promise<{ unprocessedItems: ObjectType[] }> {
    // Map over the productsRequestBody to prepare the order product objects.
    // Each object will include the product details along with the orderId.
    let products = productsRequestBody.map(
      (product: UserOrderProductCreateRequestDTO) => {
        return {
          ...product,
          orderId: orderId,
        };
      }
    );

    // Create the order products using the DAO's createBatch method.
    // Pass the userEmail and the array of product objects.
    return userOrderProductDao.createBatch(userEmail, products);
  }

  /**
   * Retrieves the user order products for a given user email and order ID.
   *
   * @param {string} userEmail - The email of the user associated with the order.
   * @param {string} orderId - The ID of the order to retrieve the products for.
   * @return {Promise<QueryResponse<DbUserOrderProductDto>>} A Promise that resolves to a QueryResponse containing the user order products.
   */
  async getUserOrderProducts(
    userEmail: string,
    orderId: string
  ): Promise<QueryResponse<DbUserOrderProductDto>> {
    global.logger.info("Getting user order products", userEmail, orderId);
    return userOrderProductDao.getUserOrderProducts(userEmail, orderId);
  }
}

// Create an instance of UserOrderProductService.
const userOrderProductServiceObj = new UserOrderProductService();

// Export the service class and the instance for use in other parts of the application.
export { UserOrderProductService, userOrderProductServiceObj };