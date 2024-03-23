// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load local DTOs
import { GetUserReceivedReviewRequestApiDto, UserReviewCreateApiDto } from "../dtos/UserReview.dto";

// Import Enum
import { UserReviewCandContext, UserReviewEmpContext, UserType } from "../enums/User.enum";
import { MasterServiceCode } from "../enums/MasterService.enum";

// Load the review service
import userReviewService from "../services/UserReview.service";
import userDetailService from "../services/UserDetail.service";

// Import schema
import { validateEmailField } from "../schemas/User.schema";
import { userReviewCreateApiDtoValidation } from "../schemas/UserReview.schema";

// Load local utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

/**
 * ReviewController
 *
 * Class to perform actions related to user reviews
 */
class UserReviewController {
    /**
     * createReview
     *
     * Create a new review for a provided user in request.
     *
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     */
    createReview = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Review request details
            const requestBody: UserReviewCreateApiDto = req.body;

            // Validate email format
            // reviewReceiverEmail: User's email address for whom the review is being created
            const { error: emailError, value: reviewReceiverEmail } = validateEmailField(req.params.emailId);
            if (emailError) {
                throw new RequestValidationError(emailError);
            }

            // Validate the user input and throw a validation error if necessary
            let { error, value: reviewReceiverApiDto } = userReviewCreateApiDtoValidation.validate(requestBody, { abortEarly: false });
            if (error) {
                throw new RequestValidationError(error);
            }

            // Get the user's detail for whom the review is being created
            const reviewReceiverDetail = await userDetailService.get(reviewReceiverEmail);

            // If the user does not exist, send a 404 response
            if (!reviewReceiverDetail) {
                return res.status(HttpStatusCode.NOT_FOUND_404).json({ error: "User not found" });
            }

            // Create review as requested
            const result = await userReviewService.createReview(reviewReceiverEmail, reviewReceiverApiDto);

            // Send response indicating success
            res.status(HttpStatusCode.CREATED_201).json(result);
        } catch (error: any) {
            // Pass the error to the error handling middleware
            next(error);
        }
    };

    /**
     * getUserReceivedReviews
     * 
     * Get all reviews received by the user based on provided filter.
     * 
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @returns {}
     */
    getUserReceivedReviews = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get user email id from url path for whom review has to be retrived
            const receiverEmailId = req.params.emailId;

            // Construct the request body from the query parameters
            // @todo Review this to see , if validation has to be added
            const reviewFilters: GetUserReceivedReviewRequestApiDto = {
                ratingForUserType: req.query.ratingForUserType as UserType,
                reviewContext: req.query.reviewContext as (UserReviewEmpContext | UserReviewCandContext),
                referalId: req.query.referalId as string,
                masterServiceCode: req.query.masterServiceCode as MasterServiceCode,
                serviceReqId: req.query.serviceReqId as string
            };

            // Validate emailId
            const { error, value } = validateEmailField(receiverEmailId);

            // If emailId is invalid, return a 400 Bad Request response
            if (error) {
                return res.status(HttpStatusCode.BAD_REQUEST_400).json({ error: "Invalid email format." });
            }

            // Check if the user exists with the given email address in the database
            const receiverUserDetails = await userDetailService.get(value);
            if (!receiverUserDetails.count) {
                return res.status(HttpStatusCode.NOT_FOUND_404).json({ error: "User not found" });
            }

            // Retrieve reviews based on the provided filter 
            let result = await userReviewService.getUserReceivedReviews(value, reviewFilters);

            // Log information about the action
            global.logger.info("Get review received by user [controller]");

            // Send response with the review data
            res.status(HttpStatusCode.OK_200).json(result);
        } catch (error: any) {
            next(error);
        }
    };

    /**
     * getUserReviewRatingAverage
     * 
     * Get all reviews received by the user based on provided filter.
     * 
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @returns {}
     */
    getUserReviewRatingAverage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get user email id from url path for whom review has to be retrived
            const receiverEmailId = req.params.emailId;

            // Validate emailId
            const { error, value } = validateEmailField(receiverEmailId);

            // If emailId is invalid, return a 400 Bad Request response
            if (error) {
                return res.status(HttpStatusCode.BAD_REQUEST_400).json({ error: "Invalid email format." });
            }

            // Check if the user exists with the given email address in the database
            const receiverUserDetails = await userDetailService.get(value);
            if (!receiverUserDetails.count) {
                return res.status(HttpStatusCode.NOT_FOUND_404).json({ error: "User not found" });
            }

            // Retrieve reviews based on the provided filter 
            let result = await userReviewService.getUserReviewRatingAverage(value);

            // Log information about the action
            global.logger.info("Get review received by user [controller]");

            // Send response with the review data
            res.status(HttpStatusCode.OK_200).json(result);
        } catch (error: any) {
            next(error);
        }
    };
}

export default UserReviewController;