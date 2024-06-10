// Import necessary packages
import { Request, Response, NextFunction } from "express";

// Import DTOs
import {
  UserOrderCreateRequestDTO,
  UserOrderProcessGatewayTransactionRequestDTO,
} from "../dtos/UserOrder.dto";

// Import local services
import UserOrderService from "../services/UserOrder.service";
import { userOrderProductServiceObj } from "../services/UserOrderProduct.service";
import UserDetailService from "../services/UserDetail.service";

// Import schemas
import {
  userOrderCreateApiDtoValidation,
  userOrderGatewayTransactionRequestDtoValidation
} from "../schemas/UserOrder.schema";

// Import error handling utilities
import { RequestValidationError } from "../utils/errors.util";

/**
 * UserOrderController
 *
 * Class to handle order-related actions.
 */
class UserOrderController {
  /**
   * createOrder
   *
   * This function handles the creation of a new user order.
   *
   * @param {Request} req - The incoming request object
   * @param {Response} res - The outgoing response object
   * @param {NextFunction} next - The next middleware function
   */
  createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract userId from request parameters
      let userId = req.params.userId;

      // Validate request body
      let requestBody: UserOrderCreateRequestDTO = req.body;
      let { error, value: requestBodyObject } = userOrderCreateApiDtoValidation.validate(requestBody, {
        abortEarly: false,
      });
      if (error) {
        throw new RequestValidationError(error);
      }

      // Review and update the request body object with additional information
      requestBodyObject.ipAddress = req.ip as string;
      requestBodyObject.userAgent = req.headers["user-agent"] as string;

      // Create Order
      const createOrderResponse = await UserOrderService.createOrder(
        userId,
        requestBodyObject
      );

      // Send response
      res.status(200).json(createOrderResponse);
    } catch (error) {
      // Pass the error to the next error handler
      next(error);
    }
  };

  /**
   * gatewayRes
   *
   * This function handles the response from the payment gateway.
   *
   * @param {Request} req - The incoming request object
   * @param {Response} res - The outgoing response object
   * @param {NextFunction} next - The next middleware function
   */
  gatewayRes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract userId from request parameters
      let userId = req.params.userId;

      // Validate request body
      let requestBody: UserOrderProcessGatewayTransactionRequestDTO = req.body;
      let { error, value: requestBodyObject } = userOrderGatewayTransactionRequestDtoValidation.validate(requestBody, {
        abortEarly: false,
      });
      if (error) {
        throw new RequestValidationError(error);
      }

      // Process the response from the payment gateway
      let gatewayResponse = await UserOrderService.processPgResponse(
        userId,
        requestBodyObject
      );

      // Send response
      res.status(200).json(gatewayResponse);
    } catch (error) {
      // Pass the error to the next error handler
      next(error);
    }
  };

  /**
   * getUserOrders
   *
   * This function retrieves the details of a specific order for a given user.
   * 
   * @todo add pagination to the response
   *
   * @param {Request} req - The incoming request object
   * @param {Response} res - The outgoing response object
   * @param {NextFunction} next - The next middleware function
   */
  getUserOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract userId and orderId from request parameters
      let userId = req.params.userId;

      // Retrive UserDetails and validate it
      let userDetails = await UserDetailService.getUserById(userId);
      if (!userDetails.count) {
        throw new Error(`User not found with userId: ${userId}`);
      }

      // extract the userEmail  from userDetails
      let userEmail = userDetails[0].emailList.primary;

      // Get order details
      const userOrderDetails = await UserOrderService.get(userEmail);
      if (!userOrderDetails.count) {
        throw new Error(`Order Not Found for User: ${userEmail}`);
      } 
           
      // create "userOrderAndProductDetails" and map the order id to get the orderDetails's product details and retrun boths
      const userOrderAndProductDetails = await Promise.all(
        userOrderDetails.map(async (order) => {
          const orderProducts = await userOrderProductServiceObj.getUserOrderProducts(userEmail, order.id);
          return {
            ...order,
            products: orderProducts
          };
        })
      );

      // Send response
      res.status(200).json(userOrderAndProductDetails);
    } catch (error) {
      // Pass the error to the next error handler
      next(error);
    }
  };
}

export default UserOrderController;