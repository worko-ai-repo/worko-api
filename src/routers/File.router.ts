// Load the npm packages
import { Router } from "express";

// Import controllers
import FileController from "../controllers/File.controller";

// Create instance of the "FileController" class to read the methods/functions from the same.
const fileController = new FileController();

// Route to hold the routes (CRUD, etc) related to File operations
const FileRouter = Router();

// Generate pre-signed url to upload the file to aws s3
FileRouter.post(
  "/gsu2u/:resourceKey",
  fileController.generatePreSignedUrlsToUpload
);

// Get the pre-signed URL to view the object/file
FileRouter.get(
  "/:userId/:cloudFileName/:resourceKey",
  fileController.generatePreSignedUrlsToView
);

// Export the "FileRouter"
export default FileRouter;
