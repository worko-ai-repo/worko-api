// Import the necessary npm packages
import { Router } from "express"; // Import the Router from the express package
import AdminController from "../controllers/Admin.controller"; 

// Create an instance of the AdminController
const adminController = new AdminController();

// Create a new Router instance for the admin routes
const AdminRouter = Router();
/**
 * This module defines a route for creating a free subscription for a user.
 * Note: This route is intended to be used only for one-time purposes, such as to add subscription for a missing user account.
 * It should not be used for any internal purposes or major subscription management tasks.
 */
// Define a POST route for adding a free subscription to a user
AdminRouter.post("/user/:id/subscription/free", adminController.addUserFreeSubscription);

// Export the AdminRouter so it can be used in other parts of the application
export default AdminRouter;
