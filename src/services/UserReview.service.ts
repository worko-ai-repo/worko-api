// Import Local Packages
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import daos
import userReviewDao from "../daos/UserReview.dao";
import userRatingAvgDao from "../daos/UserRatingAvg.dao";

// Import DTOs
import { GetUserReceivedReviewRequestApiDto, UserReviewCreateApiDto } from "../dtos/UserReview.dto";

// Import Services
import UserRatingAvgService from "./UserRatingAvg.service";

// Import models 
import { DbUserReviewDto } from "../db/models/UserReview.model";
import { DbUserRatingAvgDto } from "../db/models/UserRatingAvg.model";

/**
 * UserReviewService
 * 
 * Class responsible for managing user review related operations.
 */
class UserReviewService {
    /**
     * createReview
     * 
     * Creates a new review for a user
     *
     * @param {string} reviewReceiverEmail - Email of the user for whom the review is being created.
     * @param {UserReviewCreateApiDto} userReviewDTO - Review data
     * @returns {Promise<DbUserReviewDto>} - A Promise that resolves to the created review object
     */
    async createReview(reviewReceiverEmail: string, userReviewDTO: UserReviewCreateApiDto): Promise<DbUserReviewDto> {
        // Create review
        const createdReview = await userReviewDao.createReview(reviewReceiverEmail, userReviewDTO);

        // Logger message for creating review
        global.logger.info("Creating review entry", {
            filePath: __filename,
            methodName: this.createReview.name,
            userEmail: reviewReceiverEmail,
            reviewData: userReviewDTO,
        });

        // Calculate and save the rating
        await UserRatingAvgService.calculateAndSaveRating(reviewReceiverEmail, userReviewDTO);

        // Return the created review details
        return createdReview;
    }

    /**
     * getUserReceivedReviews
     * 
     * Get reviews received by a user based on filters.
     * 
     * @param {string} emailId - Email ID of the user
     * @param {GetUserReceivedReviewRequestApiDto} reviewFilters - Request data
     * @returns { Promise<QueryResponse<DbUserReviewDto>>} - A Promise that resolves to the retrieved review objects
     */
    async getUserReceivedReviews(emailId: string, reviewFilters: GetUserReceivedReviewRequestApiDto): Promise<QueryResponse<DbUserReviewDto>> {
        // Logger message for retrieving reviews
        global.logger.info("Retrieving reviews received by user", {
            filePath: __filename,
            methodName: this.getUserReceivedReviews.name,
            userEmail: emailId,
            requestFilters: reviewFilters,
        });

        // Call the DAO method to retrieve reviews received by a user
        return userReviewDao.getUserReceivedReviews(emailId, reviewFilters);
    }

    /**
     * getUserReviewRatingAverage
     * 
     * Get the average rating for reviews received by a user.
     * 
     * @param {string} emailId - Email ID of the user
     * @returns {Promise<QueryResponse<DbUserRatingAvgDto>>} - A Promise that resolves to the retrieved average rating object
     */
    async getUserReviewRatingAverage(emailId: string): Promise<QueryResponse<DbUserRatingAvgDto>> {
        // Logger message for retrieving average rating
        global.logger.info("Retrieving average rating for reviews received by user", {
            filePath: __filename,
            methodName: this.getUserReviewRatingAverage.name,
            userEmail: emailId,
        });

        // Call the DAO method to retrieve average rating for reviews received by a user
        return userRatingAvgDao.getRatingAverages(emailId);
    }
}

// Export an instance of the UserReviewService class
export default new UserReviewService();
