// Load the npm packages
import { Router } from "express";
import CreateOrderController from "../controllers/Order.controller";

const createOrderController = new CreateOrderController();

const OrderRouter = Router();

OrderRouter.post("/order", createOrderController.createOrder);
OrderRouter.post("/order/:id/gatewayres", createOrderController.gatewayRes);

export default OrderRouter;