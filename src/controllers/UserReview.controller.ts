// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load local DTOs
import { GetUserReceivedReviewRequestApiDto, UserReviewCreateApiDto, UserReviewCreateDto } from "../dtos/UserReview.dto";

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

            // Get UserId
            const userId = req.params.userId;

            // Validate the user input and throw a validation error if necessary
            let { error, value: reviewReceiverApiDto } = userReviewCreateApiDtoValidation.validate(requestBody, { abortEarly: false });
            if (error) {
                throw new RequestValidationError(error);
            }

            // create a new dto from the existing
            const userReviewCreateDto: UserReviewCreateDto = {
                ...reviewReceiverApiDto,
                ratingForUserId: userId,
            }

            // Retrieve user details by userId
            const userDetail = await userDetailService.getUserById(userId);
            if (!userDetail) {
                return res.status(HttpStatusCode.NOT_FOUND_404).json({ error: "User not found" });
            }

            // Extract email from userDetail
            const userEmail = userDetail[0].emailList.primary;

            // Create review as requested
            const result = await userReviewService.createReview(userEmail, userReviewCreateDto);

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
     * @returns {Promise<any>}
     */
    getUserReceivedReviews = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            // Get user email id from url path for whom review has to be retrived
            const userId = req.params.userId;

            // Construct the request body from the query parameters
            // @todo Review this to see , if validation has to be added
            const reviewFilters: GetUserReceivedReviewRequestApiDto = {
                ratingForUserType: req.query.ratingForUserType as UserType,
                reviewContext: req.query.reviewContext as (UserReviewEmpContext | UserReviewCandContext),
                referalId: req.query.referalId as string,
                masterServiceCode: req.query.masterServiceCode as MasterServiceCode,
                serviceReqId: req.query.serviceReqId as string
            };

            // Retrieve user details by userId
            const userDetail = await userDetailService.getUserById(userId);
            if (!userDetail.count) {
                return res.status(HttpStatusCode.NOT_FOUND_404).json({ error: "User not found" });
            }

            // Extract email from userDetail
            const userEmail = userDetail[0].emailList.primary;

            // Retrieve reviews based on the provided filter 
            let result = await userReviewService.getUserReceivedReviews(userEmail, reviewFilters);

            // Log information about the action
            global.logger.info("Get review received by user [controller]");

            // Send response with the review data
            return res.status(HttpStatusCode.OK_200).json(result);
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
            const userId = req.params.userId;
            // Retrieve user details by userId
            const userDetail = await userDetailService.getUserById(userId);
            if (!userDetail) {
                return res.status(HttpStatusCode.NOT_FOUND_404).json({ error: "User not found" });
            }

            // Extract email from userDetail
            const userEmail = userDetail[0].emailList.primary;

            // Create review as requested

            // Retrieve reviews based on the provided filter 
            let result = await userReviewService.getUserReviewRatingAverage(userEmail);

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