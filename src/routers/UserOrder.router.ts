// Load the npm packages
import { Router } from "express";

// Import Controllers
import UserOrderController from "../controllers/UserOrder.controller";

// Create a new instance of UserOrderController class
const userOrderController = new UserOrderController();

// Create a router instance
const UserOrderRouter = Router();

/**
 * Endpoint for creating a new order
 * 
 * @authorisedRoles ["admin"]
 */
UserOrderRouter.post("/:userId/order/create", userOrderController.createOrder);

/**
 * Endpoint for receiving gateway response
 * 
 * @authorisedRoles ["admin"]
 */
UserOrderRouter.post("/:userId/order/gatewayres", userOrderController.gatewayRes);

/**
 * Endpoint for getting order details
 * 
 * @authorisedRoles ["admin"]
 */
UserOrderRouter.get("/:userId/order", userOrderController.getUserOrders);

export default UserOrderRouter;
