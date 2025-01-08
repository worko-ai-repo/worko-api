// Load the npm packages
import { Router } from "express";

// Import controllers
import FileController from "../controllers/File.controller";

// Create instance of the "FileController" class to read the methods/functions from the same.
const fileController = new FileController();

// Route to hold the routes (CRUD, etc) related to File operations
const FileRouter = Router();

/**
 * Generate pre-signed url to upload the file to aws s3
 * 
 * Sample request URL On `dev` server: https://api.dev.worko.work/file/gsu2u/USER_RESUME
 * 
 * @authorisedRoles ["public"]
 */
FileRouter.post(
  "/gsu2u/:resourceKey",
  fileController.generatePreSignedUrlsToUpload
);

/**
 * Get the pre-signed URL to view the object/file
 * 
 * @todo, update the route "/gsu2v/:resourceKey"; 
 * and expect the other required information in the request query/body.
 * 
 * @authorisedRoles ["public"]
 */
FileRouter.get(
  "/:id/:cloudFileName/:resourceKey",
  fileController.generatePreSignedUrlsToView
);

// Export the "FileRouter"
export default FileRouter;
