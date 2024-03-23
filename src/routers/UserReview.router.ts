// Load the npm packages
import { Router } from "express";

// Load local packages
import UserReviewController from "../controllers/UserReview.controller"; // Updated controller name

// Create instance of the "UserReviewController" class to read the methods/functions from the same.
const userReviewController = new UserReviewController();

// Route to hold the routes (CRUD, etc) related to "UserReview" table
const UserReviewRouter = Router();

// Create review for the given/mentioned user in the ":emailId"
UserReviewRouter.post("/:emailId/review", userReviewController.createReview);

// Get reviews received by the given/mentioned user in the ":emailId"
UserReviewRouter.get("/:emailId/review/received", userReviewController.getUserReceivedReviews);

// Get review's rating average received by mentioned user in the ":emailId"
UserReviewRouter.get("/:emailId/review/rating", userReviewController.getUserReviewRatingAverage);

// Get reviews given by the given/mentioned user in the ":emailId"
// UserReviewRouter.get("/:emailId/review/given", userReviewController.getUserReceivedReviews);

export default UserReviewRouter;