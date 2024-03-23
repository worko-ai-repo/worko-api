// Import installed packages
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import daos
import userRatingAvgDao from "../daos/UserRatingAvg.dao";

// Import dtos
import { UserReviewCreateApiDto } from "../dtos/UserReview.dto";
import { UserRatingAvgCreateDTO } from "../dtos/UserRatingAvg.dto";

// Import enums
import { UserReviewCandContext, UserReviewEmpContext } from "../enums/User.enum";

// Import models
import { DbUserRatingAvgDto } from "../db/models/UserRatingAvg.model";

/**
 * UserRatingAvgService
 * 
 * Class responsible for managing user rating average related operations.
 */
class UserRatingAvgService {

    /**
     * getUserRatingAverages
     * 
     * Get the rating counts for the given user
     * 
     * @param email 
     * @returns {Promise<QueryResponse<DbUserRatingAvgDto>>}
     */
    async getUserRatingAverages(emailId: string): Promise<QueryResponse<DbUserRatingAvgDto>> {
        // get the ratings avreages for the user
        return userRatingAvgDao.getRatingAverages(emailId);
    }

    /**
     * createRatingAverages
     * 
     * @param {string} email - user email for whom the ratings is being created
     * @param {UserRatingAvgCreateDTO} ratingAverages - rating details that needs to be created
     * @returns {Promise<DbUserRatingAvgDto>}
     */
    async createRatingAverages(email: string, ratingAverages: UserRatingAvgCreateDTO): Promise<DbUserRatingAvgDto> {
        return userRatingAvgDao.createRatingAverages(email, ratingAverages);
    }

    /**
     * createDefaultRatingAverages
     * 
     * @param {string} email - user email for whom the ratings is being created
     * @returns {Promise<DbUserRatingAvgDto>}
     */
    async createDefaultRatingAverages(email: string): Promise<DbUserRatingAvgDto> {
        // Prepare the details ratings details that needs to be created
        const userRatingAvg: UserRatingAvgCreateDTO = {
            overallRating: 0,
            overallForCand: 0,
            overallForEmp: 0,
            contextWise: [],
        };

        // Create the ratings details
        return this.createRatingAverages(email, userRatingAvg);
    }

    /**
     * updateRatingAverages
     * 
     * @param {string} email - user email for whom the ratings is being updated
     * @param {Partial<DbUserRatingAvgDto>} ratingAverages - rating details that needs to be updated
     * @returns {Promise<DbUserRatingAvgDto>}
     */
    async updateRatingAverages(email: string, ratingAverages: Partial<DbUserRatingAvgDto>): Promise<DbUserRatingAvgDto> {
        return userRatingAvgDao.updateRatingAverages(email, ratingAverages);
    }

    /**
  * calculateAndSaveRating
  * 
  * Calculate the new ratings by adding received ratings to already existing rating
  * 
  * @param {string} reviewReceiverEmail - Email of the user for whom the review is being created.
  * @param {UserReviewCreateApiDto} userReviewDTO - Review data
  */
    async calculateAndSaveRating(reviewReceiverEmail: string, userReviewDTO: UserReviewCreateApiDto) {
        // Get existing rating details for the user
        let getUserRatingAveragesRes = await this.getUserRatingAverages(reviewReceiverEmail);
        let ratingDetails: DbUserRatingAvgDto;

        // Check if rating details exist, otherwise create default
        if (getUserRatingAveragesRes.count) {
            ratingDetails = getUserRatingAveragesRes[0];
        } else {
            ratingDetails = await this.createDefaultRatingAverages(reviewReceiverEmail);
        }
        global.logger.info("User Review Data:", userReviewDTO);
        global.logger.info("Rating Details:", ratingDetails);

        let subContext = userReviewDTO.masterServiceCode;

        // get the matching context index to update the caculated details
        let contextIndex = ratingDetails.contextWise.findIndex(contextRating => {
            if (subContext) {
                return contextRating.context === userReviewDTO.reviewContext
                    && contextRating.subContext === subContext;
            }
            else {
                return contextRating.context = userReviewDTO.reviewContext;
            }
        });

        if (contextIndex !== -1) {
            ratingDetails.contextWise[contextIndex].sum += userReviewDTO.rating;
            ratingDetails.contextWise[contextIndex].len++;
            ratingDetails.contextWise[contextIndex].avg = ratingDetails.contextWise[contextIndex].sum / ratingDetails.contextWise[contextIndex].len;
        } else {
            ratingDetails.contextWise.push({
                context: userReviewDTO.reviewContext,
                subContext: subContext,
                sum: userReviewDTO.rating,
                len: 1,
                avg: userReviewDTO.rating,
            });
        }

        // Calculate overall averages for employee and candidate
        const empContextWiseRatings = ratingDetails.contextWise.filter(contextRating => Object.keys(UserReviewEmpContext).includes(contextRating.context));
        const empContextWiseRatingsAvg = empContextWiseRatings.length
            ? empContextWiseRatings.reduce((sum, current) => sum + current.avg, 0) / empContextWiseRatings.length
            : 0;

        const candContextWiseRatings = ratingDetails.contextWise.filter(contextRating => Object.keys(UserReviewCandContext).includes(contextRating.context));
        const candContextWiseRatingsAvg = candContextWiseRatings.length
            ? candContextWiseRatings.reduce((sum, current) => sum + current.avg, 0) / candContextWiseRatings.length
            : 0;

        // Calculate overall average
        const overallContextWiseRatingsAvg = (empContextWiseRatingsAvg + candContextWiseRatingsAvg) / 2;

        // Update the rating details in the database
        ratingDetails.overallRating = overallContextWiseRatingsAvg;
        ratingDetails.overallForEmp = empContextWiseRatingsAvg;
        ratingDetails.overallForCand = candContextWiseRatingsAvg;

        // Log the calculated ratings
        console.log("Calculated Ratings 2:", ratingDetails);

        // Update the calculated ratings in db
        return this.updateRatingAverages(reviewReceiverEmail, {
            overallRating: ratingDetails.overallRating,
            overallForEmp: ratingDetails.overallForEmp,
            overallForCand: ratingDetails.overallForCand,
            contextWise: ratingDetails.contextWise,
        });
    }

}

export default new UserRatingAvgService();
