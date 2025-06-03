// import express types
import { Router } from 'express';

// Import controllers
import BlogController from "../controllers/Blog.controller";

// Create the instance of BlogController
const blogController: BlogController = new BlogController();

// Create a new mountable router for the Blog APIs
const BlogRouter: Router = Router(); 

/**
 * createBlog
 * 
 * @authorisedRoles ["admin"]
 */
BlogRouter.post('/', blogController.createBlog);

/**
 * getBlogById
 * 
 * @authorisedRoles ["admin", "public", "loggedInUser"]
 */
BlogRouter.get('/:id', blogController.getBlogById);

/**
 * getAllBlogsByFilterOptions
 * 
 * @authorisedRoles ["admin", "public", "loggedInUser"]
 */
BlogRouter.get('/', blogController.getAllBlogsByFilterOptions);

/**
 * updateBlogById
 * 
 * @authorisedRoles ["admin"]
 */
BlogRouter.patch('/:id', blogController.updateBlogById);

// Export BlogRouter
export default BlogRouter;